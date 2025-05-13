import { inventory, auditLogs } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'

export async function getReportData(){
    const inventoryCol = await inventory()
    //const transactionsCol = await transactions()

    const allProducts = await inventoryCol.find({}).toArray()
    //const allTransactions = await transactionsCol.find({}).toArray()

    const totalProducts = allProducts.length
    const stockData = []

    for(const product of allProducts){
        stockData.push({
            name: product.productName,
            quantity: product.quantity
        })
    }

    stockData.sort((a, b) => b.quantity - a.quantity)

    const stockChart = {
        labels: stockData.map(p => p.name),
        values: stockData.map(p => p.quantity)
    }


    const lowStockChart = {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        values: [
            allProducts.filter(p => p.quantity > p.minThreshold).length,
            allProducts.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length,
            allProducts.filter(p => p.quantity === 0).length
        ]
    }

    const auditLogsCol = await auditLogs()
    const buyLogs = await auditLogsCol.find({ action: 'buyProduct' }).toArray()

    const salesMap = {}

    for(const log of buyLogs){
        const { productName, quantityBefore, quantityAfter } = log.details
        const quantitySold = quantityBefore - quantityAfter
        if(!salesMap[productName]){
            salesMap[productName] = 0
        }
        salesMap[productName] += quantitySold
    }

    const salesArray = Object.entries(salesMap)

    salesArray.sort((a, b) => b[1] - a[1])

    //top 10 selling products
    const topTen = salesArray.slice(0, 10)

    const topSellingRaw = []

    for(const [name, sold] of topTen){
        topSellingRaw.push({ name, sold })
    }

    const topSellingChart = {
        labels: topSellingRaw.map(p => p.name),
        values: topSellingRaw.map(p => p.sold)
    }

    const topSeller = topSellingRaw[0] || { name: 'No Sales', sold: 0 }

    /*
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
        totalLowStock: lowStockChart.values[1],
        stockChart,
        lowStockChart,
        topSellingChart
    }
    */

    return {
        totalProducts,
        totalLowStock: lowStockChart.values[1],
        totalOutOfStock: lowStockChart.values[2],
        stockChart,
        lowStockChart,
        topSellingChart,
        topSeller
    }
}
