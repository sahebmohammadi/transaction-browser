const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(value) {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[d]);
}

export function formatAmount(amount) {
  const grouped = String(Math.trunc(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return toPersianDigits(grouped);
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(text) {
  return String(text).replace(/[۰-۹٠-٩]/g, (d) => {
    const persian = PERSIAN_DIGITS.indexOf(d);
    return String(persian === -1 ? ARABIC_DIGITS.indexOf(d) : persian);
  });
}

export function formatDate(timestamp, { timeZone } = {}) {
  const at = new Date(timestamp);
  const date = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(at);
  const time = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(at);
  return { date, time };
}
