# Lecture 4 – Search API with Algolia


## Video links
- [01 - Algolia Theory with slides](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FIntegration%20med%203%2Dpartssystem%2D20261014%5F090607%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E8877b56e%2D8441%2D4f18%2Db8e2%2D6c6a4e2b047b)
- [02 - Get started with indexing and searching in algolia-walkthrough](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FIntegration%20med%203%2Dpartssystem%2D20261014%5F100213%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E1f237bac%2D0069%2D49ac%2Db0b7%2D63208d8d492f)
- [03 - Update index when performing products POST/PUT in algolia-walkthrough](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FIntegration%20med%203%2Dpartssystem%2D20261014%5F110657%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E7da2c185%2D2ee2%2D4dd9%2Db3d8%2Ddb6da015d7fd)
- [04 - Update Search with pagination meta data in algolia-walkthrough](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FIntegration%20med%203%2Dpartssystem%2D20261014%5F112740%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E0f7991a5%2Db20b%2D4257%2Da260%2D98e686967f12)
- [05 - Labb 2 presentation with example](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FIntegration%20med%203%2Dpartssystem%2D20261014%5F114500%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ea36fc662%2D07e2%2D4ba2%2Db163%2D19b77d133136)



## Goals

After this lecture you can:

- explain why a shop integrates a search service instead of searching with SQL
- send the shop's products to Algolia and keep the index in sync with the database: create, update and delete
- build your own search API in Express with free text and pagination, and validate its parameters
- explain why the search service is a copy that can lag behind, and why the database is still the truth

## 1. Theory

Study `slides.md`: why not just SQL, the search service as a copy, index, record and `objectID`, the two keys, keeping the copy in sync, free text and pagination, and validating the user's parameters with Zod.

## 2. Code walkthrough: `algolia-walkthrough/`

A minimal Express app (no frontend) that sends a handful of products to Algolia and searches in them.

```bash
cd algolia-walkthrough
cp .env.example .env   # fill in the keys from dashboard.algolia.com → Settings → API Keys
npm install
npm run dev
```

`integrations/searchAdapter.ts` is the only file that knows Algolia. Every step is logged in the terminal.

1. `POST http://localhost:3000/api/admin/search/index` – all products → Algolia (`routes/admin.ts`)
2. `GET http://localhost:3000/api/search?q=hodie` – free text (with a typo) → our model (`routes/search.ts`):
   - The route validates the parameters with Zod: `q`, `category`, `inStock`, `page` and `pageSize`. Invalid values give 400.
   - The adapter searches with a filter and pagination – for now hardcoded as an example: `stock > 0`, page 1, 5 products per page. Only `q` is sent on from the route.
   - The answer is in our format: `{ data: [products], meta: { page, pageSize, total, totalPages } }`
3. Change a product and search again (`routes/admin.ts`). The routes use a hardcoded example product, LEV-1009, and only update Algolia. In your shop you save in the DB first, then update Algolia:
   - `POST /api/admin/products` → `indexProducts([newProduct])`
   - `PUT /api/admin/products/LEV-1009` → `indexProducts([updatedProduct])` (upsert, same call)
   - `DELETE /api/admin/products/LEV-1009` → `removeProducts(['LEV-1009'])`


## 3. Labb 2

**Labb 2 – Sök-API** is the second step of Inlämningsuppgift 1:

- Create a free Algolia account. The index is created automatically the first time you send products to it
- Keep the index in sync with the database: create, update and delete
- Build your own `GET /api/search` with free text and pagination, and validate the parameters
- Build a search page in React that only calls your own server

## 4. Reading instructions

- [Algolia: JavaScript API client](https://www.algolia.com/doc/libraries/sdk/install#javascript)
- [Algolia: incremental updates – add, update and delete records in the index](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/how-to/incremental-updates)
- [Algolia: searchable attributes](https://www.algolia.com/doc/guides/managing-results/must-do/searchable-attributes/)
- [Algolia: API keys](https://www.algolia.com/doc/guides/security/api-keys/)
- [Zod documentation](https://zod.dev)
