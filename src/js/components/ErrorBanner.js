import { el } from "../dom.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";

export function ErrorBanner({ title, description, onRetry }) {
  return el(
    "div",
    { role: "alert", class: "flex flex-col gap-3 rounded-lg bg-red-100 p-4 ring-1 ring-red-300 sm:flex-row sm:items-center" },
    [
      el("span", { class: "text-red-700" }, Icon({ name: "alert", className: "size-6" })),
      el("div", { class: "flex-1 space-y-0.5" }, [
        el("p", { class: "text-sm font-semibold text-red-800", text: title }),
        el("p", { class: "text-sm text-red-700", text: description }),
      ]),
      Button({
        variant: "secondary",
        onClick: onRetry,
        children: [Icon({ name: "refresh", className: "size-4" }), "تلاش دوباره"],
      }),
    ],
  );
}
