function escape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function token(kind, value) {
  return `<span class="rui-code-token--${kind}">${escape(value)}</span>`;
}

function highlightTag(source) {
  const match = source.match(/^(<\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?>)$/);
  if (!match) return escape(source);
  const [, open, name, attributes, close] = match;
  let output = token("punctuation", open) + token("tag", name);
  let cursor = 0;
  const pattern = /([:\w-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/g;
  for (const match of attributes.matchAll(pattern)) {
    output += escape(attributes.slice(cursor, match.index));
    output += token("attr", match[1]) + token("punctuation", match[2]);
    output += token("string", match[3]);
    cursor = match.index + match[0].length;
  }
  return output + escape(attributes.slice(cursor)) + token("punctuation", close);
}

export function highlightHtml(source) {
  return String(source).split(/(<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>|<\/?[A-Za-z][^>]*>)/gi)
    .map((part) => {
      if (!part) return "";
      if (part.startsWith("<!--")) return token("comment", part);
      if (/^<!doctype/i.test(part)) return token("doctype", part);
      return part.startsWith("<") ? highlightTag(part) : escape(part);
    }).join("");
}

export function highlightCss(source) {
  return escape(source).replace(/(--?[\w-]+|#[\da-f]{3,8}|\b\d+(?:\.\d+)?(?:px|rem|em|%|s)?\b|@[\w-]+)/gi, (value) => {
    const kind = value.startsWith("--") ? "variable"
      : value.startsWith("@") ? "keyword"
        : value.startsWith("#") || /^\d/.test(value) ? "number" : "property";
    return `<span class="rui-code-token--${kind}">${value}</span>`;
  });
}

export function highlightDjango(source) {
  return escape(source).replace(/(\{#[\s\S]*?#\}|\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\})/g, (value) => {
    const kind = value.startsWith("{#") ? "comment"
      : value.startsWith("{{") ? "template-variable" : "template-keyword";
    return `<span class="rui-code-token--${kind}">${value}</span>`;
  });
}

export function highlightCode(source, language = "text") {
  const value = String(language).toLowerCase();
  if (value === "html") return highlightHtml(source);
  if (value === "css") return highlightCss(source);
  if (value === "django" || value === "template") return highlightDjango(source);
  return escape(source);
}
