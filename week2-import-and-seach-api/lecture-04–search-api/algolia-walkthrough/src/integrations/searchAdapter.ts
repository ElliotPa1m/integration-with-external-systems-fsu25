import { algoliasearch } from 'algoliasearch'
import type { Product } from '../data/products.ts'

const APP_ID = process.env.ALGOLIA_APP_ID ?? ''
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY ?? ''
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY ?? ''
const INDEX_NAME = process.env.ALGOLIA_INDEX ?? 'walkthrough_products'





/** 
 *  --- 1. INDEX --- 
 */

const adminClient = algoliasearch(APP_ID, ADMIN_KEY)
// How a product looks in Algolia: the same fields, but the id must be called objectID.
type AlgoliaRecord = {
  objectID: string
  name: string
  category: string
  price: number
  stock: number
  description: string
}


export async function indexProducts(products: Product[]) {
  // 1. Our model → Algolia's model. sku becomes objectID.
  const records: AlgoliaRecord[] = []
  for (const product of products) {
    records.push({
      objectID: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
    })
  }

  // 2. Send them to Algolia. Same objectID again → the product is updated, not duplicated (upsert).
  // waitForTasks: wait until Algolia is done, so a search right after finds the products.
  await adminClient.saveObjects({indexName: INDEX_NAME, objects: records, waitForTasks: true})

  return records.length
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
const searchClient = algoliasearch(APP_ID, SEARCH_KEY)
export async function searchProducts(searchText: string) {
  // We are only sending in the searchText through ?q=
  // But we can send in lots of params through querystring to make the searchresult much more functional with filters and pagination


  // 1. Ask Algolia. Typos are forgiven: "hodie" finds "Hoodie".
  const response = await searchClient.searchSingleIndex<AlgoliaRecord>({ 
    indexName: INDEX_NAME, 
    searchParams: {
      query: searchText,
    }
  });
 
  // 2. Algolia's model → our model. objectID becomes sku again.
  const products: Product[] = []
  for (const hit of response.hits) {
    products.push({
      sku: hit.objectID,
      name: hit.name,
      category: hit.category,
      price: hit.price,
      stock: hit.stock,
      description: hit.description
    })
  }
  return products
}
