---
marp: true
theme: default
paginate: true
---

# Integration with third-party systems

## Lecture 6 – Product images in cloud storage

---

<!-- Theory -->

# Where do the images go?

| | Problem |
|---|---|
| **In the database** | Large rows, slow queries, an expensive database |
| **On our server's disk** | Vercel and Render: the disk is temporary – the images disappear |
| **Cloud storage** | Made for files, served fast from a CDN |

The database only stores **where** the image is – the file is in the cloud.

We **integrate** storage instead of running our own file server.

---

# Bucket, path and URL

| Storage | Like |
|---|---|
| **Bucket** – `product-images` | A drive |
| **Path** – `products/LEV-1001/3f2a.png` | A file path in it |
| **Public URL** | The file's address on the web |

```
https://<project>.supabase.co/storage/v1/object/
  public/product-images/products/LEV-1001/3f2a.png
```

The bucket is created **once**, in the Supabase Dashboard.

---

# Public or private bucket?

| | **Public** | **Private** (default) |
|---|---|---|
| Who can see a file | Anyone with the URL | Only with permission |
| Showing it | `getPublicUrl(path)` | `createSignedUrl(path, 60)` – expires |
| Fits | Product images | Receipts, invoices, personal files |

Uploading and deleting are **always** controlled – also in a public bucket.

Product images are meant to be seen by everyone → **public**.

---

# Two keys

| Key | Where | May |
|---|---|---|
| **Secret key** `sb_secret_...` | Only the server, `.env` | Everything – bypasses Row Level Security |
| **Publishable key** `sb_publishable_...` | Can be public | Only what Row Level Security allows |

- Today we only use the **secret key**, on the server

---

# The upload flow

```
React              Express              Supabase
  │ FormData          │                     │
  │──────────────────►│ 1. multer: file     │
  │                   │ 2. validate         │
  │                   │ 3. upload ─────────►│
  │                   │◄──── path ──────────│
  │                   │ 4. save path + url  │
  │◄──── { url } ─────│    in the DB        │
  │                                         │
  │ <img src={url}> ───────────────────────►│
```

The **upload** goes via our server. The **image** is loaded straight from Supabase.

---

# Files are not JSON: React

React sends the file as `multipart/form-data`:

```ts
const form = new FormData()
form.append('image', file)
await fetch(`/api/admin/products/${sku}/image`, {
  method: 'POST',
  body: form, // no Content-Type – the browser sets it
})
```

`multipart/form-data` = the body is split into parts, one per field – a file can be one of them.

---

# Files are not JSON: Express

`express.json()` can't read files. **multer** can:

```ts
const upload = multer({
  limits: { fileSize: 4 * 1024 * 1024 },
})
router.post('/products/:sku/image',
  upload.single('image'), handler)
```

- `single('image')` – one file, in the field `image` → `req.file`
- `memoryStorage()` – never our server's disk: on Vercel it disappears

---

<style scoped>section { font-size: 28px; }</style>

# Validate the file – on the server

`accept="image/jpeg,image/png"` in React only filters the file picker. The server must check:

| Check | Why |
|---|---|
| **Size** – max 4 MB | multer stops it → 400 |
| **The type** – JPEG or PNG | Anything else → 400 |
| **The sku** | The image must belong to a product |

```ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
  res.status(400).json({ error: 'The file is not a JPEG or PNG image.' })
  return
}
```

The bucket can **also** limit types and size – a second lock.

---

# A new path every time

```ts
const path = `products/${sku}/${randomUUID()}.png`
await supabase.storage
  .from(BUCKET)
  .upload(path, buffer, {
    contentType: 'image/png',
    upsert: false,
  })
```

- **Never the admin's file name** – two `hoodie.png` overwrite each other
- **Never overwrite** – the CDN can show the old image for a while
- A new path = a new URL = never a stale image

---

# Save the path AND the URL

```sql
UPDATE products
SET image_path = 'products/LEV-1001/3f2a.png',
    image_url  = 'https://…/products/LEV-1001/3f2a.png'
WHERE sku = 'LEV-1001'
```

| | Used for |
|---|---|
| `image_url` | Showing the image: `<img src={product.image_url}>` |
| `image_path` | Deleting the file: `remove([product.image_path])` |

The path for deleting comes from **the database** – never from the request.

---

<style scoped>section { font-size: 28px; }</style>

# Replacing an image – in the right order

1. **Upload** the new image → a new path
2. **Save** the new path and URL on the product
3. **Delete** the old file

| Fails at | The product shows |
|---|---|
| 1 | The old image – nothing has changed |
| 2 | The old image – the new file is left over in the bucket |
| 3 | The **new** image – the old file is left over |

Delete first? Then a failed upload leaves the product **without** an image.

---

# Timeout: supabase-js uses fetch

`fetch` has **no timeout** – so we give the client our own:

```ts
const supabase = createClient(URL, SECRET_KEY, {
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init, // the request supabase-js built
        signal: AbortSignal.timeout(10_000),
      }),
  },
})
```

Read more: [`AbortSignal.timeout()` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)

---

# supabase-js doesn't throw

Every call returns `{ data, error }`:

```ts
const { error } = await supabase.storage
  .from(BUCKET)
  .upload(path, buffer)

if (error) throw new Error(error.message)
```

Forget `if (error)` – and the shop thinks the upload worked.

The route catches the error → **502** "The image service is not responding" → the product keeps its old image.

---

<style scoped>section { font-size: 28px; }</style>

# An alternative: upload straight from the browser

Large files through our server = slow and memory-hungry. Instead:

1. The server checks the admin and creates a **signed upload URL**
   `createSignedUploadUrl(path)`
2. React uploads the file **straight to Supabase** with it
   `uploadToSignedUrl(path, token, file)`
3. The server saves the path on the product

The secret key still never leaves the server – but the server never sees the file.

*(Read if you're interested – not required in Labb 4.)*

---

# Code walkthrough: `storage-walkthrough/`

1. React: `FormData` → `POST /api/admin/products/:sku/image`
2. multer: the file as a Buffer, max 4 MB
3. Validate: the sku, and that the file is a JPEG or PNG
4. `uploadProductImage()`: a new path → `upload` → `getPublicUrl`
5. Comments: save the path and URL, then delete the old image
6. `removeProductImage()`: delete a file

---

# Labb 4 – Produktbilder i molnlagring

The fourth step of Assignment 1: images for your products.

- A public bucket in Supabase Storage
- Upload on the admin page – via your server, validated there
- Save the path and URL on the product, show the image in the shop
- Replace an image in the right order, and delete the old file

*(Go through the requirements and "Klart när" in Labb 4)*
