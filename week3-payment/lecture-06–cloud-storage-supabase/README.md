# Lecture 6 – Product images in cloud storage (Supabase Storage)


## Video links
- [01 - Product images in Supabase storage slides](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FMeeting%20in%20Inspelning%2D20261021%5F114347%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E9ac4eb5b%2Da973%2D41a0%2Dab74%2D07c6a994fd11)
- [02 - Getting started with code (Send file from React to Express, retrieving with Multer)](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FMeeting%20in%20Inspelning%2D20261021%5F130627%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E5ad5c53e%2D2a84%2D470e%2Da5e5%2D6941f4cd3d2f)
- [03 - Validating the uploaded file with Multer](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FMeeting%20in%20Inspelning%2D20261021%5F144036%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E1706b3ac%2Dba13%2D46cd%2Da69d%2D55548426fb54)
- [04 - Upload image to Supabase Storage](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FMeeting%20in%20Inspelning%2D20261021%5F161656%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ed9bedf6b%2Dd7dc%2D4186%2D87fe%2Da0f32059f8b2)
- [05 - Delete image from Supabase, and Labb 4](https://medieinstitutet.sharepoint.com/sites/FSU25D/_layouts/15/stream.aspx?id=%2Fsites%2FFSU25D%2FDelade%20dokument%2FIntegration%20med%203%2Dpartssystem%2FRecordings%2FMeeting%20in%20Inspelning%2D20261021%5F173209%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E7c28d90a%2D7961%2D4818%2Da26a%2Dbb95d58489bf)



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
- [HTML input file (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file)
- [FormData (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [multer](https://github.com/expressjs/multer)
