import { useState, type SubmitEvent } from 'react'

type ServicePoint = { id: string; name: string; address: string }

export default function App() {
  const [method, setMethod] = useState<'service_point' | 'home'>('service_point')
  const [postalCode, setPostalCode] = useState('')
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([])
  const [servicePointId, setServicePointId] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function findServicePoints(e: SubmitEvent) {
    e.preventDefault()
    try {
      // Our server calls PostNord – React never sees the API key
      const response = await fetch(`/api/shipping/service-points?postalCode=${encodeURIComponent(postalCode)}`)
      const body = await response.json()
      setServicePoints(body.servicePoints ?? [])
      setMessage(body.error ?? null) // e.g. "Could not fetch service points from PostNord. You can still choose home delivery."
    } catch {
      setMessage('Could not reach the server. Check your connection and try again.')
    }
  }

  async function placeOrder() {
    try {
      // The server checks the chosen service point with PostNord again – React could send any id
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, postalCode, servicePointId }),
      })
      const body = await response.json()
      setMessage(body.error ?? `Order placed: ${body.servicePoint?.name ?? 'home delivery'}`)
    } catch {
      setMessage('Could not reach the server. Check your connection and try again.')
    }
  }

  return (
    <main>
      <h1>Shipping</h1>

      <label>
        <input type="radio" checked={method === 'service_point'} onChange={() => setMethod('service_point')} />
        PostNord – service point
      </label>
      <label>
        <input type="radio" checked={method === 'home'} onChange={() => setMethod('home')} />
        PostNord – home delivery
      </label>

      {method === 'service_point' && (
        <>
          <form onSubmit={findServicePoints}>
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code, e.g. 111 52" />
            <button>Find service points</button>
          </form>

          {servicePoints.map((point) => (
            <label key={point.id}>
              <input type="radio" checked={servicePointId === point.id} onChange={() => setServicePointId(point.id)} />
              {point.name}, {point.address}
            </label>
          ))}
        </>
      )}

      <button onClick={placeOrder}>Place order</button>

      {message && <p role="alert">{message}</p>}
    </main>
  )
}
