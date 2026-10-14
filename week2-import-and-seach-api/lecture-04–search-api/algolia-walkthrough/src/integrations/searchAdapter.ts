import { algoliasearch } from 'algoliasearch'
import type { Product } from '../data/products.ts'

const APP_ID = process.env.ALGOLIA_APP_ID ?? ''
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY ?? ''
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY ?? ''
const INDEX_NAME = process.env.ALGOLIA_INDEX ?? 'walkthrough_products'





/** 
 *  --- 1. INDEX --- 
 */
// How a product looks in Algolia: the same fields, but the id must be called objectID.

export async function indexProducts(products: Product[]) {
  // 1. Our model → Algolia's model. sku becomes objectID.

  // 2. Send them to Algolia. Same objectID again → the product is updated, not duplicated (upsert).
  // waitForTasks: wait until Algolia is done, so a search right after finds the products.

}

// Removes products from Algolia, e.g. when they are deleted in the shop.
// Otherwise the search still finds products that no longer exist.
export async function removeProducts(skus: string[]) {
  // Our sku is Algolia's objectID, so we can send the skus as they are.
}

/** 
 *  --- 2. SEARCH --- 
 */
// The search key may only SEARCH. If it leaks, nobody can change our products.

export async function searchProducts(searchText: string) {
  // We are only sending in the searchText through ?q=
  // But we can send in lots of params through querystring to make the searchresult much more functional with filters and pagination


  // 1. Ask Algolia. Typos are forgiven: "hodie" finds "Hoodie".
 
  // 2. Algolia's model → our model. objectID becomes sku again.
}
