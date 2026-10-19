# Lecture 5 – Payment with Stripe


## Video links




## Goals

After this lecture you can:

- explain why a shop integrates a payment service instead of handling card details itself
- create a Stripe Checkout Session on the server, with prices the server looks up – never prices from React
- let the customer pay on Stripe's page (hosted) or in Stripe's form inside your page (embedded)
- receive Stripe's webhook, verify its signature and mark the order as paid
- explain why the return page must not mark the order as paid

## 1. Theory

Study `slides.md`: hosted vs embedded checkout, the Checkout Session, the three keys, the payment flow from cart to paid order, webhooks and signature verification, and why the price is calculated on the server.

## 2. Code walkthrough: `stripe-walkthrough/`

A minimal shop: an Express server and a small React app with a cart and two ways to pay.

Create a free Stripe account and use **test mode**. The keys are under Developers → API keys.

```bash
# Terminal 1 – the server
cd stripe-walkthrough/server
cp .env.example .env    # fill in STRIPE_SECRET_KEY (sk_test_...)
npm install
npm run dev

# Terminal 2 – Stripe forwards webhooks to your computer (Stripe can't reach localhost)
brew install stripe/stripe-cli/stripe   # once
stripe login                            # once
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired \
  --forward-to localhost:3000/api/stripe/webhook
# --events: only the events our webhook handles (newer CLI versions require you to choose)
# → copy the printed whsec_... to STRIPE_WEBHOOK_SECRET in server/.env and restart the server

# Terminal 3 – the client
cd stripe-walkthrough/client
cp .env.example .env    # fill in VITE_STRIPE_PUBLISHABLE_KEY (pk_test_...)
npm install
npm run dev             # http://localhost:5173
```

Pay with the test card `4242 4242 4242 4242`, any future date and any CVC.

### In your own shop: what to install

```bash
# Your server – always
npm install stripe

# Your React client – ONLY for embedded checkout
npm install @stripe/stripe-js @stripe/react-stripe-js
```

| Package | Where | Used for |
|---|---|---|
| `stripe` | Server | Create Checkout Sessions and verify the webhook's signature |
| `@stripe/stripe-js` | Client, embedded only | `loadStripe()` – loads Stripe.js from `js.stripe.com` |
| `@stripe/react-stripe-js` | Client, embedded only | `<EmbeddedCheckoutProvider>` and `<EmbeddedCheckout />` |

- **Hosted only?** The client needs no Stripe package at all – it just sends the customer to the URL from the server
- **The webhook** needs no extra package: `express.raw()` is built into Express
- `@stripe/react-stripe-js` 7 requires `@stripe/stripe-js` 10 – install them together, as above
- **The Stripe CLI** (`stripe listen`) is a program on your computer, not an npm package in the project
- Add the keys to your own `.env` files: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on the server, `VITE_STRIPE_PUBLISHABLE_KEY` in the client (embedded only)

### When the shop is deployed

`stripe listen` only works locally. For the deployed shop, create a webhook endpoint in the Stripe Dashboard (Workbench → Webhooks):

- URL: `https://your-shop.example.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.expired`
- The endpoint gets its own `whsec_...` – put it in the platform's environment variables, not the one from `stripe listen`

## 3. Labb 3

**Labb 3 – Betalning** is the third step of Inlämningsuppgift 1:


## 4. Reading instructions

**Getting started**
- [Sign up for a Stripe account](https://dashboard.stripe.com/register)
- [Stripe CLI: stripe listen](https://docs.stripe.com/cli/listen)

**Integration**
- [Stripe-hosted checkout page](https://docs.stripe.com/checkout/quickstart)
- [Embedded checkout page](https://docs.stripe.com/checkout/embedded/quickstart)
- [The Checkout Session object](https://docs.stripe.com/api/checkout/sessions/object)
- [Checkout Session id in the redirect URL](https://docs.stripe.com/payments/checkout/custom-success-page)
- [Difference between integration types](https://docs.stripe.com/payments/online-payments)
- [Custom payment flow with Elements](https://docs.stripe.com/payments/quickstart) (read if you're interested – not required)

**Webhooks**
- [Webhooks](https://docs.stripe.com/webhooks)
- [Fulfill orders](https://docs.stripe.com/checkout/fulfillment)

**SDK**
- [React Stripe.js](https://docs.stripe.com/sdks/stripejs-react)
- [Server-side SDK (Node)](https://docs.stripe.com/sdks/server-side)
