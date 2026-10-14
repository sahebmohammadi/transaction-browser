import { el } from "../dom.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";

export function EmptyState({ title, description, actionLabel, onAction }) {
  return el("div", { class: "flex flex-col items-center gap-3 px-6 py-14 text-center" }, [
    el("span", { class: "inline-flex size-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-400" }, [
      Icon({ name: "inbox", className: "size-6" }),
    ]),
    el("h3", { class: "text-base font-semibold text-secondary-800", text: title }),
    el("p", { class: "max-w-sm text-sm text-secondary-500", text: description }),
    onAction && Button({ label: actionLabel, onClick: onAction, className: "mt-1" }),
  ]);
}
