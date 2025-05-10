import { inventory, users, transactions } from '../config/mongoCollections.js'

export async function getDashboardData() {
  const inventoryCol = await inventory()
  const usersCol = await users()
  const transactionsCol = await transactions()
  const products = await inventoryCol.find({}).toArray()
  const totalQuantity = products.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const lowStockItems = products.filter(p => p.quantity <= p.minThreshold)

  const topSellingProducts = await transactionsCol
    .aggregate([
      { $group: { _id: "$productId", totalSold: { $sum: "$quantityChanged" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "inventory",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.productName",
          sold: "$totalSold",
          remaining: "$product.quantity",
          price: "$product.unitPrice"
        }
      }
    ])
    .toArray()

  const supplierCount = await usersCol.countDocuments({ roleName: 'supplier' })
  const uniqueCategories = new Set(products.map(p => p.categoryName?.toLowerCase()))
  const categoryCount = uniqueCategories.size

  return {
    totalQuantity,
    lowStockItems,
    topSellingProducts,
    categoryCount,
    supplierCount,
    dummyRevenue: 18300,
    dummyProfit: 868,
    dummyCost: 17432,
    dummySales: 832
  }
}
