import { highlightCode } from "./highlight.js";

const instances = new WeakMap();
const COPY_ICON = '<svg class="rui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';
const CHECK_ICON = '<svg class="rui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"></path></svg>';
const ERROR_ICON = '<svg class="rui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="m10.3 3.7-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.3l-8-14a2 2 0 0 0-3.4 0Z"></path></svg>';

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches("[data-rui-code-block]")) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.("[data-rui-code-block]") || []));
  return [...new Set(nodes)];
}

class CodeBlockRuntime {
  constructor(element) {
    this.element = element;
    this.code = element.querySelector(".rui-code-block__code");
    if (!this.code) throw new Error("CodeBlock requires a code element");
    this.source = this.code.textContent;
    this.code.innerHTML = highlightCode(this.source, element.dataset.language);
    if (element.dataset.copy !== "false") {
      this.copy = document.createElement("button");
      this.copy.type = "button";
      this.copy.className = "rui-code-block__copy rui-icon-button";
      this.copy.innerHTML = COPY_ICON;
      this.copy.setAttribute("aria-label", "Copy code");
      element.append(this.copy);
      this.onCopy = () => this.copySource();
      this.copy.addEventListener("click", this.onCopy);
    }
    this.label = element.dataset.language;
    if (this.label) {
      const language = document.createElement("span");
      language.className = "rui-code-block__language";
      language.textContent = this.label;
      language.setAttribute("aria-hidden", "true");
      element.append(language);
      this.language = language;
    }
  }

  async copySource() {
    try {
      await navigator.clipboard.writeText(this.source);
      this.copy.setAttribute("aria-label", "Copied");
      this.copy.innerHTML = CHECK_ICON;
      this.copy.dataset.state = "success";
    } catch {
      this.copy.setAttribute("aria-label", "Copy failed");
      this.copy.innerHTML = ERROR_ICON;
      this.copy.dataset.state = "error";
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      this.copy.setAttribute("aria-label", "Copy code");
      this.copy.innerHTML = COPY_ICON;
      delete this.copy.dataset.state;
    }, 1600);
  }

  refresh() { return this; }

  destroy() {
    clearTimeout(this.resetTimer);
    this.copy?.removeEventListener("click", this.onCopy);
    this.copy?.remove();
    this.language?.remove();
    instances.delete(this.element);
  }
}

export function mountCodeBlocks(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new CodeBlockRuntime(element);
      instances.set(element, instance);
    }
    return instance;
  });
}
