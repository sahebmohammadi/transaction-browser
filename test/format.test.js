import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAmount, formatDate, normalizeDigits } from "../src/js/format.js";

test("amount uses Persian digits with a Latin comma every three digits", () => {
  assert.equal(formatAmount(1250000), "۱,۲۵۰,۰۰۰");
  assert.equal(formatAmount(500), "۵۰۰");
  assert.equal(formatAmount(0), "۰");
});

test("search input digits typed on a Persian or Arabic keyboard become Latin digits", () => {
  assert.equal(normalizeDigits("۱۲۳٤٥٦"), "123456");
  assert.equal(normalizeDigits("خرید ۲"), "خرید 2");
});

test("dates show on the Jalali calendar with Persian digits", () => {
  // 2024-04-24 16:48:35 UTC is 1403/02/05 20:18 in Tehran
  const { date, time } = formatDate(1713977315961, { timeZone: "Asia/Tehran" });
  assert.equal(date, "۱۴۰۳/۰۲/۰۵");
  assert.equal(time, "۲۰:۱۸");
});
