import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/core.min.js";
import django from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/django.min.js";
import javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/javascript.min.js";
import xml from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/xml.min.js";
import css from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/css.min.js";
import json from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/json.min.js";
import python from "https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/python.min.js";

hljs.registerLanguage("django", django);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);

const aliases = {
  html: "xml",
  htm: "xml",
  xml: "xml",
  js: "javascript",
  jsx: "javascript",
  django: "django",
  template: "django",
  json: "json",
  py: "python",
  python: "python",
  css: "css",
};

function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export function highlightCode(source, language = "text") {
  const name = String(language).toLowerCase();
  const languageName = aliases[name];
  if (!languageName || name === "text" || name === "plaintext") {
    return escape(source);
  }
  return hljs.highlight(String(source), { language: languageName }).value;
}
