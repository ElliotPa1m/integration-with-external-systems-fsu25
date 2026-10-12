import express, { type NextFunction, type Request, type Response } from 'express'

const app = express()
app.use(express.json())


import currencyRouter from './routes/currency.ts'
import adminRoutes from './routes/admin.ts'
app.use('/api/currency',currencyRouter)
app.use('/api/admin',adminRoutes)

// General error handling for all errors
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${req.method} ${req.originalUrl} failed: ${message}`);
  res.status(500).json({ error: 'Something went wrong on the server' });
});


const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})







