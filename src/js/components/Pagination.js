import { el } from "../dom.js";
import { formatAmount, toPersianDigits } from "../format.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";

// 1 … 4 5 6 … 9: always the ends, plus a window around the current page.
function pageWindow(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap", p] : [p]));
}

export function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageButtons = pageWindow(page, pageCount).map((p) =>
    p === "gap"
      ? el("span", { class: "px-1 text-secondary-400", "aria-hidden": "true", text: "…" })
      : Button({
          size: "icon",
          variant: p === page ? "primary" : "ghost",
          label: toPersianDigits(p),
          "aria-label": `صفحه ${toPersianDigits(p)}`,
          "aria-current": p === page ? "page" : null,
          onClick: () => onPageChange(p),
        }),
  );

  return el("nav", { "aria-label": "صفحه‌بندی", class: "flex flex-col items-center gap-3 sm:flex-row sm:justify-between" }, [
    el("p", {
      class: "text-sm text-secondary-500",
      "aria-live": "polite",
      text: `نمایش ${formatAmount(from)}–${formatAmount(to)} از ${formatAmount(total)} تراکنش`,
    }),
    el("div", { class: "flex items-center gap-1" }, [
      Button({
        size: "icon",
        variant: "ghost",
        "aria-label": "صفحه قبل",
        disabled: page <= 1,
        onClick: () => onPageChange(page - 1),
        children: Icon({ name: "chevron-right", className: "size-4" }),
      }),
      el("div", { class: "hidden items-center gap-1 sm:flex" }, pageButtons),
      el("span", {
        class: "px-2 text-sm text-secondary-600 sm:hidden",
        text: `صفحه ${formatAmount(page)} از ${formatAmount(pageCount)}`,
      }),
      Button({
        size: "icon",
        variant: "ghost",
        "aria-label": "صفحه بعد",
        disabled: page >= pageCount,
        onClick: () => onPageChange(page + 1),
        children: Icon({ name: "chevron-left", className: "size-4" }),
      }),
    ]),
  ]);
}
