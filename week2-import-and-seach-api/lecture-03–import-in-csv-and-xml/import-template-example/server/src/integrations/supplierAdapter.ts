// Adapter for the supplier's catalogue files (CSV and XML).
// This is the ONLY file that knows the supplier's file formats.
// Nothing is validated here – that is done in routes/admin.ts.
//
// TEMPLATE: fetching is done. You write the parsing of the files yourself.
// The parser settings, and why they are needed, are shown in csv-xml-walkthrough.

import { parse } from 'csv-parse/sync';
import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';

const BASE_URL = process.env.SUPPLIER_API_URL;
const API_KEY = process.env.SUPPLIER_API_KEY ?? '';
const TIMEOUT_MS = Number(process.env.SUPPLIER_API_TIMEOUT_MS ?? 5000);
// Which of the supplier's industries the shop buys from, e.g. klader or kaffe. All are listed in GET /v1/branscher.
const BRANSCH = process.env.SUPPLIER_BRANSCH ?? 'klader';

export type CatalogFormat = 'csv' | 'xml';

// A row from the supplier's file, translated to OUR model but not yet validated.
// That is why e.g. price can be NaN and sku can be missing.
// Adapt the fields to your own product model.
export type ProductCandidate = {
  sku: string | undefined;
  // TODO: the rest of the fields in your product model.
};

// "599,00" and "599.00" → 599. "1 299,50" → 1299.5. Empty or corrupt text, e.g. "59x,00" → NaN.
// NaN is the honest answer to "this isn't a number": Zod in the route stops it, and the product is skipped.
function parseDecimal(value: unknown): number {
  const text = String(value ?? '').replace(/\s/g, '').replace(',', '.');
  return text === '' ? NaN : Number(text);
}

function parseCsvCatalog(buffer: Buffer): ProductCandidate[] {
  // 1. Decode: which character encoding does the supplier send? Does it say in /docs?
  // 2. Parse with parse() from csv-parse: which settings does this particular file need?
  // 3. Map the supplier's columns → ProductCandidate.
  //
  // Think about:
  // - The EAN can start with 0. Should it be text or a number?
  // - The price has a decimal comma. What does Number('599,00') give?
  // - The stock can be empty. What does that mean for your shop?
  // - The variants are in one column, e.g. "S|M|L".
  //
  // TODO
  return [];
}

function parseXmlCatalog(buffer: Buffer): ProductCandidate[] {
  // 1. Decode: which character encoding does the XML file have?
  // 2. Check that the file is valid XML with SyntaxValidator.validate(). XMLParser doesn't complain by itself.
  // 3. Parse with XMLParser: which settings does this particular file need?
  // 4. Map the supplier's tags → ProductCandidate.
  //
  // Think about:
  // - The article number is an attribute, not a tag.
  // - The EAN can start with 0. What does XMLParser do with it by default?
  // - A product can have ONE variant. Is it still a list then?
  // - <pris> has an attribute. Where does the text itself end up?
  //
  // TODO
  return [];
}

// Fetches the supplier's catalogue file and returns the rows in OUR model.
export async function getSupplierCatalog(format: CatalogFormat): Promise<ProductCandidate[]> {
  try {
    const response =  await fetch(`${BASE_URL}/export/products.${format}?bransch=${BRANSCH}`, {
      headers: { 'X-Api-Key': API_KEY },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error('Could not fetch the catalogue file from the supplier', { cause: response.statusText })
    }

    const buffer =  Buffer.from(await response.arrayBuffer());

    switch(format) {
      case 'csv':
        return parseCsvCatalog(buffer)
      case 'xml':
        return parseXmlCatalog(buffer)
    }
  } catch (err) {
    throw new Error('Could not fetch the catalogue file from the supplier', { cause: err });
  }
}
