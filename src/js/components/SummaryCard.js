import { el } from "../dom.js";
import { Digits } from "./Digits.js";
import { Icon } from "./Icon.js";

const TONES = {
  in: { icon: "arrow-down-left", badge: "bg-success/10 text-success" },
  out: { icon: "arrow-up-right", badge: "bg-error/10 text-error" },
  neutral: { icon: "list", badge: "bg-primary-50 text-primary-900" },
};

export function SummaryCard({ title, value, unit, hint, tone = "neutral", className = "" }) {
  const { icon, badge } = TONES[tone];
  return el("article", { class: `min-w-0 rounded-lg bg-secondary-0 p-4 shadow-xs ring-1 ring-secondary-200 sm:p-5 ${className}` }, [
    el("div", { class: "flex items-center justify-between gap-3" }, [
      el("h2", { class: "text-xs font-medium text-secondary-500 sm:text-sm", text: title }),
      el("span", { class: `inline-flex size-8 items-center justify-center rounded-md ${badge}` }, [
        Icon({ name: icon, className: "size-4" }),
      ]),
    ]),
    el("p", { class: "mt-3 flex flex-wrap items-baseline gap-x-1.5" }, [
      Digits({ text: value, className: "text-lg font-extrabold proportional-nums tracking-tight text-secondary-900 sm:text-xl lg:text-3xl" }),
      unit && el("span", { class: "text-xs text-secondary-400", text: unit }),
    ]),
    hint && el("p", { class: "mt-1 truncate text-xs text-secondary-500", text: hint }),
  ]);
}
