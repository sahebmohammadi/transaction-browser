import { API_BASE, DIRECTION, PAGE_SIZE, STATUSES, directionOf } from "./constants.js";
import { normalizeDigits } from "./format.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildFilterParams(state) {
  const params = new URLSearchParams();
  const search = normalizeDigits(state.search ?? "").trim();
  if (/^\d+$/.test(search)) params.set("refId_like", search);
  else if (search) params.set("type_like", escapeRegex(search));
  if (state.type) params.set("type", state.type);
  if (state.status) params.set("status", state.status);
  if (state.owner) params.set("userId", state.owner);
  return params;
}

export function buildListParams(state) {
  const params = buildFilterParams(state);
  params.set("_sort", state.sort);
  params.set("_order", state.order);
  params.set("_page", String(state.page));
  params.set("_limit", String(PAGE_SIZE));
  params.set("_expand", "user");
  return params;
}

export function summarize(transactions) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s.key, 0]));
  let totalIn = 0;
  let totalOut = 0;
  for (const transaction of transactions) {
    byStatus[transaction.status] += 1;
    if (transaction.status !== "success") continue;
    if (directionOf(transaction.type) === DIRECTION.IN) totalIn += transaction.price;
    else totalOut += transaction.price;
  }
  return { totalIn, totalOut, count: transactions.length, byStatus };
}

async function getJson(path, params, signal) {
  const query = params?.toString();
  const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ""}`, { signal });
  if (!response.ok) throw new Error(`Request to ${path} failed with ${response.status}`);
  return response;
}

export async function fetchTransactions(state, signal) {
  const response = await getJson("/transactions", buildListParams(state), signal);
  return {
    items: await response.json(),
    total: Number(response.headers.get("X-Total-Count") ?? 0),
  };
}

export async function fetchSummary(state, signal) {
  const response = await getJson("/transactions", buildFilterParams(state), signal);
  return summarize(await response.json());
}

export async function fetchUsers(signal) {
  const response = await getJson("/users", new URLSearchParams({ _sort: "name" }), signal);
  return response.json();
}
