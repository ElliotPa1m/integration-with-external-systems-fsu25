import express from 'express'
import checkoutRouter from './routes/checkout.ts'
import shippingRouter from './routes/shipping.ts'

const app = express()
app.use(express.json())

app.use('/api/shipping', shippingRouter)
app.use('/api/checkout', checkoutRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
