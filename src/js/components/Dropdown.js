import { el } from "../dom.js";
import { CONTROL, LABEL } from "./Field.js";
import { Icon } from "./Icon.js";

const GAP = 6;
const EDGE = 8;
const MAX_LIST_HEIGHT = 288;
const TYPEAHEAD_RESET_MS = 600;

// A select-only combobox (WAI-ARIA APG pattern) in place of the browser's
// <select>. Focus stays on the trigger and the options are reached through
// aria-activedescendant. `control.value` reads and writes the selection like
// a <select>'s value.
//
// By default the list floats: fixed-positioned against the trigger, and in the
// top layer as a popover where the browser supports one. `inline` puts it in
// the flow under the trigger instead, so it pushes the content below it down;
// a bottom sheet grows to fit it rather than having a list float over it.
// Either way the `hidden` attribute is what shows and hides the list: a
// browser without the Popover API ignores `popover` and would show it.
export function Dropdown({ id, label, value, options, onChange = () => {}, srOnlyLabel = false, inline = false, className = "" }) {
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  let selected = value;
  let active = -1;
  let typed = "";
  let typedTimer;

  const valueText = el("span", { class: "flex-1 truncate text-start" });
  const trigger = el(
    "div",
    {
      id,
      tabindex: "0",
      role: "combobox",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      "aria-controls": listId,
      "aria-labelledby": labelId,
      class: `${CONTROL} group flex cursor-pointer items-center gap-2 px-3 select-none aria-expanded:ring-2 aria-expanded:ring-primary-900`,
      onClick: () => (isOpen() ? close() : open()),
      onKeydown,
      onBlur: close,
    },
    [
      valueText,
      Icon({ name: "chevron-down", className: "size-4 text-secondary-400 transition-transform group-aria-expanded:rotate-180" }),
    ],
  );

  const items = options.map((option, index) =>
    el(
      "li",
      {
        id: `${id}-option-${index}`,
        role: "option",
        "aria-selected": "false",
        class:
          "group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-secondary-700 data-active:bg-secondary-100 data-active:text-secondary-900 aria-selected:font-medium aria-selected:text-primary-900",
        onPointermove: () => setActive(index, { scroll: false }),
        onClick: () => choose(index),
      },
      [
        el("span", { class: "flex-1 truncate", text: option.label }),
        Icon({ name: "check", className: "size-4 invisible group-aria-selected:visible" }),
      ],
    ),
  );

  const list = el(
    "ul",
    {
      id: listId,
      role: "listbox",
      popover: inline ? null : "manual",
      hidden: true,
      "aria-labelledby": labelId,
      class: `${inline ? "mt-1.5" : "fixed z-50 m-0 inset-auto overflow-y-auto shadow-lg"} overscroll-contain rounded-md bg-secondary-0 p-1 text-sm ring-1 ring-secondary-200 transition-[opacity,translate] duration-150 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none`,
      // Keep focus on the trigger while the pointer works the list.
      onPointerdown: (e) => e.preventDefault(),
    },
    items,
  );

  const field = el("div", { class: `${inline ? "scroll-my-5" : ""} ${className}` }, [
    el("span", { id: labelId, class: srOnlyLabel ? "sr-only" : LABEL, text: label, onClick: () => trigger.focus() }),
    trigger,
    list,
  ]);

  Object.defineProperty(trigger, "value", { get: () => selected, set: select });
  select(value);

  function select(next) {
    selected = next;
    const index = indexOf(next);
    items.forEach((item, i) => item.setAttribute("aria-selected", String(i === index)));
    valueText.textContent = options[Math.max(index, 0)]?.label ?? "";
  }

  function indexOf(v) {
    return options.findIndex((option) => option.value === v);
  }

  function isOpen() {
    return trigger.getAttribute("aria-expanded") === "true";
  }

  function open(startAt = Math.max(indexOf(selected), 0)) {
    if (isOpen()) return;
    trigger.focus();
    list.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    if (inline) {
      // The whole field: if it is taller than the room, its label and trigger stay in view.
      field.scrollIntoView({ block: "nearest" });
    } else {
      list.showPopover?.();
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", onScroll, true);
    }
    setActive(startAt);
    document.addEventListener("pointerdown", onOutside, true);
  }

  function close() {
    if (!isOpen()) return;
    if (!inline) list.hidePopover?.();
    list.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.removeAttribute("aria-activedescendant");
    items[active]?.removeAttribute("data-active");
    active = -1;
    document.removeEventListener("pointerdown", onOutside, true);
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", onScroll, true);
  }

  function choose(index) {
    const next = options[index].value;
    close();
    if (next === selected) return;
    select(next);
    onChange(next);
  }

  function setActive(index, { scroll = true } = {}) {
    if (index === active) return;
    items[active]?.removeAttribute("data-active");
    active = index;
    const item = items[index];
    item.setAttribute("data-active", "");
    trigger.setAttribute("aria-activedescendant", item.id);
    if (!scroll) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop - 4;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight + 4;
    }
  }

  // Under the trigger, or above it when there is more room there.
  function place() {
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;
    const wanted = Math.min(list.scrollHeight, MAX_LIST_HEIGHT);
    const up = below < wanted && above > below;
    list.style.left = `${rect.left}px`;
    list.style.width = `${rect.width}px`;
    list.style.maxHeight = `${Math.min(MAX_LIST_HEIGHT, up ? above : below)}px`;
    list.style.top = up ? "auto" : `${rect.bottom + GAP}px`;
    list.style.bottom = up ? `${window.innerHeight - rect.top + GAP}px` : "auto";
  }

  function onScroll(e) {
    if (e.target !== list) place();
  }

  function onOutside(e) {
    if (!field.contains(e.target)) close();
  }

  function onKeydown(e) {
    const last = items.length - 1;
    if (e.altKey && e.key === "ArrowUp" && isOpen()) return (e.preventDefault(), choose(active));

    const moves = {
      ArrowDown: () => Math.min(active + 1, last),
      ArrowUp: () => Math.max(active - 1, 0),
      Home: () => 0,
      End: () => last,
      PageDown: () => Math.min(active + 10, last),
      PageUp: () => Math.max(active - 10, 0),
    };

    if (!isOpen()) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return (e.preventDefault(), open());
      if (e.key === "Home" || e.key === "End") return (e.preventDefault(), open(moves[e.key]()));
    } else if (moves[e.key]) {
      return (e.preventDefault(), setActive(moves[e.key]()));
    } else if (e.key === "Enter" || (e.key === " " && !typed)) {
      return (e.preventDefault(), choose(active));
    } else if (e.key === "Escape") {
      // Cancelling the keydown keeps an enclosing <dialog> open.
      return (e.preventDefault(), close());
    } else if (e.key === "Tab") {
      return close();
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(e);
  }

  // Typing jumps to the next option whose label starts with what was typed.
  function typeahead(e) {
    e.preventDefault();
    clearTimeout(typedTimer);
    typedTimer = setTimeout(() => (typed = ""), TYPEAHEAD_RESET_MS);
    typed += e.key.toLowerCase();
    const from = typed.length === 1 ? active + 1 : Math.max(active, 0);
    const order = options.map((_, i) => (from + i) % options.length);
    const match = order.find((i) => options[i].label.toLowerCase().startsWith(typed));
    if (match === undefined) return;
    if (isOpen()) setActive(match);
    else open(match);
  }

  return { field, control: trigger };
}
