import { el } from "../dom.js";
import { Amount } from "./Amount.js";
import { Owner } from "./Avatar.js";
import { StatusBadge } from "./Badge.js";
import { DateTime } from "./DateTime.js";
import { RefId } from "./RefId.js";

export function TransactionCard(transaction) {
  return el("li", { class: "space-y-3 border-b border-secondary-100 p-4 last:border-b-0 md:odd:border-e" }, [
    el("div", { class: "flex items-start justify-between gap-3" }, [
      el("div", { class: "min-w-0 space-y-1" }, [
        el("p", { class: "text-sm font-semibold text-secondary-900", text: transaction.type }),
        el("p", { class: "flex items-center gap-1 text-xs text-secondary-500" }, [
          "پیگیری:",
          RefId({ refId: transaction.refId, className: "text-xs" }),
        ]),
      ]),
      StatusBadge({ status: transaction.status }),
    ]),
    el("div", { class: "flex items-end justify-between gap-3" }, [
      Owner({ user: transaction.user }),
      el("div", { class: "flex flex-col items-end gap-1 text-end" }, [
        Amount({ ...transaction, className: "text-base" }),
        DateTime({ timestamp: transaction.date, className: "items-end" }),
      ]),
    ]),
  ]);
}

export function TransactionCardList({ transactions, items }) {
  return el("ul", { class: "grid md:grid-cols-2" }, items ?? transactions.map(TransactionCard));
}
