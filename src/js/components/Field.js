import { el } from "../dom.js";
import { Icon } from "./Icon.js";

export const CONTROL =
  "h-10 w-full rounded-md bg-secondary-0 text-sm text-secondary-800 ring-1 ring-secondary-300 transition-shadow placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-900";

export const LABEL = "mb-1.5 block text-xs font-medium text-secondary-500";

function Label({ id, label }) {
  return el("label", { for: id, class: LABEL, text: label });
}

export function SearchInput({ id, label, placeholder, value, onInput, className = "" }) {
  const input = el("input", {
    id,
    type: "search",
    inputmode: "search",
    autocomplete: "off",
    placeholder,
    value,
    class: `${CONTROL} ps-10 pe-3`,
    onInput: (e) => onInput(e.target.value),
  });
  const field = el("div", { class: className }, [
    Label({ id, label }),
    el("div", { class: "relative" }, [
      el("span", { class: "pointer-events-none absolute inset-y-0 start-3 flex items-center text-secondary-400" }, [
        Icon({ name: "search", className: "size-4.5" }),
      ]),
      input,
    ]),
  ]);
  return { field, control: input };
}
