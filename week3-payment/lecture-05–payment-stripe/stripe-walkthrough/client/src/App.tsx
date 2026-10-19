// A minimal shop: one page with a cart and two ways to pay, and a return page.
// React only calls OUR server (/api/...). The only Stripe key here is the PUBLIC publishable key.
import { useState } from 'react'
import EmbeddedPayment from './components/EmbeddedPayment.tsx'
import ReturnPage from './components/ReturnPage.tsx'

// The cart only says WHAT the customer buys. The server looks up the prices.
export type CartItem = { sku: string; quantity: number }
const cart: CartItem[] = [
  { sku: 'LEV-1001', quantity: 1 }, // Hoodie Svart
  { sku: 'LEV-1003', quantity: 2 }, // T-shirt Vit
]

export default function App() {
  const [showEmbedded, setShowEmbedded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stripe sends the customer back to /return?session_id=... after paying.
  // (A real shop uses a router here.)
  if (window.location.pathname === '/return') {
    return <ReturnPage />
  }

  /* --- 1. HOSTED: ask our server for a URL, then leave our site for Stripe's page --- */
  async function payHosted() {
    try {
      const response = await fetch('/api/checkout/hosted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
      const body = await response.json()
      if (!response.ok) {
        // e.g. 502 when Stripe doesn't answer – the server's understandable message
        setError(body.error)
        return
      }
      window.location.href = body.url // to Stripe's payment page
    } catch {
      // Our own server can't be reached at all (or answered something that isn't JSON)
      setError('Could not reach the shop. Check your connection and try again.')
    }
  }

  return (
    <main>
      <h1>Checkout</h1>

      <h2>Cart</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.sku}>
            {item.sku} × {item.quantity}
          </li>
        ))}
      </ul>

      <h2>Pay</h2>
      <button onClick={payHosted}>Pay on Stripe's page (hosted)</button>
      <button onClick={() => setShowEmbedded(true)}>Pay here on our page (embedded)</button>

      {error && <p role="alert">{error}</p>}





      {/* 2. EMBEDDED: Stripe's form inside our page */}
      {showEmbedded && <EmbeddedPayment cart={cart} />}
    </main>
  )
}
