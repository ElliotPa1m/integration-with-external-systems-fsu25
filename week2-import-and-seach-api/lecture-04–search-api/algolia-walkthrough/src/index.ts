import express from 'express'
import adminRouter from './routes/admin.ts'
import searchRouter from './routes/search.ts'

const app = express()
app.use(express.json())


app.use('/api/admin', adminRouter)
app.use('/api/search', searchRouter)


const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
