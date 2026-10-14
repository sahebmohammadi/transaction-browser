import { test } from "node:test";
import assert from "node:assert/strict";
import { generateDb } from "../scripts/seed.js";

const ANCHOR = Date.UTC(2026, 9, 13, 12);

test("the seed produces 8 owners and 80 transactions, identically on every run", () => {
  const db = generateDb({ seed: 42, anchor: ANCHOR });
  assert.equal(db.users.length, 8);
  assert.equal(db.transactions.length, 80);
  assert.deepEqual(generateDb({ seed: 42, anchor: ANCHOR }), db);
  assert.notDeepEqual(generateDb({ seed: 7, anchor: ANCHOR }), db);
});

test("every owner has their own avatar URL", () => {
  const { users } = generateDb({ seed: 42, anchor: ANCHOR });
  for (const user of users) assert.match(user.avatar, /^https:\/\/api\.dicebear\.com\/11\.x\/notionists\/svg\?seed=/);
  assert.equal(new Set(users.map((u) => u.avatar)).size, users.length);
});

test("every Reference ID is unique and 9 or 10 digits long", () => {
  const { transactions } = generateDb({ seed: 42, anchor: ANCHOR });
  const refIds = transactions.map((t) => t.refId);
  assert.equal(new Set(refIds).size, refIds.length);
  for (const refId of refIds) assert.match(String(refId), /^\d{9,10}$/);
});

test("pending transactions only appear in the last 3 days; everything else is within the past year", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const { transactions } = generateDb({ seed: 42, anchor: ANCHOR });
  const pending = transactions.filter((t) => t.status === "pending");
  assert.ok(pending.length > 0, "expected some pending transactions");
  for (const t of pending) assert.ok(ANCHOR - t.date <= 3 * DAY);
  for (const t of transactions) assert.ok(t.date <= ANCHOR && ANCHOR - t.date <= 365 * DAY);
});

test("every transaction has a known owner, type and status and a positive whole amount", () => {
  const { users, transactions } = generateDb({ seed: 42, anchor: ANCHOR });
  const ownerIds = new Set(users.map((u) => u.id));
  const types = new Set(["افزایش اعتبار", "واریز حقوق", "بازگشت وجه", "برداشت از حساب", "انتقال کارت به کارت", "خرید", "پرداخت قبض", "کارمزد"]);
  for (const t of transactions) {
    assert.ok(ownerIds.has(t.userId), `unknown owner ${t.userId}`);
    assert.ok(types.has(t.type), `unknown type ${t.type}`);
    assert.ok(["success", "pending", "failed"].includes(t.status));
    assert.ok(Number.isInteger(t.price) && t.price > 0);
  }
  assert.equal(new Set(transactions.map((t) => t.type)).size, types.size, "every type should appear");
  assert.equal(new Set(transactions.map((t) => t.userId)).size, users.length, "every owner should have transactions");
});
