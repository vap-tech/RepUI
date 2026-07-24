const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const token = (kind, value) => `<span class="rui-code-token--${kind}">${escapeHtml(value)}</span>`;

const languageLabels = {
  html: 'HTML', css: 'CSS', js: 'JavaScript', javascript: 'JavaScript',
  json: 'JSON', bash: 'Bash', shell: 'Shell', django: 'Django',
  template: 'Django', text: 'Text', plaintext: 'Text'
};

const copyIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <rect x="8" y="8" width="11" height="11" rx="2"></rect>
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
  </svg>`;
const successIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="m5 12 4 4 10-10"></path>
  </svg>`;

function highlightTag(source) {
  const match = source.match(/^(<\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?>)$/);
  if (!match) return escapeHtml(source);
  const [, open, name, attributes, close] = match;
  let output = token('punctuation', open) + token('tag', name);
  let cursor = 0;
  const attributePattern = /([:\w-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/g;
  for (const attribute of attributes.matchAll(attributePattern)) {
    output += escapeHtml(attributes.slice(cursor, attribute.index));
    output += token('attr', attribute[1]);
    output += token('punctuation', attribute[2]);
    output += token('string', attribute[3]);
    cursor = attribute.index + attribute[0].length;
  }
  output += escapeHtml(attributes.slice(cursor));
  return output + token('punctuation', close);
}

export function highlightHtml(source) {
  const parts = String(source).split(/(<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>|<\/?[A-Za-z][^>]*>)/gi);
  return parts.map(part => {
    if (!part) return '';
    if (part.startsWith('<!--')) return token('comment', part);
    if (/^<!doctype/i.test(part)) return token('doctype', part);
    if (part.startsWith('<')) return highlightTag(part);
    return escapeHtml(part);
  }).join('');
}

const cssWord = /[-_a-zA-Z0-9.%#]/;
const cssAtRule = /^@(media|supports|layer|container|keyframes|font-face|import|charset|namespace|page|property)\b/i;

function readQuoted(source, start) {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === '\\') index += 2;
    else if (source[index] === quote) return index + 1;
    else index += 1;
  }
  return source.length;
}

export function highlightCss(source) {
  source = String(source);
  let output = '';
  let index = 0;
  let depth = 0;
  let expectingProperty = false;
  let inValue = false;

  while (index < source.length) {
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      output += token('comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    const char = source[index];
    if (char === '"' || char === "'") {
      const stop = readQuoted(source, index);
      output += token('string', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (char === '{') {
      output += token('punctuation', char);
      depth += 1;
      expectingProperty = true;
      inValue = false;
      index += 1;
      continue;
    }
    if (char === '}') {
      output += token('punctuation', char);
      depth = Math.max(0, depth - 1);
      expectingProperty = depth > 0;
      inValue = false;
      index += 1;
      continue;
    }
    if (char === ':') {
      output += token('punctuation', char);
      inValue = depth > 0;
      expectingProperty = false;
      index += 1;
      continue;
    }
    if (char === ';') {
      output += token('punctuation', char);
      inValue = false;
      expectingProperty = depth > 0;
      index += 1;
      continue;
    }
    if ('(),[]'.includes(char)) {
      output += token('punctuation', char);
      index += 1;
      continue;
    }

    if (/\s/.test(char)) {
      output += char;
      index += 1;
      continue;
    }

    let stop = index + 1;
    while (stop < source.length && cssWord.test(source[stop])) stop += 1;
    if (stop === index + 1 && !cssWord.test(char) && char !== '@' && char !== '!') {
      output += escapeHtml(char);
      index += 1;
      continue;
    }
    if (char === '@' || char === '!') {
      while (stop < source.length && /[-_a-zA-Z0-9]/.test(source[stop])) stop += 1;
    }

    const word = source.slice(index, stop);
    let kind = 'value';
    if (cssAtRule.test(word) || word === '!important') kind = 'keyword';
    else if (word.startsWith('--')) kind = 'variable';
    else if (depth === 0 || (!inValue && !expectingProperty)) kind = 'selector';
    else if (expectingProperty) kind = 'property';
    else if (/^-?(?:\d*\.)?\d+(?:%|[a-z]+)?$/i.test(word)) kind = 'number';
    else if (/^(?:var|calc|min|max|clamp|rgb|rgba|hsl|hsla|color-mix|url)$/i.test(word)) kind = 'function';

    output += token(kind, word);
    index = stop;
  }
  return output;
}

const djangoKeywords = new Set([
  'as', 'autoescape', 'block', 'comment', 'csrf_token', 'cycle', 'debug', 'else', 'elif',
  'empty', 'endautoescape', 'endblock', 'endcomment', 'endfilter', 'endfor', 'endif',
  'endspaceless', 'endverbatim', 'extends', 'filter', 'firstof', 'for', 'from', 'if',
  'ifchanged', 'include', 'load', 'now', 'regroup', 'spaceless', 'static', 'templatetag',
  'url', 'verbatim', 'widthratio', 'with'
]);
const djangoOperators = new Set(['and', 'or', 'not', 'in', 'is', 'by']);

function highlightDjangoExpression(source, kind) {
  if (kind === 'comment') return token('comment', source);
  const open = kind === 'variable' ? '{{' : '{%';
  const close = kind === 'variable' ? '}}' : '%}';
  const inner = source.slice(2, -2);
  let output = token('template-punctuation', open);
  let index = 0;
  let afterPipe = false;

  while (index < inner.length) {
    const char = inner[index];
    if (/\s/.test(char)) { output += char; index += 1; continue; }
    if (char === '"' || char === "'") {
      const stop = readQuoted(inner, index);
      output += token('string', inner.slice(index, stop));
      index = stop;
      afterPipe = false;
      continue;
    }
    if (char === '|') {
      output += token('template-punctuation', char);
      afterPipe = true;
      index += 1;
      continue;
    }
    if ('=:,.()[]'.includes(char)) {
      output += token('template-punctuation', char);
      index += 1;
      continue;
    }
    let stop = index + 1;
    while (stop < inner.length && /[\w.-]/.test(inner[stop])) stop += 1;
    const word = inner.slice(index, stop);
    let tokenKind = 'template-variable';
    if (afterPipe) tokenKind = 'template-filter';
    else if (djangoKeywords.has(word)) tokenKind = 'template-keyword';
    else if (djangoOperators.has(word)) tokenKind = 'template-operator';
    else if (/^(?:true|false|none|null)$/i.test(word)) tokenKind = 'template-literal';
    else if (/^-?\d+(?:\.\d+)?$/.test(word)) tokenKind = 'number';
    output += token(tokenKind, word);
    afterPipe = false;
    index = stop;
  }
  return output + token('template-punctuation', close);
}

export function highlightDjango(source) {
  source = String(source);
  const pattern = /({#[\s\S]*?#}|{{[\s\S]*?}}|{%[\s\S]*?%})/g;
  let output = '';
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    output += highlightHtml(source.slice(cursor, match.index));
    const part = match[0];
    if (part.startsWith('{#')) output += highlightDjangoExpression(part, 'comment');
    else if (part.startsWith('{{')) output += highlightDjangoExpression(part, 'variable');
    else output += highlightDjangoExpression(part, 'tag');
    cursor = match.index + part.length;
  }
  output += highlightHtml(source.slice(cursor));
  return output;
}

const highlighters = {
  html: highlightHtml,
  css: highlightCss,
  django: highlightDjango,
  template: highlightDjango
};

export function highlightCode(source, language = 'text') {
  const normalized = String(language || 'text').toLowerCase();
  return (highlighters[normalized] || escapeHtml)(String(source));
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function ensureLanguage(block, language) {
  let label = block.querySelector('.rui-code-block__language');
  if (!language && !label) return;
  if (!label) {
    label = document.createElement('span');
    label.className = 'rui-code-block__language';
    block.append(label);
  }
  if (!label.textContent.trim()) label.textContent = languageLabels[language] || language;
}

function ensureCopyButton(block) {
  let copy = block.querySelector('[data-rui-code-copy]');
  if (!copy) {
    copy = document.createElement('button');
    copy.className = 'rui-code-block__copy';
    copy.type = 'button';
    copy.dataset.ruiCodeCopy = '';
    block.append(copy);
  }
  copy.setAttribute('aria-label', copy.dataset.label || 'Copy code');
  copy.setAttribute('title', copy.dataset.label || 'Copy code');
  copy.innerHTML = copyIcon;
  return copy;
}

export function initCodeBlocks(root = document) {
  root.querySelectorAll('[data-rui-code-block]').forEach(block => {
    if (block.dataset.ruiInitialized === 'true') return;
    const code = block.querySelector('.rui-code-block__code');
    if (!code) return;
    const source = code.textContent.replace(/^\n|\n$/g, '');
    code.dataset.ruiSource = source;
    const language = (block.dataset.language || code.dataset.language || '').toLowerCase();
    ensureLanguage(block, language);
    code.innerHTML = highlightCode(source, language);
    const copy = ensureCopyButton(block);
    copy.addEventListener('click', async () => {
      try {
        await copyText(source);
        copy.dataset.state = 'success';
        copy.setAttribute('aria-label', copy.dataset.successLabel || 'Copied');
        copy.innerHTML = successIcon;
      } catch {
        copy.dataset.state = 'error';
        copy.setAttribute('aria-label', copy.dataset.errorLabel || 'Copy failed');
      }
      window.setTimeout(() => {
        delete copy.dataset.state;
        copy.setAttribute('aria-label', copy.dataset.label || 'Copy code');
        copy.innerHTML = copyIcon;
      }, 1600);
    });
    if (!block.hasAttribute('data-scroll')) block.dataset.scroll = 'true';
    if (!block.hasAttribute('data-height')) block.dataset.height = 'md';
    block.dataset.ruiInitialized = 'true';
  });
}
