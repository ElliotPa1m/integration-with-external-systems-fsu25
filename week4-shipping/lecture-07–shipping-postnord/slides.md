---
marp: true
theme: default
paginate: true
---

# Integration with third-party systems

## Lecture 7 – Shipping with PostNord

---

<!-- Theory -->

# What does a shop need from a carrier?

| Need | From PostNord's API? |
|---|---|
| **Service points** near the customer | Yes – with an API key |
| **Delivery time** | Yes – with an API key |
| **The shipping price** | No price API for Sweden – the shop sets its own |
| **Labels and booking** | Only with a business agreement (customer number) |

We **integrate** what we can get, and build the rest ourselves: our own price list.

---

# Our own price list

PostNord has no price API for Sweden – so the shop sets its own:

| | Service point | Home delivery |
|---|---|---|
| Order under 500 kr | 59 kr | 99 kr |
| Order 500 kr or more | Free | Free |

- **Our own code** – not an integration, so it always works
- Calculated **on the server** – same rule as the item prices in Labb 3
- No weight, no distance: a fixed price, and free over a limit
- Not in the walkthrough: you build it in **Labb 5**

---

# PostNord's developer portal

| | Portal | API |
|---|---|---|
| **Sandbox** – for development | `atdeveloper.postnord.com` | `atapi2.postnord.com` |
| **Production** | `developer.postnord.com` | `api2.postnord.com` |

1. Create an account – choose the **Customer plan** (Partner plan = platforms serving many customers)
2. Create an **application**
3. The application's **API key** → `.env`

---

# Service points nearest a postal code

```
GET https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress
    ?apikey=...
    &returnType=json
    &countryCode=SE
    &postalCode=11152
    &numberOfServicePoints=5
```

The key goes in the **query string** – so never log the URL.

---

# PostNord's answer → our model

```json
{ "servicePointInformationResponse": { "servicePoints": [ {
    "servicePointId": "376062",
    "name": "ICA KVANTUM GISLAVED",
    "routeDistance": 0,
    "visitingAddress": { "streetName": "Stinsgatan", "streetNumber": "2", … },
    "openingHours": { … }, "coordinates": [ … ], …
} ] } }
```

The adapter returns only what the shop uses:

```ts
{ id: '376062', name: 'ICA KVANTUM GISLAVED', address: 'Stinsgatan 2, GISLAVED' }
```

The walkthrough **trusts** the answer. In your shop: fill in the `PostNordAnswer` schema with **Zod** and validate first.

---

# The flow in the walkthrough

```
React                 Express                    PostNord
  │ postal code          │                          │
  │─────────────────────►│ 1. nearest ─────────────►│
  │◄── service points ───│◄─────────────────────────│
  │ choice               │                          │
  │─────────────────────►│ 2. check the choice ────►│
  │                      │ 3. price (own list)      │
  │◄──── the order ──────│ 4. save → Stripe         │
```

---

# The flow in Labb 5 – with delivery time

```
React                 Express                    PostNord
  │ postal code          │                          │
  │─────────────────────►│ 1. nearest ─────────────►│
  │◄── service points ───│◄─────────────────────────│
  │                      │ 2. delivery time* ──────►│
  │◄── estimated date ───│◄─────────────────────────│
  │ choice               │                          │
  │─────────────────────►│ 3. check the choice ────►│
  │                      │ 4. price (own list)      │
  │◄──── the order ──────│ 5. save → Stripe         │
```

*\* Not in the walkthrough – you build it in Labb 5.*

Service points and delivery time: one route or two – your choice.

---

# Check the customer's choice

React could send **any** service point id.

```ts
const nearby = await findServicePoints(postalCode)
const servicePoint = nearby.find((point) => point.id === servicePointId)

if (!servicePoint) {
  res.status(400).json({ error: 'Choose a service point near your postal code' })
  return
}
```

The server asks PostNord again – the same function as the list in React.

---

# Save the shipping on the order

```sql
INSERT INTO orders (..., shipping_method, shipping_price,
                         service_point_id, service_point_name)
VALUES (..., 'service_point', 79, '376062', 'ICA KVANTUM GISLAVED')
```

- `service_point_id` – for the label, when the order is sent
- `service_point_name` – to show on the order, without asking PostNord again

---

# Shipping in Stripe

The shipping is **one more row** in the Checkout Session from Labb 3:

```ts
lineItems.push({
  quantity: 1,
  price_data: {
    currency: 'sek',
    unit_amount: shippingPrice * 100, // kr → öre
    product_data: { name: 'PostNord – service point' },
  },
})
```

The amount in Stripe = the items + the shipping.

---

# When PostNord doesn't answer

| | What happens |
|---|---|
| The shipping prices | Still work – our own price list |
| The service points | `502` "Could not fetch service points from PostNord. You can still choose home delivery." |
| Home delivery | Works – it doesn't need PostNord's API |

The customer can **always** order.

---

# Timeout: plain fetch again

No SDK this time – the same `fetch` as in L1 and L2:

```ts
const response = await fetch(url, { signal: AbortSignal.timeout(5_000) })
if (!response.ok) {
  throw new Error(`PostNord answered ${response.status}`)
}
```

The route catches the error → **502** with a clear message → the shop keeps running.

---

# Code walkthrough: `shipping-walkthrough/`

1. `shippingAdapter.ts`: `findServicePoints()` → PostNord → our model
2. `GET /api/shipping/service-points?postalCode=…`
3. `POST /api/checkout`: check the chosen service point with PostNord again

**"In your shop:" comments – yours to do:**

- Validate the postal code and the checkout request
- The `PostNordAnswer` schema with Zod
- The price from your own list, save it on the order, a row in Stripe

**Not in the walkthrough:** the delivery time – you build it with AI in Labb 5.

---

# Labb 5 – Frakt med PostNord (AI lab)

Build shipping in your shop **with AI** – then check it against PostNord's docs.

- **Service points** and **delivery time** from PostNord's API
- **Your own shipping price** on the server – and free shipping over an order value
- The shipping on the order and in the amount in Stripe
- **In your README:** your prompts, what the AI got wrong, and how you fixed it

**Live API keys never reach the AI** – only test keys in the project, `.env` blocked in the tool.

*(Go through the requirements and "Klart när" in Labb 5)*
