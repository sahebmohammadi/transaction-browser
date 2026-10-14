import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFilterParams, buildListParams, summarize } from "../src/js/api.js";

const params = (searchParams) => Object.fromEntries(searchParams);

test("a digits-only search looks up the Reference ID", () => {
  assert.deepEqual(params(buildFilterParams({ search: "123" })), { refId_like: "123" });
});

test("a search typed with Persian digits still looks up the Reference ID", () => {
  assert.deepEqual(params(buildFilterParams({ search: " ۱۲۳ " })), { refId_like: "123" });
});

test("a text search looks up the Transaction Type, with regex characters made literal", () => {
  assert.deepEqual(params(buildFilterParams({ search: "خرید" })), { type_like: "خرید" });
  assert.deepEqual(params(buildFilterParams({ search: "a.b(" })), { type_like: "a\\.b\\(" });
});

test("type, status and owner dropdowns filter by exact value alongside the search", () => {
  const state = { search: "98", type: "خرید", status: "pending", owner: "3" };
  assert.deepEqual(params(buildFilterParams(state)), {
    refId_like: "98",
    type: "خرید",
    status: "pending",
    userId: "3",
  });
});

test("empty dropdowns ('All') add no filter", () => {
  assert.deepEqual(params(buildFilterParams({ search: "", type: "", status: "", owner: "" })), {});
});

test("the list request adds the sort, the page of 10 and the owner to the filters", () => {
  const state = { search: "", type: "", status: "failed", owner: "", sort: "price", order: "asc", page: 3 };
  assert.deepEqual(params(buildListParams(state)), {
    status: "failed",
    _sort: "price",
    _order: "asc",
    _page: "3",
    _limit: "10",
    _expand: "user",
  });
});

test("the Summary totals only Successful money in and out, but counts every Status", () => {
  const transactions = [
    { type: "افزایش اعتبار", price: 1_000_000, status: "success" },
    { type: "بازگشت وجه", price: 50_000, status: "success" },
    { type: "افزایش اعتبار", price: 9_999_999, status: "failed" },
    { type: "خرید", price: 200_000, status: "success" },
    { type: "کارمزد", price: 5_000, status: "pending" },
  ];
  assert.deepEqual(summarize(transactions), {
    totalIn: 1_050_000,
    totalOut: 200_000,
    count: 5,
    byStatus: { success: 3, pending: 1, failed: 1 },
  });
});
