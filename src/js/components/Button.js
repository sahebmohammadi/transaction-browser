import { el } from "../dom.js";

const VARIANTS = {
  primary: "bg-primary-900 text-white hover:bg-primary-800 focus-visible:outline-primary-900",
  secondary:
    "bg-secondary-0 text-secondary-700 ring-1 ring-secondary-300 hover:bg-secondary-50 focus-visible:outline-primary-900",
  ghost: "text-secondary-600 hover:bg-secondary-200/60 hover:text-secondary-900 focus-visible:outline-primary-900",
};

const SIZES = {
  md: "h-10 px-4 text-sm gap-2",
  icon: "size-9 text-sm justify-center",
};

export function Button({ label, variant = "secondary", size = "md", className = "", children, ...attrs }) {
  return el(
    "button",
    {
      type: "button",
      class: `inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`,
      ...attrs,
    },
    children ?? label,
  );
}
