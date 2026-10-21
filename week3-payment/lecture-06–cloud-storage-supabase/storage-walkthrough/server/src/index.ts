import express from 'express'
import adminRouter from './routes/admin.ts'

const app = express()
app.use(express.json())

// In your shop, an admin check goes here once, for every admin route:
// app.use('/api/admin', requireAdmin)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
