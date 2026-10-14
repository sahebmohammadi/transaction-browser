import { el } from "../dom.js";
import { DIRECTION, directionOf } from "../constants.js";
import { formatAmount } from "../format.js";
import { Digits } from "./Digits.js";

// Amounts are stored positive; the Transaction Type decides the sign. Only the sign is
// colored, so a page of amounts stays calm and the direction still reads at a glance.
export function Amount({ type, price, className = "" }) {
  const incoming = directionOf(type) === DIRECTION.IN;
  return el("span", { class: `inline-flex items-baseline gap-1 whitespace-nowrap ${className}` }, [
    el("span", { dir: "ltr", class: "font-medium tabular-nums text-secondary-900" }, [
      el("span", { class: incoming ? "text-success" : "text-error", text: incoming ? "+" : "−" }),
      Digits({ text: formatAmount(price) }),
    ]),
    el("span", { class: "text-xs text-secondary-400", text: "تومان" }),
  ]);
}
