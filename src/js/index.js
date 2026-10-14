import { fetchSummary, fetchTransactions, fetchUsers } from "./api.js";
import { PAGE_SIZE, STATUSES, TRANSACTION_TYPES } from "./constants.js";
import { debounce, el, replaceChildren } from "./dom.js";
import { formatAmount } from "./format.js";
import { DEFAULT_STATE, readStateFromUrl, stateToQueryString } from "./state.js";
import { Button } from "./components/Button.js";
import { Dialog } from "./components/Dialog.js";
import { Dropdown } from "./components/Dropdown.js";
import { EmptyState } from "./components/EmptyState.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import { SearchInput } from "./components/Field.js";
import { Icon } from "./components/Icon.js";
import { Pagination } from "./components/Pagination.js";
import {
  SummaryCardSkeleton,
  TransactionCardSkeleton,
  TransactionRowSkeleton,
} from "./components/Skeleton.js";
import { SummaryCard } from "./components/SummaryCard.js";
import { TransactionCardList } from "./components/TransactionCard.js";
import { TransactionTable } from "./components/TransactionTable.js";

const SEARCH_DEBOUNCE_MS = 300;

const SORT_OPTIONS = [
  { value: "date:desc", label: "جدیدترین" },
  { value: "date:asc", label: "قدیمی‌ترین" },
  { value: "price:desc", label: "بیشترین مبلغ" },
  { value: "price:asc", label: "کمترین مبلغ" },
];

const FILTER_KEYS = ["type", "status", "owner"];

// Matches Tailwind's lg breakpoint, where the filters sit inline instead of in the dialog.
const desktop = matchMedia("(min-width: 64rem)");

const regions = {
  summary: document.getElementById("summary"),
  filters: document.getElementById("filters"),
  error: document.getElementById("error"),
  results: document.getElementById("results"),
  pagination: document.getElementById("pagination"),
};

let state = readStateFromUrl(location.search);
let controls = null;
let inFlight = null;
// Whether real results (or the empty state) are on screen, as opposed to skeletons or an error.
let showingResults = false;
const searchLater = debounce((value) => setState({ search: value }), SEARCH_DEBOUNCE_MS);

const isFiltered = (s) => Object.keys(DEFAULT_STATE).some((key) => key !== "page" && s[key] !== DEFAULT_STATE[key]);

// Any change except moving between pages starts again from page 1.
function setState(patch) {
  state = { ...state, ...patch, page: "page" in patch ? patch.page : 1 };
  history.replaceState(null, "", `${location.pathname}${stateToQueryString(state)}`);
  syncControls();
  load();
}

function clearFilters() {
  // A search typed just before clicking must not land after the reset.
  searchLater.cancel();
  setState({ ...DEFAULT_STATE });
}

function renderFilters(users) {
  const typeOptions = [{ value: "", label: "همه انواع" }, ...TRANSACTION_TYPES.map((t) => ({ value: t.label, label: t.label }))];
  const statusOptions = [{ value: "", label: "همه وضعیت‌ها" }, ...STATUSES.map((s) => ({ value: s.key, label: s.label }))];
  const ownerOptions = [{ value: "", label: "همه افراد" }, ...users.map((u) => ({ value: String(u.id), label: u.name }))];

  const search = SearchInput({
    id: "search",
    label: "جستجو",
    placeholder: "شماره پیگیری یا نوع تراکنش…",
    value: state.search,
    onInput: searchLater,
    className: "sm:col-span-2 md:col-span-3 lg:col-span-4",
  });
  // Inline filters, desktop only: each change applies at once.
  const type = Dropdown({
    id: "filter-type",
    label: "نوع تراکنش",
    value: state.type,
    options: typeOptions,
    onChange: (value) => setState({ type: value }),
    className: "max-lg:hidden lg:col-span-3",
  });
  const status = Dropdown({
    id: "filter-status",
    label: "وضعیت",
    value: state.status,
    options: statusOptions,
    onChange: (value) => setState({ status: value }),
    className: "max-lg:hidden lg:col-span-2",
  });
  const owner = Dropdown({
    id: "filter-owner",
    label: "صاحب تراکنش",
    value: state.owner,
    options: ownerOptions,
    onChange: (value) => setState({ owner: value }),
    className: "max-lg:hidden lg:col-span-3",
  });
  // Cards have no column headers below lg, so sorting needs its own control there.
  const sort = Dropdown({
    id: "sort-mobile",
    label: "مرتب‌سازی",
    srOnlyLabel: true,
    value: `${state.sort}:${state.order}`,
    options: SORT_OPTIONS,
    onChange: (value) => {
      const [field, order] = value.split(":");
      setState({ sort: field, order });
    },
    className: "flex-1 sm:max-w-56 lg:hidden",
  });
  const clear = Button({
    variant: "ghost",
    className: "ms-auto max-lg:hidden",
    onClick: clearFilters,
    children: [Icon({ name: "x", className: "size-4" }), "پاک کردن فیلترها"],
  });

  // Below lg the filters live in a dialog. Its dropdowns hold a draft that only
  // reaches the state when the person applies them.
  const draft = {
    type: Dropdown({ id: "dialog-filter-type", label: "نوع تراکنش", value: state.type, options: typeOptions, inline: true }),
    status: Dropdown({ id: "dialog-filter-status", label: "وضعیت", value: state.status, options: statusOptions, inline: true }),
    owner: Dropdown({ id: "dialog-filter-owner", label: "صاحب تراکنش", value: state.owner, options: ownerOptions, inline: true }),
  };
  const dialog = Dialog({
    id: "filters-dialog",
    title: "فیلتر تراکنش‌ها",
    children: FILTER_KEYS.map((key) => draft[key].field),
    footer: [
      Button({
        variant: "primary",
        className: "flex-1",
        onClick: () => {
          dialog.close();
          setState(Object.fromEntries(FILTER_KEYS.map((key) => [key, draft[key].control.value])));
        },
        children: "اعمال فیلترها",
      }),
      Button({
        variant: "ghost",
        onClick: () => FILTER_KEYS.forEach((key) => (draft[key].control.value = "")),
        children: "حذف فیلترها",
      }),
    ],
  });
  const filterCount = el("span", {
    class: "inline-flex size-5 items-center justify-center rounded-full bg-primary-900 text-xs text-white",
  });
  const openFilters = Button({
    className: "lg:hidden",
    "aria-haspopup": "dialog",
    "aria-controls": dialog.id,
    onClick: () => {
      FILTER_KEYS.forEach((key) => (draft[key].control.value = state[key]));
      dialog.showModal();
    },
    children: [Icon({ name: "filter", className: "size-4" }), "فیلترها", filterCount],
  });
  desktop.addEventListener("change", (e) => {
    if (e.matches) dialog.close();
  });

  controls = {
    search: search.control,
    type: type.control,
    status: status.control,
    owner: owner.control,
    sort: sort.control,
    clear,
    filterCount,
  };
  replaceChildren(regions.filters, [
    el("div", { class: "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12" }, [search.field, type.field, status.field, owner.field]),
    el("div", { class: "mt-3 flex items-center gap-3 border-t border-secondary-100 pt-3" }, [openFilters, sort.field, clear]),
    dialog,
  ]);
  syncControls();
}

function syncControls() {
  if (!controls) return;
  if (controls.search.value !== state.search) controls.search.value = state.search;
  controls.type.value = state.type;
  controls.status.value = state.status;
  controls.owner.value = state.owner;
  controls.sort.value = `${state.sort}:${state.order}`;
  controls.clear.disabled = !isFiltered(state);
  const active = FILTER_KEYS.filter((key) => state[key] !== DEFAULT_STATE[key]).length;
  controls.filterCount.textContent = formatAmount(active);
  controls.filterCount.hidden = active === 0;
}

// As many skeletons as a full page, so the real rows land without the page changing height.
const skeletonRows = Array.from({ length: PAGE_SIZE });

function renderLoading() {
  regions.error.replaceChildren();
  regions.summary.hidden = false;
  regions.results.hidden = false;
  replaceChildren(regions.summary, [SummaryCardSkeleton(), SummaryCardSkeleton(), SummaryCardSkeleton({ className: "col-span-2 sm:col-span-1" })]);
  replaceChildren(regions.results, [
    el("div", { class: "lg:hidden", "aria-busy": "true" }, TransactionCardList({ items: skeletonRows.map(TransactionCardSkeleton) })),
    el(
      "div",
      { class: "hidden overflow-x-auto lg:block", "aria-busy": "true" },
      TransactionTable({ sort: state.sort, order: state.order, onSort: () => {}, rows: skeletonRows.map(TransactionRowSkeleton) }),
    ),
  ]);
  regions.pagination.replaceChildren();
}

function renderSummary({ totalIn, totalOut, count, byStatus }) {
  const breakdown = STATUSES.map((s) => `${formatAmount(byStatus[s.key])} ${s.label}`).join(" · ");
  replaceChildren(regions.summary, [
    SummaryCard({ title: "مجموع واریزی", value: formatAmount(totalIn), unit: "تومان", hint: "فقط تراکنش‌های موفق", tone: "in" }),
    SummaryCard({ title: "مجموع برداشتی", value: formatAmount(totalOut), unit: "تومان", hint: "فقط تراکنش‌های موفق", tone: "out" }),
    SummaryCard({ title: "تعداد تراکنش‌ها", value: formatAmount(count), hint: breakdown, tone: "neutral", className: "col-span-2 sm:col-span-1" }),
  ]);
}

// While a new query loads, the current results stay on screen (dimmed by CSS) instead of
// collapsing to skeletons, which made the table jump on every search, filter and sort.
function setBusy(busy) {
  for (const region of [regions.summary, regions.results, regions.pagination]) {
    region.setAttribute("aria-busy", String(busy));
  }
}

function renderResults({ items, total }) {
  showingResults = true;
  if (items.length === 0) {
    replaceChildren(
      regions.results,
      EmptyState({
        title: "تراکنشی پیدا نشد",
        description: isFiltered(state)
          ? "با این جستجو و فیلترها تراکنشی وجود ندارد. فیلترها را تغییر دهید یا پاک کنید."
          : "هنوز تراکنشی ثبت نشده است.",
        actionLabel: "پاک کردن فیلترها",
        onAction: isFiltered(state) ? clearFilters : null,
      }),
    );
    regions.pagination.replaceChildren();
    return;
  }

  replaceChildren(regions.results, [
    el("div", { class: "lg:hidden" }, TransactionCardList({ transactions: items })),
    el(
      "div",
      { class: "hidden overflow-x-auto lg:block" },
      TransactionTable({
        transactions: items,
        sort: state.sort,
        order: state.order,
        onSort: (field, order) => setState({ sort: field, order }),
      }),
    ),
  ]);
  replaceChildren(
    regions.pagination,
    Pagination({ page: state.page, pageSize: PAGE_SIZE, total, onPageChange: (page) => setState({ page }) }),
  );
}

function renderError(onRetry) {
  showingResults = false;
  regions.summary.hidden = true;
  regions.results.hidden = true;
  regions.summary.replaceChildren();
  regions.results.replaceChildren();
  regions.pagination.replaceChildren();
  replaceChildren(
    regions.error,
    ErrorBanner({
      title: "دریافت تراکنش‌ها ناموفق بود",
      description: "ارتباط با سرور برقرار نشد. مطمئن شوید json-server اجرا شده و دوباره تلاش کنید.",
      onRetry,
    }),
  );
}

async function load() {
  inFlight?.abort();
  const request = new AbortController();
  inFlight = request;
  if (showingResults) setBusy(true);
  else renderLoading();
  try {
    const [list, summary] = await Promise.all([
      fetchTransactions(state, request.signal),
      fetchSummary(state, request.signal),
    ]);
    // A page number from an old link can point past the end of the results.
    const lastPage = Math.ceil(list.total / PAGE_SIZE);
    if (lastPage > 0 && state.page > lastPage) return setState({ page: lastPage });
    renderSummary(summary);
    renderResults(list);
    setBusy(false);
  } catch (error) {
    if (request.signal.aborted) return;
    console.error(error);
    setBusy(false);
    renderError(load);
  }
}

async function start() {
  // Drop anything in the URL that readStateFromUrl rejected.
  history.replaceState(null, "", `${location.pathname}${stateToQueryString(state)}`);
  renderLoading();
  try {
    renderFilters(await fetchUsers());
  } catch (error) {
    console.error(error);
    renderError(start);
    return;
  }
  load();
}

start();
