# ChromaUI — Roadmap

A step-by-step guide you can follow, tick off, and amend as the project evolves.

## Context

Graphical client for ChromaDB (see [Requirements.md](Requirements.md)) built with Node.js + React. You're coding it; Claude is the guide when you're stuck.

**Current state**
- [Backend/index.js](Backend/index.js) — minimal Express server blindly proxying `/api/*` to `http://localhost:8000`. No auth, no typed routes. Uses ESM `import` syntax but `package.json` says `"type": "commonjs"` — inconsistent, will bite you.
- [Frontend/src/App.tsx](Frontend/src/App.tsx) — fresh Vite + React 19 + TS scaffold, just "Hello World". No router, no data layer, no UI library.
- No ChromaDB client library installed in Backend yet.

**Key decisions (2026-04-24)**
- Backend supports **both local Chroma (Docker) and Chroma Cloud** — driven by env config.
- **Single-user auth**: backend loads Chroma credentials from `.env` and injects them into outgoing requests. Frontend never sees credentials. No login screen.
- **UI**: shadcn/ui + Tailwind.
- **Embeddings**: start with Chroma's built-in embedding function; revisit if quality is insufficient.

---

## Phase 0 — Foundations

Goal: everything runs end-to-end as a sanity check, so later phases only have one moving part at a time.


- [ ] Run Chroma locally: `docker run -p 8000:8000 chromadb/chroma`. Verify with `curl http://localhost:8000/api/v2/heartbeat`
- [ ] Create `Backend/.env.example` documenting: `CHROMA_URL`, `CHROMA_API_KEY`, `CHROMA_TENANT`, `CHROMA_DATABASE`. Add `.env` to `.gitignore`. Load via `dotenv`.
- [ ] Install Chroma client: `cd Backend && npm i chromadb dotenv`. Use it instead of raw `fetch` from Phase 1 onward.
- [ ] Wire Vite proxy in [Frontend/vite.config.ts](Frontend/vite.config.ts): proxy `/api` → `http://localhost:8080`.
- [ ] Smoke test: backend boots, frontend calls `GET /api/heartbeat`, gets JSON back.

**Verify:** `cd Backend && npm run dev` succeeds; from Frontend dev server, fetch `/api/heartbeat` in browser devtools.

---

## Phase 1 — Backend: typed Chroma API layer

Goal: replace the blind passthrough with purposeful endpoints. Frontend only talks to these.

Replace the catch-all `/api/*` in [Backend/index.js](Backend/index.js) with explicit routes:

- [ ] `GET /api/collections` — list collections
- [ ] `POST /api/collections` — create collection
- [ ] `DELETE /api/collections/:name` — delete collection
- [ ] `GET /api/collections/:name/items?limit&offset` — list documents (ids, documents, embeddings, metadatas)
- [ ] `POST /api/collections/:name/items` — add documents (text + optional metadata)
- [ ] `PATCH /api/collections/:name/items/:id` — update metadata/document
- [ ] `DELETE /api/collections/:name/items/:id` — delete a document
- [ ] `POST /api/collections/:name/query` — text query, top-k with distances
- [ ] `POST /api/collections/:name/where` — metadata-only query

Each route uses the `chromadb` client instantiated once at startup from env vars. That's where the "secure auth" happens — credentials never leave the backend.

**Refactor target**: split `index.js` into `server.js` (express setup), `chroma.js` (client factory), `routes/collections.js`, `routes/items.js`, `routes/query.js`.

**Verify:** hit each route with `curl` or a REST client against a seeded test collection.

---

## Phase 2 — Frontend: scaffolding & data layer

Goal: a navigable skeleton to hang pages off of.

- [ ] Install & init Tailwind + shadcn/ui (`npx shadcn@latest init`). Configure `tailwind.config.js` and global CSS.
- [ ] Install core deps: `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-table`.
- [ ] Create:
  - `src/lib/api.ts` — typed fetch client for Phase 1 routes.
  - `src/lib/queries.ts` — TanStack Query hooks (`useCollections`, `useItems`, `useQuery(text)`).
  - `src/pages/CollectionsPage.tsx`
  - `src/pages/CollectionDetailPage.tsx`
  - `src/pages/QueryPage.tsx`
  - `src/components/AppShell.tsx` — sidebar/topbar layout.
- [ ] Router: `/` → collections, `/c/:name` → detail, `/c/:name/query` → query.

**Verify:** click between routes, see loading states, collections list populated from real backend.

---

## Phase 3 — Read views (the "R" in CRUD)

Goal: see what's actually in ChromaDB.

- [ ] **Collections list** (shadcn `Card` or `Table`): name, item count, created-at if available.
- [ ] **Collection detail table** (TanStack Table + shadcn `Table`): columns for `id`, `document` (truncated), `metadata` (collapsible JSON), `embedding` (first 8 dims + `…` + length). Paginate via `limit/offset`.
- [ ] **Embedding cell**: click to expand full vector in a popover/drawer. Satisfies "vectors should be displayed."
- [ ] **Metadata cell**: pretty-printed JSON, collapsible.

Stretch (defer to Phase 6): 2D projection (UMAP/PCA) scatter plot of embeddings.

**Verify:** seed 20 documents, see them all paginated, open a row to inspect its vector.

---

## Phase 4 — Write ops (C, U, D)

Goal: full CRUD from the UI.

- [ ] Create collection: shadcn `Dialog` + form → `POST /api/collections`. Invalidate collections query.
- [ ] Delete collection: confirmation dialog.
- [ ] Add document: dialog on detail page. Fields: `id` (optional, auto-gen if empty), `document` (textarea), `metadata` (key-value editor).
- [ ] Edit document metadata / text: row action → dialog.
- [ ] Delete document: row action + confirmation.

Use TanStack Query's optimistic updates where cheap; otherwise just invalidate.

**Verify:** create a collection, add a doc, edit its metadata, delete it, delete the collection — all from the UI, no `curl`.

---

## Phase 5 — Query

Goal: fulfill the "query by text" and "query by metadata" requirements.

- [ ] Text query page: input box + `n_results` selector → `POST /api/collections/:name/query`. Display results as cards, sorted by distance ascending (closest = most similar first). Each card: document, metadata, distance, embedding preview. Satisfies "multiple results sorted by the vectors."
- [ ] Metadata filter UI: simple builder — key, operator (`$eq`, `$ne`, `$gt`, `$lt`, `$in`), value. AND-join multiple conditions. Sends Chroma `where` clause to `POST /api/collections/:name/where`.
- [ ] Combine: text query with optional metadata filter on one unified page.

**Verify:** ingest docs with known metadata; text query returns closest matches on top; metadata-only query returns exactly the matching rows.

---

## Phase 6 — Polish

Only after Phase 5 works end-to-end. Pick what matters.

- [ ] Loading skeletons, empty states, error toasts (shadcn `Sonner`).
- [ ] Chroma Cloud config: document `.env` values, test end-to-end against a real Cloud tenant.
- [ ] 2D projection scatter plot of embeddings (stretch).
- [ ] Dark mode.
- [ ] Basic e2e test (Playwright) for collection CRUD.
- [ ] README update with setup instructions.

---

## Files you'll touch

| Phase | Path | What |
|---|---|---|
| 0 | [Backend/package.json](Backend/package.json) | `"type": "module"`, dev script, deps |
| 0 | `Backend/.env.example`, `Backend/.gitignore` | env scaffolding |
| 0 | [Frontend/vite.config.ts](Frontend/vite.config.ts) | proxy `/api` → backend |
| 1 | `Backend/server.js`, `Backend/chroma.js`, `Backend/routes/*.js` | typed API (replaces current [Backend/index.js](Backend/index.js)) |
| 2 | `Frontend/tailwind.config.js`, `Frontend/src/lib/*`, `Frontend/src/pages/*`, `Frontend/src/components/AppShell.tsx` | scaffolding |
| 3–5 | `Frontend/src/pages/*`, `Frontend/src/components/*` | features |

---

## How to use this roadmap

- Work **one phase at a time**. Don't start Phase 2 until Phase 0 + 1 boot cleanly.
- Each phase has a **Verify** step. If you can't verify, don't advance.
- Amend this file freely — it's yours. If you re-scope (e.g., add multi-user auth), update the Context section and the affected phase.
- When stuck, bring the exact symptom (error message, unexpected JSON, screenshot) — not "it doesn't work."
