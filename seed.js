// seed.js
import { ObjectId } from 'mongodb'
import { dbConnection } from './config/mongoConnection.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

const db = await dbConnection()
const inventory = db.collection('inventory')
const users = db.collection('users')
const transactions = db.collection('transactions')
await inventory.deleteMany({})
await users.deleteMany({})
await transactions.deleteMany({})
const hashedPassword = await bcrypt.hash('Password@1', SALT_ROUNDS)

const testUser = {
  firstName: 'Bat',
  lastName: 'Man',
  email: 'batman@gmail.com',
  username: 'lego',
  password: hashedPassword,
  profilePicture: '/static/profile.png',
  phone: '+15555550123',
  address: {
    street: '456 Main St',
    city: 'Seattle',
    state: 'WA',
    zip: '98101'
  },
  roleid: new ObjectId(),
  roleName: 'supplier',
  isActive: true,
  createdAt: new Date()
}

const { insertedId: userId } = await users.insertOne(testUser)

const id1 = new ObjectId();
const id2 = new ObjectId();
const id3 = new ObjectId();

const items = [
  {
    _id: id1,
    productName: 'Bluetooth Scanner',
    categoryName: 'electronics',
    quantity: 5,
    minThreshold: 10,
    unitPrice: 59.99,
    restockSuggestion: {
      recommendedQty: 20,
      nextRestockDate: '2025-06-15'
    },
    lastUpdated: new Date()
  },
  {
    _id: id2,
    productName: 'Thermal Printer',
    categoryName: 'electronics',
    quantity: 15,
    minThreshold: 10,
    unitPrice: 120.00,
    restockSuggestion: {
      recommendedQty: 30,
      nextRestockDate: '2025-06-10'
    },
    lastUpdated: new Date()
  },
  {
    _id: id3,
    productName: 'Barcode Labels',
    categoryName: 'supplies',
    quantity: 3,
    minThreshold: 8,
    unitPrice: 12.99,
    restockSuggestion: {
      recommendedQty: 50,
      nextRestockDate: '2025-06-12'
    },
    lastUpdated: new Date()
  }
]

const insertItems = await inventory.insertMany(items)

const transactionDocs = [
  {
    productId: id1,
    userId,
    actionId: new ObjectId(),
    actionName: 'purchase',
    quantityChanged: 12,
    logTimestamp: new Date()
  },
  {
    productId: id2,
    userId,
    actionId: new ObjectId(),
    actionName: 'purchase',
    quantityChanged: 9,
    logTimestamp: new Date()
  },
  {
    productId: id1,
    userId,
    actionId: new ObjectId(),
    actionName: 'purchase',
    quantityChanged: 4,
    logTimestamp: new Date()
  }
]

await transactions.insertMany(transactionDocs)

process.exit(0)