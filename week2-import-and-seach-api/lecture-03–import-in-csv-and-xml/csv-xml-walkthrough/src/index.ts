import express from 'express'
import fakeSupplierRouter from './routes/fakeSupplier.ts'
import importRouter from './routes/import.ts'

const app = express()

// The fake supplier lives in the same app, so we don't need an external service.
app.use('/supplier', fakeSupplierRouter)
app.use('/api/import', importRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
