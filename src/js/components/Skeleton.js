import { el } from "../dom.js";

export function Skeleton({ className = "" }) {
  return el("span", { class: `block animate-pulse rounded-md bg-secondary-200 ${className}`, "aria-hidden": "true" });
}

export function SummaryCardSkeleton({ className = "" } = {}) {
  return el("div", { class: `rounded-lg bg-secondary-0 p-4 ring-1 ring-secondary-200 sm:p-5 ${className}` }, [
    el("div", { class: "flex items-center justify-between" }, [
      Skeleton({ className: "h-4 w-24" }),
      Skeleton({ className: "size-8" }),
    ]),
    Skeleton({ className: "mt-3 h-7 w-full max-w-36 lg:h-9" }),
    Skeleton({ className: "mt-2 h-3 w-28" }),
  ]);
}

export function TransactionRowSkeleton() {
  const cell = (className) => el("td", { class: "px-4 py-4" }, Skeleton({ className }));
  return el("tr", {}, [
    cell("h-4 w-24"),
    cell("h-4 w-28"),
    el("td", { class: "px-4 py-4" }, el("div", { class: "flex items-center gap-2" }, [
      Skeleton({ className: "size-8 rounded-full" }),
      Skeleton({ className: "h-4 w-20" }),
    ])),
    cell("h-5 w-16 rounded-full"),
    cell("h-4 w-24"),
    cell("h-8 w-20"),
  ]);
}

export function TransactionCardSkeleton() {
  return el("li", { class: "space-y-3 border-b border-secondary-100 p-4 last:border-b-0 md:odd:border-e" }, [
    el("div", { class: "flex justify-between" }, [Skeleton({ className: "h-4 w-32" }), Skeleton({ className: "h-5 w-16 rounded-full" })]),
    Skeleton({ className: "h-3 w-40" }),
    el("div", { class: "flex items-center justify-between" }, [
      el("div", { class: "flex items-center gap-2" }, [Skeleton({ className: "size-8 rounded-full" }), Skeleton({ className: "h-4 w-20" })]),
      Skeleton({ className: "h-5 w-28" }),
    ]),
  ]);
}
