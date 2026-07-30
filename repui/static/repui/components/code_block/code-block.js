import { highlightCode } from "./highlight.js";

const instances = new WeakMap();

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
      this.copy.className = "rui-code-block__copy";
      this.copy.textContent = "Copy";
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
      this.copy.textContent = "Copied";
      this.copy.dataset.state = "success";
    } catch {
      this.copy.textContent = "Copy failed";
      this.copy.dataset.state = "error";
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      this.copy.textContent = "Copy";
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
