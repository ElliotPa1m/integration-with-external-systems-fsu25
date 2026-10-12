---
marp: true
theme: default
paginate: true
---

# Integration with third-party systems

## Lecture 3 – Data formats: XML and CSV

---

<!-- Theory -->

# The same product – three formats

**JSON** (L2)
```json
{ "artNr": "LEV-1001", "benamning": "Hoodie Svart", "prisOre": 59900 }
```

**CSV**
```
artNr;benamning;pris
LEV-1001;Hoodie Svart;599,00
```

**XML**
```xml
<produkt artNr="LEV-1001">
  <benamning>Hoodie Svart</benamning>
  <pris valuta="SEK">599.00</pris>
</produkt>
```

---

# Why not just JSON?

| Format | Where you meet it |
|---|---|
| **CSV** | Excel, price lists, business systems, bank exports |
| **XML** | Older business systems, e-invoices, logistics, SOAP services, product feeds |
| **JSON** | Modern REST APIs |

We **read** CSV and XML when the other system decides the format.
When **we** expose data, we choose – and choose JSON.


---

# CSV – "comma separated values"

- One row per record, the first row is often headers
- No standard for:
  - **delimiter** – `,` or `;` (Swedish Excel uses `;`)
  - **decimal separator** – `599.00` or `599,00`
  - **character encoding** – UTF-8 or Windows-1252
- Fields containing the delimiter or quotes must be quoted (next slide)

**Never read CSV with `split(';')`.** Use a library.

---

# CSV – quoting

Free text can contain `;` and `"` – here 4 fields become **5**:

```
LEV-1001;Skärm 27";Matt panel; HDMI ingår;1999,00
```

Rules: wrap such a field in `"…"`, and write `"` inside it as `""`:

```
LEV-1001;"Skärm 27""";"Matt panel; HDMI ingår";1999,00
```

A CSV library gives back 4 fields – `split(';')` still gives 5.

---

# Character encoding

The same bytes, two interpretations:

| Read as | Result |
|---|---|
| UTF-8 | `M�ssa Svart` |
| Windows-1252 | `Mössa Svart` |

- `response.text()` **always** decodes as UTF-8
- Fetch the bytes and decode them yourself:
  ```js
  const text = new TextDecoder('windows-1252').decode(buffer);
  ```

---

# XML – elements and attributes

```xml
<produkt artNr="LEV-1026">          ← attribute
  <ean>0735100197975</ean>          ← element
  <pris valuta="SEK">199.00</pris>  ← element with an attribute
  <lagersaldo/>                      ← empty element
  <varianter>
    <variant>One size</variant>     ← one, several or none
  </varianter>
</produkt>
```

---

# XML: three traps with the default settings

| Problem | Result | Solution in fast-xml-parser |
|---|---|---|
| Attributes are ignored | `artNr` is missing entirely | `ignoreAttributes: false` |
| Text becomes a number | EAN `735100197975` – the zero is gone | `parseTagValue: false` |
| One element doesn't become a list | `variant: "One size"` instead of `["One size"]` | `isArray` |

---

# Fetch → parse → validate → save

```
Supplier ──► Buffer ──► Parser ──► Zod ──► Upsert
            (bytes)   (CSV/XML)  (rules)  (database)
```

- **Parse** – only the parser knows the format
- **Validate** – the same Zod schema whatever the format
- **Save** – *upsert*: the `sku` already exists → update, otherwise create

The same pattern as in L2, but with files.

---

# Zod in L2 vs L3: whose rules?

| | L2: **their** contract | L3: **our** rules |
|---|---|---|
| Schema describes | The supplier's JSON, as in their docs | The shop's product |
| Field names | Theirs (`benamning`, `pris`) | Ours (`name`, `price`) |
| When | **Before** mapping | **After** mapping |
| The question | "Did they send what they promised?" | "Can this product be in our shop?" |
| On failure | They changed or broke something | Skip the product with a reason |

CSV and XML have no types – everything is text. The real checks (price > 0, EAN 13 digits) only make sense once `"599,00"` is `599`.

A JSON API can get both: **their shape → map → our rules**.

---

# Code walkthrough

1. Fetch the supplier's CSV/XML – and watch åäö break
2. Parse CSV and XML into the same model
3. Validate and save

The supplier's files: https://leverantor-api.vercel.app/docs


---

# Assignment 1

*(Present the assignment description and the grading criteria)*

Today's exercise is the first step: import products into your shop.

