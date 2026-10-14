import { el } from "../dom.js";

// A formatted number (from formatAmount) with its thousands separators muted, so the
// digits read as one shape. Built from text nodes, never innerHTML.
export function Digits({ text, className = "" }) {
  const parts = String(text)
    .split(/(,)/)
    .map((part) => (part === "," ? el("span", { class: "text-secondary-300", text: "," }) : part));
  return el("span", { dir: "ltr", class: className }, parts);
}
