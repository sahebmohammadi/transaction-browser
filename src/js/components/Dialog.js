import { el } from "../dom.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";

// Native <dialog>: open it with showModal() for the focus trap, Esc to close and
// the backdrop. A bottom sheet on phones, a centered panel from sm up.
//
// The dialog itself is a transparent frame exactly as tall as the small
// viewport (svh, measured with every bit of browser UI showing), and the panel
// sits at its bottom. Pinning the panel to the layout viewport instead lets
// mobile toolbars (Safari's bottom/floating bar) cover the action buttons.
export function Dialog({ id, title, children, footer }) {
  const titleId = `${id}-title`;
  const panel = el(
    "div",
    {
      class:
        "flex max-h-[85svh] w-full flex-col rounded-t-2xl bg-secondary-0 shadow-xl transition-[translate,opacity] duration-200 ease-out starting:translate-y-full motion-reduce:transition-none sm:max-w-md sm:rounded-xl sm:starting:translate-y-2 sm:starting:opacity-0",
    },
    [
      el("div", { class: "flex justify-center pt-2 sm:hidden", "aria-hidden": "true" }, [
        el("span", { class: "h-1 w-10 rounded-full bg-secondary-200" }),
      ]),
      el("div", { class: "flex items-center justify-between gap-3 px-4 pt-2 pb-3 sm:pt-4" }, [
        el("h2", { id: titleId, class: "text-base font-semibold text-secondary-900", text: title }),
        Button({
          variant: "ghost",
          size: "icon",
          "aria-label": "بستن",
          className: "-me-2",
          onClick: () => dialog.close(),
          children: Icon({ name: "x", className: "size-5" }),
        }),
      ]),
      el("div", { class: "flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-5" }, children),
      footer &&
        el(
          "div",
          {
            class:
              "flex items-center gap-3 border-t border-secondary-100 px-4 pt-3 pb-[max(--spacing(3),env(safe-area-inset-bottom))] sm:pb-4",
          },
          footer,
        ),
    ],
  );
  const dialog = el(
    "dialog",
    {
      id,
      "aria-labelledby": titleId,
      class:
        "m-0 h-svh max-h-none w-full max-w-none overflow-hidden bg-transparent text-secondary-800 backdrop:bg-secondary-900/50 backdrop:transition-opacity backdrop:duration-200 starting:backdrop:opacity-0 motion-reduce:backdrop:transition-none",
    },
    el("div", { class: "flex h-full flex-col items-center justify-end sm:justify-center sm:p-6" }, panel),
  );
  // Anything outside the panel is backdrop.
  dialog.addEventListener("click", (e) => {
    if (!panel.contains(e.target)) dialog.close();
  });
  return dialog;
}
