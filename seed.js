// seed.js
import { ObjectId } from 'mongodb'
import { dbConnection } from './config/mongoConnection.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

const db = await dbConnection()
const inventory = db.collection('inventory')
const auditLogs = db.collection('auditLogs')
const users = db.collection('users')
await inventory.deleteMany({})
await users.deleteMany({})
await auditLogs.deleteMany({})

// Create users
const userInfos = [
    { firstName: 'Bat', lastName: 'Man', email: 'batman@gmail.com', username: 'lego', password: 'Password@1', roleName: 'admin' },
    { firstName: 'Clark', lastName: 'Kent', email: 'superman@gmail.com', username: 'superman', password: 'Superman@1', roleName: 'user' },
    { firstName: 'Diana', lastName: 'Prince', email: 'wonderwoman@gmail.com', username: 'wonderwoman', password: 'Wonder@1', roleName: 'user' },
    { firstName: 'Barry', lastName: 'Allen', email: 'flash@gmail.com', username: 'flash', password: 'Flash@1', roleName: 'user' },
    { firstName: 'Selina', lastName: 'Kyle', email: 'catwoman@gmail.com', username: 'catwoman', password: 'Cat@1', roleName: 'user' },
    { firstName: 'Victor', lastName: 'Stone', email: 'cyborg@gmail.com', username: 'cyborg', password: 'Cyborg@1', roleName: 'user' },
]

const userDocs = await Promise.all(userInfos.map(async (u) => ({
    ...u,
    password: await bcrypt.hash(u.password, SALT_ROUNDS),
    createdAt: new Date()
})))
const userInsertResult = await users.insertMany(userDocs)
const userIds = Object.values(userInsertResult.insertedIds)

// Generate 50+ inventory items
const categories = ['electronics', 'supplies', 'hardware', 'office', 'furniture', 'tools', 'software']
const productNames = [
    'Bluetooth Scanner', 'Thermal Printer', 'Barcode Labels', 'Thermal Ribbon', 'Laptop', 'Desktop PC', 'Monitor', 'Keyboard', 'Mouse', 'USB Drive',
    'External HDD', 'Router', 'Switch', 'Ethernet Cable', 'Label Maker', 'Packing Tape', 'Box Cutter', 'Safety Gloves', 'Pallet Jack', 'Hand Truck',
    'Clipboard', 'Whiteboard', 'Desk Chair', 'Filing Cabinet', 'Printer Paper', 'Ink Cartridge', 'Stapler', 'Paper Clips', 'Rubber Bands', 'Notepad',
    'Calculator', 'Projector', 'Extension Cord', 'Power Strip', 'Surge Protector', 'Toolbox', 'Hammer', 'Screwdriver Set', 'Wrench Set', 'Drill',
    'Measuring Tape', 'Flashlight', 'Batteries', 'First Aid Kit', 'Fire Extinguisher', 'Safety Glasses', 'Ear Protection', 'Work Boots', 'Hi-Vis Vest', 'Software License'
]

const items = []
for (let i = 0; i < 50; i++) {
    const category = categories[i % categories.length]
    const productName = productNames[i % productNames.length] + (i > productNames.length ? ` ${i}` : '')
    const quantity = Math.floor(Math.random() * 50)
    const minThreshold = Math.floor(Math.random() * 10) + 1
    const unitPrice = +(Math.random() * 500 + 5).toFixed(2)
    const recommendedQty = Math.floor(Math.random() * 100) + 10
    const nextRestockDate = `2025-06-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`
    items.push({
        _id: new ObjectId(),
        productName,
        categoryName: category,
        quantity,
        minThreshold,
        unitPrice,
        restockSuggestion: {
            recommendedQty,
            nextRestockDate
        },
        lastUpdated: new Date()
    })
}

await inventory.insertMany(items)

//generate 20 logs
const sampleActions = ['addProduct', 'updateProduct', 'removeProduct']
const sampleLogs = []

for(let i = 0; i < 20; i++){
    const userIndex = Math.floor(Math.random() * userDocs.length)
    const user = userDocs[userIndex]
    const action = sampleActions[i % sampleActions.length]
    const product = items[i]

    const details = {
        productName: product.productName,
        categoryName: product.categoryName
    }

    if(action === 'updateProduct'){
        details.before = { quantity: product.quantity }
        details.after = { quantity: product.quantity + 5 }
    }

    if(action === 'removeProduct'){
        details.deleted = true;
    }

    const log = {
        userId: userInsertResult.insertedIds[userIndex],
        userName: `${user.firstName} ${user.lastName}`,
        action,
        details,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1e9))
    };

    sampleLogs.push(log)
}

//20 buyProduct logs
for(let i = 0; i < 20; i++){
    const userIndex = Math.floor(Math.random() * userDocs.length)
    const user = userDocs[userIndex]
    const productIndex = Math.floor(Math.random() * items.length)
    const product = items[productIndex]

    const qtyBought = Math.floor(Math.random() * 5) + 1
    const quantityBefore = product.quantity
    const quantityAfter = Math.max(0, quantityBefore - qtyBought)

    items[productIndex].quantity = quantityAfter

    const log = {
        userId: userInsertResult.insertedIds[userIndex],
        userName: `${user.firstName} ${user.lastName}`,
        action: 'buyProduct',
        details: {
            productName: product.productName,
            quantityBefore,
            quantityAfter
        },
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1e9))
    }

    sampleLogs.push(log)
}


await auditLogs.insertMany(sampleLogs)


process.exit(0)