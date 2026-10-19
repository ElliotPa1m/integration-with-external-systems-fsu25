// EMBEDDED: Stripe's payment form inside our page.
// The card details are typed into an iframe from Stripe – they never pass through our React code or our server.
import { useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import type { CartItem } from '../App.tsx'

// Call loadStripe OUTSIDE the component, so Stripe.js isn't loaded again on every render.
// The publishable key is public: it can only show the form, not create or change payments.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default function EmbeddedPayment({ cart }: { cart: CartItem[] }) {
  // Stripe calls this function when the form is shown.
  // Our server creates the Checkout Session and returns its client secret.
  const fetchClientSecret = useCallback(async () => {
    const response = await fetch('/api/checkout/embedded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    })
    const body = await response.json()
    if (!response.ok) throw new Error(body.error)
    return body.clientSecret as string
  }, [cart])

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
