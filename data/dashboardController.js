import { inventory, users } from '../config/mongoCollections.js'

export async function getDashboardData() {
    const inventoryCol = await inventory()
    const usersCol = await users()
    const products = await inventoryCol.find({}).toArray()
    const totalQuantity = products.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const lowStockItems = products.filter(p => p.quantity <= p.minThreshold)

    const productCount = products.length
    // calculate total price by summing up all product values
    const totalPrice = products.reduce((sum, product) => {
        const productValue = product.quantity * product.unitPrice
        return sum + productValue
    }, 0).toFixed(2)

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
