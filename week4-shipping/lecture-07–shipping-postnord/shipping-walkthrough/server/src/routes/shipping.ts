import { Router } from 'express'
import { findServicePoints } from '../integrations/shippingAdapter.ts'

const router = Router()

/* --- SERVICE POINTS: GET /api/shipping/service-points?postalCode=11152 → { servicePoints } --- */
router.get('/service-points', async (req, res) => {
  // 1. In your shop: validate the postal code
  //    Invalid → answer 400 with a clear message. The walkthrough skips it and reads the query straight away.
  const postalCode = String(req.query.postalCode ?? '')

  // 2. Ask PostNord
  try {
    const servicePoints = await findServicePoints(postalCode)
    res.json({ servicePoints })
  } catch (err) {
    console.error(err)
    // The customer can still order: home delivery doesn't need PostNord's API.
    res.status(502).json({ error: 'Could not fetch service points from PostNord. You can still choose home delivery.' })
  }
})

export default router
