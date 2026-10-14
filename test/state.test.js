import { test } from "node:test";
import assert from "node:assert/strict";
import { readStateFromUrl, stateToQueryString } from "../src/js/state.js";

const DEFAULT_VIEW = { search: "", type: "", status: "", owner: "", sort: "date", order: "desc", page: 1 };

test("with no query string the view starts newest first on page 1 with nothing filtered", () => {
  assert.deepEqual(readStateFromUrl(""), DEFAULT_VIEW);
});

test("a filtered, sorted, paged view survives a reload through the URL", () => {
  const view = { search: "خرید", type: "خرید", status: "success", owner: "4", sort: "price", order: "asc", page: 2 };
  assert.deepEqual(readStateFromUrl(stateToQueryString(view)), view);
});

test("the default view leaves the URL clean, and only changed settings are written", () => {
  assert.equal(stateToQueryString(DEFAULT_VIEW), "");
  assert.equal(stateToQueryString({ ...DEFAULT_VIEW, status: "failed", page: 2 }), "?status=failed&page=2");
});

test("hand-edited URLs with unknown values fall back to the default for that setting", () => {
  const view = readStateFromUrl("?sort=id&order=sideways&page=-2&status=refunded&type=نامعلوم&owner=abc&search=۱۲");
  assert.deepEqual(view, { ...DEFAULT_VIEW, search: "۱۲" });
  assert.equal(readStateFromUrl("?page=2.5").page, 1);
});
