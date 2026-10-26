import { Router } from 'express'
import { findServicePoints } from '../integrations/shippingAdapter.ts'

const router = Router()

/* --- CHECKOUT: POST /api/checkout  { method, postalCode, servicePointId? } → { method, servicePoint } --- */
router.post('/', async (req, res) => {
  // 1. In your shop: validate the request in your checkout route, e.g. with Zod as in Labb 3 –
  //    the cart, the shipping method ('service_point' or 'home'), the postal code and the service point id.
  //    Invalid → answer 400. The walkthrough skips it and reads the body straight away.
  const { method, postalCode, servicePointId } = req.body

  // 2. Service point: React could send any id – ask PostNord again and look for it in the list
  let servicePoint = null
  if (method === 'service_point') {
    try {
      const nearby = await findServicePoints(postalCode)
      servicePoint = nearby.find((point) => point.id === servicePointId) ?? null
    } catch (err) {
      console.error(err)
      res.status(502).json({ error: 'Could not check the service point with PostNord. Try again, or choose home delivery.' })
      return
    }
    if (!servicePoint) {
      res.status(400).json({ error: 'Choose a service point near your postal code' })
      return
    }
  }
  console.log('\n[CHECKOUT]', method, servicePoint)

  // 3. In your shop: the shipping price from your OWN price list.
  //    A fixed price for "service point" and "home delivery", e.g. 59 kr and 99 kr,
  //    and free shipping when the order value reaches a limit, e.g. 500 kr.
  //    Always calculate the price here on the server – never use a price from React.
  //
  // 4. In your shop: save the shipping on the order:
  //      INSERT INTO orders (..., shipping_method, shipping_price, service_point_id, service_point_name)
  //
  // 5. In your shop: add the shipping as its own row in the Stripe Checkout Session (Labb 3),
  //    so the amount in Stripe = the items + the shipping:
  //      { quantity: 1, price_data: { currency: 'sek', unit_amount: shippingPrice * 100,
  //                                   product_data: { name: 'PostNord – service point' } } }

  res.status(201).json({ method, servicePoint })
})

export default router
