import { el } from "../dom.js";
import { Amount } from "./Amount.js";
import { Owner } from "./Avatar.js";
import { StatusBadge } from "./Badge.js";
import { DateTime } from "./DateTime.js";
import { Icon } from "./Icon.js";
import { RefId } from "./RefId.js";

const CELL = "px-4 py-3 text-start align-middle";

function SortHeader({ label, field, sort, order, onSort, width }) {
  const active = sort === field;
  const nextOrder = active && order === "desc" ? "asc" : "desc";
  return el(
    "th",
    { scope: "col", class: `${CELL} ${width} py-0`, "aria-sort": active ? (order === "asc" ? "ascending" : "descending") : "none" },
    [
      el(
        "button",
        {
          type: "button",
          class: `-mx-2 inline-flex h-11 items-center gap-1 rounded-md px-2 font-medium transition-colors hover:text-secondary-900 focus-visible:outline-2 focus-visible:outline-primary-900 ${active ? "text-primary-900" : ""}`,
          onClick: () => onSort(field, nextOrder),
        },
        [
          label,
          Icon({
            name: active ? (order === "asc" ? "arrow-up" : "arrow-down") : "arrows-up-down",
            className: `size-3.5 ${active ? "" : "opacity-40"}`,
          }),
        ],
      ),
    ],
  );
}

function PlainHeader({ label, width = "" }) {
  return el("th", { scope: "col", class: `${CELL} ${width} font-medium`, text: label });
}

export function TransactionRow(transaction) {
  return el("tr", { class: "transition-colors hover:bg-secondary-50" }, [
    el("td", { class: CELL }, RefId({ refId: transaction.refId })),
    el("td", { class: `${CELL} text-sm whitespace-nowrap text-secondary-700`, text: transaction.type }),
    el("td", { class: CELL }, Owner({ user: transaction.user })),
    el("td", { class: CELL }, StatusBadge({ status: transaction.status })),
    el("td", { class: CELL }, Amount(transaction)),
    el("td", { class: CELL }, DateTime({ timestamp: transaction.date })),
  ]);
}

export function TransactionTable({ transactions, sort, order, onSort, rows }) {
  // Fixed layout: column widths come from the headers, not from whichever rows are
  // showing, so they stay put across pages, filters, sorting and the loading skeleton.
  // The owner column takes what is left.
  return el("table", { class: "w-full min-w-[56rem] table-fixed border-collapse" }, [
    el("caption", { class: "sr-only", text: "فهرست تراکنش‌ها" }),
    el("thead", { class: "bg-secondary-50 text-xs text-secondary-500" }, [
      el("tr", { class: "border-b border-secondary-200" }, [
        PlainHeader({ label: "شماره پیگیری", width: "w-36" }),
        PlainHeader({ label: "نوع تراکنش", width: "w-44" }),
        PlainHeader({ label: "صاحب تراکنش" }),
        PlainHeader({ label: "وضعیت", width: "w-32" }),
        SortHeader({ label: "مبلغ", field: "price", sort, order, onSort, width: "w-44" }),
        SortHeader({ label: "تاریخ", field: "date", sort, order, onSort, width: "w-36" }),
      ]),
    ]),
    el("tbody", { class: "divide-y divide-secondary-100" }, rows ?? transactions.map(TransactionRow)),
  ]);
}
