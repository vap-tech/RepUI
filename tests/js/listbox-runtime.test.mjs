import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../../repui/static/repui/components/listbox/listbox.js", import.meta.url),
  "utf8",
);

test("Listbox runtime exposes the required explicit lifecycle", () => {
  assert.match(source, /export function mountListboxes/);
  assert.match(source, /refresh\(\)/);
  assert.match(source, /select\(index/);
  assert.match(source, /destroy\(\)/);
  assert.match(source, /new AbortController/);
});

test("Listbox runtime owns active, selected and ARIA state", () => {
  assert.match(source, /dataset\.active/);
  assert.match(source, /aria-selected/);
  assert.match(source, /aria-activedescendant/);
  assert.match(source, /aria-disabled/);
  assert.match(source, /pointermove/);
  assert.match(source, /keydown/);
});
