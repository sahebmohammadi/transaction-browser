import { el } from "../dom.js";
import { statusLabel } from "../constants.js";

const TONES = {
  success: "bg-success/10 text-success ring-success/25",
  pending: "bg-warning/10 text-warning ring-warning/30",
  failed: "bg-error/10 text-error ring-error/25",
};

export function StatusBadge({ status }) {
  return el(
    "span",
    {
      class: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONES[status]}`,
    },
    [el("span", { class: "size-1.5 rounded-full bg-current", "aria-hidden": "true" }), statusLabel(status)],
  );
}
