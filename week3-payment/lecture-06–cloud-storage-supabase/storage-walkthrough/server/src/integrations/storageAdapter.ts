// TIMEOUT AND ERRORS – the common requirement in Labb 4:
// "Every call has a timeout. If the service is down, the user gets an understandable message, and the shop doesn't crash."
//   - Every request to Supabase gives up after 10 s (global.fetch in createClient below)
//   - supabase-js doesn't throw – it returns { data, error }. We check error and throw our own error
//   - The route catches it and answers 502 with a clear message (routes/admin.ts). The product keeps its old image.

import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? ''
const BUCKET = process.env.SUPABASE_BUCKET ?? 'product-images'
const TIMEOUT_MS = 10_000

if (!SUPABASE_URL || !SECRET_KEY) {
  throw new Error('Supabase is not configured. Copy .env.example to .env and fill in SUPABASE_URL and SUPABASE_SECRET_KEY.')
}

// Initiating supabase client


// The image types we accept, and the file extension each one gets in the bucket.


/* --- 1. UPLOAD: an image → a file in the bucket → its public URL --- */
export async function uploadProductImage() {
  // 1. A NEW, unique path every time – never the admin's own file name, and never overwrite.
  //    "hoodie.png" from two admins would overwrite each other. And Supabase's CDN can keep showing
  //    an old image for a while if a file is overwritten. A new path = a new URL = no stale image.
  

  // 2. Send the bytes to Supabase Storage
  // console.log('\n[UPLOAD] Saved in the bucket:')

  // 3. The public URL. The bucket is PUBLIC: anyone with the URL can see the image – that's what we want
  //    for product images. getPublicUrl only builds the URL, it doesn't call Supabase.
  // console.log('[UPLOAD] Public URL:')


  // We return BOTH: the path to delete the file later, the URL to show it.
  return { path: '', url: '' }
}

/* --- 2. REMOVE: delete a file we no longer use --- */
export async function removeProductImage() {
 
  // console.log('\n[REMOVE] Deleted from the bucket:')
}
