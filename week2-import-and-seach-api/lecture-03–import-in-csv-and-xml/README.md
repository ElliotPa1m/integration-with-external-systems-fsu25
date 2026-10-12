# Lecture 3 – Data formats: XML and CSV


## Video links
- _Added after the lecture._


## Goals

After this lecture you can:

- explain what CSV and XML are, and when you meet them instead of JSON
- read a CSV file with the right delimiter and character encoding, and handle decimal commas
- read an XML file with attributes, repeated elements and values that must stay text
- import products from a file into your shop: fetch → parse → validate → save (upsert)

## 1. Solution to the previous exercise

We go through a suggested solution to `labb.md` from lecture 2 (`../../week1-course-intro/lecture-02-robust-REST-integrations/labb.md`):

- Part 1 – putting the supplier integration to the test with `/chaos/v1`, a wrong key and the rate limit
- Part 2 – retries in `fetchJson`
- Part 3 – the robust currency adapter: timeout, Zod validation, a general error handler and a cache

## 2. Theory

Study `slides.md`: CSV and XML, where you meet them, character encoding, the XML pitfalls, and the import flow fetch → parse → validate → save.

## 3. Code walkthrough: `csv-xml-walkthrough/`

A minimal Express app that fetches a product file (CSV or XML) from a fake supplier and turns it into our own model.


```bash
cd csv-xml-walkthrough
npm install
npm run dev
```

Try `GET http://localhost:3000/api/import/csv?debug=true` and `.../xml?debug=true` to see every step: raw text → parse → our model.

## 4. Template to help you structure the code in labb1: `import-template-example`


## 5. Inlämningsuppgift 1 and Labb 1

- **Inlämningsuppgift 1 – Integrera shoppen med omvärlden** is presented today.
- **Labb 1 – Import av produktdata** is the first step of it.

The supplier API now also sends its catalogue as **files**, described at https://leverantor-api.vercel.app/docs.

**Industries (`bransch`):** new industries are added based on your suggestions. All available industries are listed at https://leverantor-api.vercel.app/docs. Choose one by adding `?bransch=` to every request, e.g. `GET /v1/export/products.csv?bransch=elektronik`. Without the query string the API defaults to `klader`. Use the same industry as in L2.

Industries available right now:

| `bransch` | Name |
|---|---|
| `klader` (default) | Kläder |
| `elektronik` | Elektronik |
| `bocker` | Böcker |
| `hem` | Hem och inredning |
| `sport` | Sport och fritid |
| `skonhet` | Skönhet och hälsa |
| `leksaker` | Leksaker |
| `mat` | Mat och bageri |
| `konst` | Konst |
| `posters` | Posters |
| `hjalpmedel` | Hjälpmedel |
| `kosttillskott` | Kosttillskott |
| `garn` | Garn och handarbete |
| `fiskeredskap` | Fiskeredskap |
| `dockor` | Dockor |
| `kaffe` | Kaffe |
| `fotbollstrojor` | Fotbollströjor |
| `kurslitteratur` | Kurslitteratur |
| `te` | Te |
| `chilisas` | Chilisås |



## 6. Reading instructions

- [Supplier API documentation](https://leverantor-api.vercel.app/docs)
- [csv-parse](https://csv.js.org/parse/)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/tree/master/docs)
- [TextDecoder (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)
- [Upsert in PostgreSQL: INSERT … ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [Zod documentation](https://zod.dev)
