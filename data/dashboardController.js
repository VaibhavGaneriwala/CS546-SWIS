import { inventory, users } from '../config/mongoCollections.js'

export async function getDashboardData() {
  const inventoryCol = await inventory()
  const usersCol = await users()
  const products = await inventoryCol.find({}).toArray()
  const totalQuantity = products.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const lowStockItems = products.filter(p => p.quantity <= p.minThreshold)

  const productCount = products.length
  // find all products with total price
  const totalPrice = products.map(product => ({
    ...product,
    totalPrice: +(product.quantity * product.unitPrice).toFixed(2)
  }))
  const uniqueCategories = new Set(products.map(p => p.categoryName?.toLowerCase()))
  const categoryCount = uniqueCategories.size

  return {
    productCount,
    totalQuantity,
    lowStockItems,
    categoryCount,
    totalPrice
  }
}
