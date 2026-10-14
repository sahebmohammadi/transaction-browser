# Server-side querying on json-server 0.17

All search, filtering, sorting and pagination is done by json-server through query parameters, not in the browser, because practising API query building is the point of the exercise. We stay on json-server 0.17 (`_limit`, `_expand`, `X-Total-Count`) instead of v1, which renamed `_limit` to `_per_page`, replaced `_expand` with `_embed` and changed the pagination response shape.

## Consequences

json-server can't match one value against two fields at once (no OR across fields), and `q=` full-text search also matches amounts, dates and ids. So the single search box sends a digits-only query as `refId_like` and any other text as `type_like`. The Summary needs a second request with the same filters and no pagination, because the paginated list only holds one page.
