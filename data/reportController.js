import { inventory, transactions } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'

export async function getReportData(){
    const inventoryCol = await inventory()
    const transactionsCol = await transactions()

    const allProducts = await inventoryCol.find({}).toArray()
    const allTransactions = await transactionsCol.find({}).toArray()

    const totalProducts = allProducts.length
    const totalTransactions = allTransactions.length

    const stockChart = {
        labels: allProducts.map(p => p.productName),
        values: allProducts.map(p => p.quantity)
    }

    const lowStockChart = {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        values: [
            allProducts.filter(p => p.quantity > p.minThreshold).length,
            allProducts.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length,
            allProducts.filter(p => p.quantity === 0).length
        ]
    }

    const restockTransactions = allTransactions.filter(t => t.actionName === 'restock')
    const restockMap = restockTransactions.reduce((acc, t) => {
        acc[t.productId] = (acc[t.productId] || 0) + t.quantityChanged
        return acc
    }, {})

    const sellTransactions = allTransactions.filter(t => t.actionName === 'sell')

    const salesMap = sellTransactions.reduce((acc, t) => {
        acc[t.productId] = (acc[t.productId] || 0) + t.quantityChanged
        return acc
    }, {})


    const topSellingRaw = []

    for(const [id, sold] of Object.entries(salesMap)){
        const product = await inventoryCol.findOne({ _id: new ObjectId(id) })
        if(product){
            topSellingRaw.push({ name: product.productName, sold })
        }
    }

    const topSellingChart = {
        labels: topSellingRaw.filter(Boolean).map(p => p.name),
        values: topSellingRaw.filter(Boolean).map(p => p.sold)
    }

    return {
        totalProducts,
        totalTransactions,
        totalLowStock: lowStockChart.values[1],
        stockChart,
        lowStockChart,
        topSellingChart
    }
}
