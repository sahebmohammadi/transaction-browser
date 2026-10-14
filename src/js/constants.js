// json-server serves this page too (`-s .`), so the API lives on the same origin.
// When the page comes from another dev server (e.g. VS Code Live Server on :5500),
// call json-server directly; it allows cross-origin requests. Use `localhost`, not
// the page's host: json-server may listen on ::1 only, so 127.0.0.1 can't reach it.
const API_PORT = "3001";
export const API_BASE =
  globalThis.location && globalThis.location.port !== API_PORT
    ? `http://localhost:${API_PORT}`
    : "";

export const PAGE_SIZE = 10;

export const DIRECTION = Object.freeze({ IN: "in", OUT: "out" });

export const TRANSACTION_TYPES = Object.freeze([
  { label: "افزایش اعتبار", direction: DIRECTION.IN },
  { label: "واریز حقوق", direction: DIRECTION.IN },
  { label: "بازگشت وجه", direction: DIRECTION.IN },
  { label: "برداشت از حساب", direction: DIRECTION.OUT },
  { label: "انتقال کارت به کارت", direction: DIRECTION.OUT },
  { label: "خرید", direction: DIRECTION.OUT },
  { label: "پرداخت قبض", direction: DIRECTION.OUT },
  { label: "کارمزد", direction: DIRECTION.OUT },
]);

export const STATUSES = Object.freeze([
  { key: "success", label: "موفق" },
  { key: "pending", label: "در انتظار" },
  { key: "failed", label: "ناموفق" },
]);

export const SORTABLE_FIELDS = Object.freeze(["date", "price"]);

export function directionOf(type) {
  return TRANSACTION_TYPES.find((t) => t.label === type)?.direction ?? DIRECTION.OUT;
}

export function statusLabel(key) {
  return STATUSES.find((s) => s.key === key)?.label ?? key;
}
