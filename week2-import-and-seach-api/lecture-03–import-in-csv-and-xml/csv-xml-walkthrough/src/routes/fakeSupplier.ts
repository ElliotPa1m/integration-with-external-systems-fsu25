// Pretends to be the supplier's server. Sends the files in data/ exactly as they are stored on disk.
import { Router } from 'express'
import path from 'node:path'

const router = Router()
const DATA_DIR = path.join(import.meta.dirname, '../../data')

// The file is saved in Windows-1252, not UTF-8. We say so in Content-Type.
// charset is only a label: the server sends the file's bytes unchanged and tells the receiver how to read them.
// The receiver can still ignore the label, and fetch does (see supplierAdapter.ts).
router.get('/products.csv', (_req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=windows-1252')
  res.sendFile(path.join(DATA_DIR, 'products.csv'))
})

// This file is saved in UTF-8. The encoding is a choice made by whoever created the file, not by the format.
router.get('/products.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.sendFile(path.join(DATA_DIR, 'products.xml'))
})

export default router
