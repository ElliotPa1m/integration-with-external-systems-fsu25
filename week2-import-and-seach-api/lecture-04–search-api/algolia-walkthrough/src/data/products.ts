// The shop's products in OUR model. In your shop they come from the database (e.g. after the import in Labb 1).

export type Product = {
  sku: string
  name: string
  category: string
  price: number
  stock: number
  description: string
}

export const products: Product[] = [
  { sku: 'LEV-1001', name: 'Hoodie Svart', category: 'Hoodies', price: 599, stock: 12, description: 'Mjuk hoodie i ekologisk bomull med huva.' },
  { sku: 'LEV-1002', name: 'Zip-hoodie Grå', category: 'Hoodies', price: 699, stock: 0, description: 'Hoodie med dragkedja och borstad insida.' },
  { sku: 'LEV-1003', name: 'T-shirt Vit', category: 'T-shirts', price: 199, stock: 30, description: 'Klassisk t-shirt i ekologisk bomull.' },
  { sku: 'LEV-1004', name: 'Långärmad t-shirt Grön', category: 'T-shirts', price: 249, stock: 8, description: 'Tunn tröja i bomull, perfekt under en jacka.' },
  { sku: 'LEV-1005', name: 'Mössa Marinblå', category: 'Mössor', price: 199, stock: 15, description: 'Varm stickad mössa i merinoull.' },
  { sku: 'LEV-1006', name: 'Vindjacka Svart', category: 'Jackor', price: 899, stock: 4, description: 'Lätt vindjacka som tål regn, med huva.' },
  { sku: 'LEV-1007', name: 'Tygkasse Vit', category: 'Väskor', price: 129, stock: 50, description: 'Rymlig tygkasse i återvunnen bomull.' },
  { sku: 'LEV-1008', name: 'Mjukisbyxor Grå', category: 'Byxor', price: 499, stock: 0, description: 'Avslappnade mjukisbyxor med fickor.' },
]
