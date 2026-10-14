import { el } from "../dom.js";
import { formatDate } from "../format.js";

export function DateTime({ timestamp, className = "" }) {
  const { date, time } = formatDate(timestamp);
  return el("time", { datetime: new Date(timestamp).toISOString(), class: `inline-flex flex-col tabular-nums ${className}` }, [
    el("span", { class: "text-sm text-secondary-700", text: date }),
    el("span", { class: "text-xs text-secondary-400", text: time }),
  ]);
}
