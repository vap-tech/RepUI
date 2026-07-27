import test from "node:test";
import assert from "node:assert/strict";
import { CollectionController } from "../../repui/static/repui/interaction/collection.js";

const items = (overrides = {}) => [
  { id: "one", value: "one", label: "One", ...overrides.one },
  { id: "two", value: "two", label: "Two", ...overrides.two },
  { id: "three", value: "three", label: "Three", ...overrides.three },
];

test("disabled items are excluded from navigation", () => {
  const collection = new CollectionController({ loop: true });
  collection.setItems(items({ two: { disabled: true } }));

  assert.equal(collection.first(), 0);
  assert.equal(collection.last(), 2);
  collection.setActive(0);
  assert.equal(collection.move(1), 2);
  assert.equal(collection.activeId, "three");
});

test("loop navigation wraps around available items", () => {
  const collection = new CollectionController({ loop: true });
  collection.setItems(items());
  collection.setActive(2);

  assert.equal(collection.move(1), 0);
  assert.equal(collection.activeId, "one");
  assert.equal(collection.move(-1), 2);
});

test("active id survives reordering during refresh", () => {
  const collection = new CollectionController();
  collection.setItems(items());
  collection.setActive(1);
  collection.setItems([items()[2], items()[1], items()[0]]);

  assert.equal(collection.activeId, "two");
  assert.equal(collection.activeIndex, 1);
});

test("selected ids are rebuilt and removed active falls back", () => {
  const collection = new CollectionController();
  collection.setItems(items({ three: { selected: true } }));
  collection.setActive(2);
  collection.setItems(items({ two: { selected: true } }).slice(0, 2));

  assert.deepEqual(collection.getState().selectedIds, ["two"]);
  assert.equal(collection.activeId, "one");
});

test("typeahead skips disabled items", () => {
  const collection = new CollectionController({ loop: true });
  collection.setItems(items({ two: { label: "Target", disabled: true }, three: { label: "Town" } }));

  assert.equal(collection.findByPrefix("t"), 2);
  assert.equal(collection.activeId, "one");
});
