import { el } from "../dom.js";

const PALETTE = [
  "bg-primary-100 text-primary-900",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-error/10 text-error",
  "bg-secondary-200 text-secondary-700",
];

// The initial sits underneath the picture, so it shows while the image loads
// and stays if the image is missing or fails.
export function Avatar({ id = 0, name = "", src }) {
  const initial = name.trim().charAt(0) || "؟";
  const image =
    src &&
    el("img", {
      src,
      alt: "",
      loading: "lazy",
      decoding: "async",
      class: "absolute inset-0 size-full rounded-full object-cover",
      onError: (event) => event.currentTarget.remove(),
    });
  return el(
    "span",
    {
      class: `relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${PALETTE[id % PALETTE.length]}`,
      "aria-hidden": "true",
    },
    [initial, image],
  );
}

export function Owner({ user }) {
  return el("span", { class: "inline-flex max-w-full min-w-0 items-center gap-2" }, [
    Avatar({ id: user?.id, name: user?.name, src: user?.avatar }),
    el("span", { class: "truncate text-sm text-secondary-700", text: user?.name ?? "نامشخص" }),
  ]);
}
