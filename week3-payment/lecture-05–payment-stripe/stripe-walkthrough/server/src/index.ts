import express from 'express'
import checkoutRouter from './routes/checkout.ts'
import webhookRouter from './routes/webhook.ts'

const app = express()

// The webhook FIRST: it needs the raw body to verify Stripe's signature.
// If express.json() runs before it, the raw bytes are gone and every webhook fails with 400.
app.use('/api/stripe/webhook', webhookRouter)

// Every other route gets req.body as JSON
app.use(express.json())
app.use('/api/checkout', checkoutRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
