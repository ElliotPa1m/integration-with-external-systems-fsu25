import { Router, type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'
import { removeProductImage, uploadProductImage } from '../integrations/storageAdapter.ts'

const router = Router()

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB, Matches the Supabase Storage Bucket limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

// multer reads multipart/form-data, the format a browser uses to send files.
// limits the fileSize to 5MB


// Receives ONE file in the field "image". If multer can't read it, we answer 400 with a clear message.

/* --- UPLOAD: POST /api/admin/products/:sku/image  (multipart/form-data, field "image") → { url } --- */
router.post('/products/:sku/image', async (req, res) => {
  // 1. Validate file and sku
  const sku = typeof req.params.sku === 'string' ? req.params.sku : ''
  if (!sku) {
    res.status(400).json({ error: 'Invalid sku' })
    return
  }

  // console.log('\n[ADMIN] Image for', sku, '–', req.file.originalname, req.file.mimetype, req.file.size, 'bytes')

  // 2. In your shop: fetch the product from the DB by sku – it must exist, and we need its OLD image:
  //    SELECT image_path FROM products WHERE sku = $1      → no row: answer 404
  //    In the walkthrough there is no database, so every valid sku is accepted and there is no old image.


  // 3. Upload to Supabase Storage
  let image
  try {
    image = await uploadProductImage()
  } catch (err) {
    console.error(err)
    // The product keeps its old image – nothing has been changed in the DB yet.
    res.status(502).json({ error: 'The image service is not responding. Try again later.' })
    return
  }

  // 4. In your shop: save the new image on the product. Save BOTH the path and the URL:
  //    the URL to show the image, the path to delete the file later.
  //      UPDATE products SET image_path = $1, image_url = $2 WHERE sku = $3

  // 5. Delete the old image from Supabase Storage – only NOW, after the new one is uploaded AND saved.
  //    In the other order, a failed upload would leave the product without any image.
  //    oldImagePath is the image_path fetched in step 2, before the UPDATE in step 4 overwrote it.
  //      if (oldImagePath) await removeProductImage(oldImagePath)
  //    In the walkthrough there is no old image (no database, see step 2), so this line is a comment.
  //    If the removal fails: log it and still answer 201. The product shows the new image –
  //    the old file is only left over in the bucket (it can be cleaned up later).


  res.status(201).json({ path: image.path, url: image.url })
})

/* --- DELETE: DELETE /api/admin/products/:sku/image → { deleted } --- */
// Removes the product's image without replacing it.
router.delete('/products/:sku/image', async (req, res) => {
  // 1. In your shop: fetch the image's path from the DB by sku – NEVER from the request,
  //    so an admin can't delete any file in the bucket by sending another path.
  //      SELECT image_path FROM products WHERE sku = $1
  //    No row → 404 "No such product". image_path is NULL → 404 "The product has no image".
  //
  //    In the walkthrough there is no database, so React sends the path in the query string:
  //    ?path=products/LEV-1001/...png
  const path = (req.query.path ?? '') as string

  // 2. Delete the file from Supabase Storage
  try {
    await removeProductImage(path)
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: 'The image service is not responding. Try again later.' })
    return
  }

  // 3. In your shop: remove the image from the product as well:
  //      UPDATE products SET image_path = NULL, image_url = NULL WHERE sku = $1
  res.json({ deleted: path })
})

export default router
