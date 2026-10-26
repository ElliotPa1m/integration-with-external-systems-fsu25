# Lecture 7 – Shipping with PostNord


## Video links




## Goals

After this lecture you can:

- explain what PostNord's API gives a shop – service points and delivery time with an API key, booking and labels only with a business agreement – and why the shipping price comes from the shop's own price list
- fetch the service points nearest the customer's postal code from PostNord's API, via your own server
- check the customer's chosen service point on the server and save it on the order
- add the shipping to the amount in Stripe, and let the customer order even when PostNord doesn't answer

## 1. Theory

Study `slides.md`: what PostNord's API can and can't do, the shop's own price list, PostNord's developer portal and sandbox, service points, checking the customer's choice on the server, shipping in Stripe, and timeouts.

## 2. Code walkthrough: `shipping-walkthrough/`

A minimal shipping step in a checkout: an Express server and a small React app where the customer enters a postal code and chooses a PostNord service point – or home delivery.

**Get a PostNord API key – once**

1. Create a free account in PostNord's sandbox portal: [atdeveloper.postnord.com](https://atdeveloper.postnord.com)
2. Choose the **Customer plan** – you integrate your own shop. (Partner plan is for platforms that integrate PostNord for many customers.)
3. Create an application (a new API key)
4. Copy the application's API key to `POSTNORD_API_KEY` in `.env`

```bash
# Terminal 1 – the server
cd shipping-walkthrough/server
cp .env.example .env    # fill in POSTNORD_API_KEY
npm install
npm run dev

# Terminal 2 – the client
cd shipping-walkthrough/client
npm install
npm run dev             # http://localhost:5173
```

`server/src/integrations/shippingAdapter.ts` is the only file that knows PostNord. Every step is logged in the server terminal.

The shipping price is not in the walkthrough: PostNord has no price API for Sweden, so it's the shop's own code, not an integration – a fixed price per delivery method, and free shipping over an order value. You build it in Labb 5.

The delivery time is not in the walkthrough either. You build it yourself, with AI, in Labb 5.


## 3. Labb 5

**Labb 5 – Frakt med PostNord (AI-labb)** is the fifth step of Inlämningsuppgift 1. You build shipping in your shop **with AI**, and check the AI's PostNord code against PostNord's docs in the portal:

- Create a PostNord API key in the sandbox
- Show the service points nearest the customer's postal code, and check the customer's choice on the server
- Show the estimated delivery time from PostNord's API in the checkout
- Calculate the shipping price on the server – a fixed price per delivery method, and free shipping over an order value
- Save the shipping on the order, and include it in the amount in Stripe
- In your shop's README: your prompts, what the AI suggested, what differed from PostNord's docs, and how you solved it

**Live API keys must never reach an AI model.** Keep them only in the deployed platform's environment variables (e.g. Vercel or Render), never in the project folder. Locally you only use test keys (PostNord's sandbox, Stripe's `sk_test_`) – and still block `.env` in your AI tool, approve every command the agent wants to run, and never paste a key into a chat.

## 4. Reading instructions

**Getting started**
- [PostNord's sandbox portal](https://atdeveloper.postnord.com)
- [PostNord Developer Portal](https://developer.postnord.com)
- [Service Points V5](https://developer.postnord.com/apis/details?systemName=location-v5-servicepoints)

**AI tools for Labb 5 (free)**
- [GitHub Copilot for students](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students) – apply in good time, it can take a few days
- [GitHub Copilot plans](https://docs.github.com/en/copilot/concepts/billing/individual-plans) – what Copilot Free includes
- [Copilot agent mode in VS Code](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode)
- [Cline](https://cline.bot) and [OpenCode](https://opencode.ai) – open-source agents with free models

**Fetch**
- [URLSearchParams (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [AbortSignal.timeout() (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)

**Stripe (from Labb 3)**
- [line_items in a Checkout Session](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-line_items)
