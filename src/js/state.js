import { SORTABLE_FIELDS, STATUSES, TRANSACTION_TYPES } from "./constants.js";

export const DEFAULT_STATE = Object.freeze({
  search: "",
  type: "",
  status: "",
  owner: "",
  sort: "date",
  order: "desc",
  page: 1,
});

const isValid = {
  search: () => true,
  type: (value) => TRANSACTION_TYPES.some((t) => t.label === value),
  status: (value) => STATUSES.some((s) => s.key === value),
  owner: (value) => /^[1-9]\d*$/.test(value),
  sort: (value) => SORTABLE_FIELDS.includes(value),
  order: (value) => value === "asc" || value === "desc",
  page: (value) => /^[1-9]\d*$/.test(value),
};

export function readStateFromUrl(queryString) {
  const params = new URLSearchParams(queryString);
  const state = { ...DEFAULT_STATE };
  for (const key of Object.keys(DEFAULT_STATE)) {
    const value = params.get(key);
    if (value !== null && isValid[key](value)) state[key] = value;
  }
  state.page = Number(state.page);
  return state;
}

export function stateToQueryString(state) {
  const params = new URLSearchParams();
  for (const [key, defaultValue] of Object.entries(DEFAULT_STATE)) {
    if (state[key] !== defaultValue) params.set(key, state[key]);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
