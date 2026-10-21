# Lecture 6 – Product images in cloud storage (Supabase Storage)


## Video links
- [01 - Product images in Supabase storage slides - coming soon]()
- [02 - coming soon...]()



## Goals

After this lecture you can:

- explain why product images belong in cloud storage – not in the database and not on your server's disk
- upload an image from React, via Express, to a Supabase Storage bucket
- validate an uploaded file on the server: that it really is an image, and not too large
- save the image's path and URL on the product, and show the image from the public URL
- replace and delete images without leaving the product without an image

## 1. Theory

Study `slides.md`: why cloud storage, buckets and paths, public and private buckets, the two keys, the upload flow, multipart and multer, validating files, unique file names and the CDN, replacing an image in the right order, and timeouts.

## 2. Code walkthrough: `storage-walkthrough/`

A minimal admin page: an Express server and a small React app that uploads an image for a product and shows it.

**Set up Supabase – once**

1. Create a free project at [supabase.com](https://supabase.com/dashboard/sign-up)
2. Storage → **New bucket** → name `product-images`, turn on **Public bucket**
3. In the bucket's settings: **allowed MIME types** `image/jpeg, image/png`, **file size limit** 5 MB – a second check, besides the server's
4. Settings → **API Keys**: copy **secret key** (`sb_secret_...`) and add it to.env
5. Settings → **General**: copy **Project ID** and add it to .env (`https://your-project-id.supabase.co`)

```bash
# Terminal 1 – the server
cd storage-walkthrough/server
cp .env.example .env    # fill in SUPABASE_URL and SUPABASE_SECRET_KEY
npm install
npm run dev

# Terminal 2 – the client
cd storage-walkthrough/client
npm install
npm run dev             # http://localhost:5173
```


## 3. Labb 4

**Labb 4 – Produktbilder i molnlagring** is the fourth step of Inlämningsuppgift 1:

- Create a Supabase project and a public bucket for product images
- Upload an image per product on the admin page – via your own server, validated there
- Save the image's path and URL on the product, and show it in the shop from the cloud storage
- Replace an image without leaving the product without one, and delete the old file

## 4. Reading instructions

**Getting started**
- [Sign up for Supabase](https://supabase.com/dashboard/sign-up)
- [Storage quickstart](https://supabase.com/docs/guides/storage/quickstart)
- [API keys: publishable and secret](https://supabase.com/docs/guides/api/api-keys)

**Storage**
- [Buckets: public and private](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [File limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [The CDN and caching](https://supabase.com/docs/guides/storage/cdn/fundamentals)

**SDK**
- [Supabase JavaScript: get started with the SDK](https://supabase.com/docs/reference/javascript/initializing)
- [Supabase JavaScript: upload](https://supabase.com/docs/reference/javascript/file-buckets-upload)
- [Supabase JavaScript: getPublicUrl](https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl)
- [Supabase JavaScript: remove](https://supabase.com/docs/reference/javascript/file-buckets-remove)

**Uploading files from React to Express**
- [HTML input file](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file)
- [FormData (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [multer](https://github.com/expressjs/multer)
