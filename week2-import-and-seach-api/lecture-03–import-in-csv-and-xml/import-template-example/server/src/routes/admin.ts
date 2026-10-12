import { Router } from 'express';
import { z } from 'zod';
import { getSupplierCatalog } from '../integrations/supplierAdapter.ts';

const router = Router();

// TEMPLATE: the steps are in place, you fill in the TODOs.
// Your shop's structure decides where the code ends up. Only routes? Keep it here.
// Controllers or services? Move it there. Everything that knows the supplier stays in the adapter.

// The shop's requirements for a product before it may be saved. The same for CSV and XML.
//
// Compare with Zod in L2:
// - L2 validated THEIR data against THEIR docs: the supplier's JSON fields, BEFORE mapping.
//   "Did the supplier send what they promised?" If not, they changed or broke something.
// - Here we validate OUR data against OUR rules: the shop's fields, AFTER mapping.
//   "Can this product be in our shop?" If not, skip that product with a reason and continue.
// CSV and XML have no types – every value is text – so a schema of their fields would only
// say "string". The real checks (price > 0, EAN 13 digits) only make sense once "599,00" is 599.
// For a JSON API you can do both: check their shape → map → check against our rules.
const ImportedProduct = z.object({
  sku: z.string().min(1),
  // TODO: the rest of the fields in your product model.
  // What must be true for name, price, stock, ean and variants?
});

/* --- Import from the supplier API: POST /api/admin/products/import/csv OR /xml --- */
router.post('/products/import/:format', async (req, res) => {
  // 1. Check the format
  const { format } = req.params;
  if (format !== 'csv' && format !== 'xml') {
    res.status(400).json({ error: 'The format must be csv or xml' });
    return;
  }

  // 2. The adapter fetches, parses and maps. The route knows nothing about CSV, XML or the supplier's fields.
  const candidates = await getSupplierCatalog(format);

  for (const candidate of candidates) {
    // 3. Validate each product with ImportedProduct.safeParse(candidate)
    //
    // Think about: one product's price is broken, e.g. "59x,00", so price becomes NaN.
    // - Should it be saved with price 0?
    // - Should the whole import stop?
    // - Or should the product be skipped, with a reason the admin can read?
    // What happens in the shop with each choice?
    //
    // TODO

    // 4. Save the valid product in your DB with upsert on sku:
    // update it if the sku exists, otherwise insert it. A second import must not create duplicates.
    // How do you find out whether it was new or updated?
    //
    // TODO
  }

  // 5. Respond with a report: how many new, updated and skipped (with the reason).
  // TODO
  res.json({ format, total: candidates.length });
});



// Extra: Not included in the labb 1, just an extra assignment if you feel the need to be more challenged
router.get('/orders/export.csv', (_req, res) => {
});
router.get('/orders/export.xml', (_req, res) => {
});

export default router;
