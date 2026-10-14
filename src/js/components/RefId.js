import { el } from "../dom.js";
import { toPersianDigits } from "../format.js";

// A Reference ID is an identifier, not an amount, so it gets no separators.
export function RefId({ refId, className = "" }) {
  return el("span", {
    dir: "ltr",
    class: `font-medium tabular-nums text-secondary-800 ${className}`,
    text: toPersianDigits(refId),
  });
}
