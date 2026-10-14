---
marp: true
theme: default
paginate: true
---

# Integration with third-party systems

## Lecture 4 – Search API

---

<!-- Theory -->

# Why not just SQL?

```sql
SELECT * FROM products WHERE name ILIKE '%hodie%';   -- 0 hits
```

| The customer expects | `LIKE` gives |
|---|---|
| "hodie" finds Hoodie (typos) | Nothing |
| The best hit first (relevance) | Database order |
| An answer while typing | A full table scan per keystroke |

A search service is built for exactly this. We **integrate** it instead of building it.

---

# A search service is a copy

```
                 index (write)
Database  ─────────────────────────►  Algolia
(the truth)                           (a copy, made for searching)
                                         ▲
React ──► Express  GET /api/search ──────┘  search (read)
```

- Algolia only knows what **we have sent** to it
- The database is still the truth – Algolia is only used to **find** products
- React calls **our** server, never Algolia directly

---

# Index, record and objectID

| Database | Algolia |
|---|---|
| Table | **Index** |
| Row | **Record** (a JSON object) |
| Primary key | **objectID** |

```ts
{ objectID: product.sku, name: product.name, price: product.price, ... }
```

The same `objectID` again → the record is **replaced**, not duplicated.
`saveObjects` is an **upsert** – exactly like the import in L3.

---

# Two keys

| Key | May | Used in |
|---|---|---|
| **Admin API Key** | Write: index, change settings, delete | Only the server, when indexing |
| **Search API Key** | Only search | The server, when searching |

- The admin key is **secret**: `.env`, never in React, never in git
- If the search key leaks, nobody can change or delete the index
- One client per key in the adapter:
  ```ts
  const adminClient = algoliasearch(APP_ID, ADMIN_KEY)
  const searchClient = algoliasearch(APP_ID, SEARCH_KEY)
  ```

---

# Keeping the copy in sync

| Express | Database | Algolia |
|---|---|---|
| Index all products | fetchAll | `saveObjects(all)` |
| Create product | insert | `saveObjects([product])` |
| Update product | update | `saveObjects([product])` – same call |
| Delete product | delete | `deleteObjects([sku])` |

**Always the database first.** Algolia is only updated if the database write succeeded.

Algolia down? The product is still saved – only the search is behind.
Say so to the admin, and reindex later.

---

# Why doesn't my new product show up?

Writing to Algolia is a **task** that runs in the background.

- `waitForTasks: true` → our call waits until the product is in the index
- But Algolia caches the answer to an **identical** search for a short while:
  - `?q=strumpor` (searched before) → the old answer
  - `?q=Strumpor` (a new search) → the product is there

A search service can lag behind the database for a moment: **eventual consistency**.
Fine for search – but price and stock at checkout always come from the **database**.

---

# A search API has two parts

```
GET /api/search?q=hoodie&page=2
```

| Part | Our API | Algolia |
|---|---|---|
| Free text | `q` | `query` |
| Pagination | `page` (from 1), `pageSize` | `page` (from **0**), `hitsPerPage` |

The answer, in **our** format:
```json
{ "data": [ ... ], "meta": { "page": 2, "pageSize": 12, "total": 30, "totalPages": 3 } }
```

---

# Index settings

Without settings, Algolia searches in **all** fields – even the price.

```ts
await adminClient.setSettings({
  indexName: 'products',
  indexSettings: {
    searchableAttributes: ['name', 'category', 'description'], // order = weight
  },
})
```

Settings are made **once** (or when they change) – not on every search.

---

# Zod – three times, three sources

| | L2 | L3 / Labb 1 | L4 / Labb 2 |
|---|---|---|---|
| Validates | The supplier's JSON | Our product after mapping | The user's `req.query` |
| Against | **Their** docs | **Our** rules | **Our** API |
| The question | "Did they send what they promised?" | "Can this product be in our shop?" | "Is this a search we allow?" |
| On failure | Error | Skip with a reason | **400** with a message |

Everything in `req.query` is text: `page=2` is `'2'`, not `2`.

```ts
page: z.coerce.number().int().min(1).default(1),
pageSize: z.coerce.number().int().min(1).max(50).default(12),
```

---

# The adapter: their format → ours

**Algolia's hit**
```json
{ "objectID": "LEV-1001", "name": "Hoodie Svart", "price": 599,
  "_highlightResult": { ... } }
```

**Ours**
```json
{ "sku": "LEV-1001", "name": "Hoodie Svart", "price": 599 }
```

- Only the adapter knows `objectID`, `nbHits` and `_highlightResult`
- Switching to Typesense or Meilisearch should only change **one file**

---

# Code walkthrough: `algolia-walkthrough/`

1. Our products → records → `saveObjects`
2. `GET /api/search?q=hodie` → hits → our model
3. Create, update and delete a product → the index follows

---

# Labb 2 – Sök-API

The second step of Assignment 1: a search in your shop.

- Products → Algolia, with the article number as `objectID`
- The index follows the database: import, create, update, delete
- `GET /api/search` with free text and pagination – validated
- A search page in React that only calls your own server

*(Go through the requirements and "Klart när" in Labb 2)*
