import { ObjectId } from 'mongodb'
import helper from '../helpers.js'
import { users, inventory, categories, transactionLogs, notifications } from '../config/mongoConnection.js'
import bcrypt from 'bcrypt'

const createUser = async ({firstName, lastName, email, username, password, profilePicture, phone, address, roleid, roleName}) => {
    firstName = helper.checkName(firstName, 'firstName')
    lastName = helper.checkName(lastName, 'lastName')
    roleid = helper.checkId(roleid, 'roleid')
    roleName = helper.checkString(roleName, 'roleName') 
    email = helper.checkString(email, 'email')
    email = email.toLowerCase()

    if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
        throw('Invalid email format')
    }   

    phone = helper.checkString(phone, 'phone')
    if(!(/^\+?[0-9]{10,15}$/.test(phone))){
        throw('Invalid phone number format')
    }   

    profilePicture = helper.checkString(profilePicture, 'profilePicture')
    if(!profilePicture.toLowerCase().endsWith('.png')){
        throw('Profile picture must be a .png file')
    }   

    username = helper.checkName(username.toLowerCase(), 'username') 
    const usersCollection = await users()
    const existingUser = await usersCollection.findOne({ username: username })
    if(existingUser){
        throw('Username already exists')
    }   

    password = helper.checkString(password, 'password')
    const saltRounds = 16
    const hashedPassword = await bcrypt.hash(password, saltRounds)  
    if(!address || typeof address !== 'object'){
        throw('Address must be a valid object')
    }   

    //check address better
    const { street, city, state, zip } = address
    address = {
        street: helper.checkString(street, 'street'),
        city: helper.checkString(city, 'city'),
        state: helper.checkString(state, 'state'),
        zip: helper.checkString(zip.toString(), 'zip')
    }   
    const newUser = {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        profilePicture,
        phone,
        address,
        roleid: new ObjectId(roleid),
        roleName,
        isActive: true,
        createdAt: new Date()
    }   
    const insertInfo = await usersCollection.insertOne(newUser)
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw('Could not add user')
    }   
    return newUser
}

const createItem = async ({productName, categoryId, categoryName, quantity, minThreshold, unitPrice, restockSuggestion}) => {
    productName = helper.checkString(productName, 'productName')
    categoryName = helper.checkString(categoryName, 'categoryName').toLowerCase()
  
    categoryId = helper.checkId(categoryId, 'categoryId')
  
    if(typeof quantity !== 'number' || quantity < 0){
        throw('Quantity must be a non-negative number')
    }
    if(typeof minThreshold !== 'number' || minThreshold < 0){
        throw('Minimum threshold must be a non-negative number')
    } 
    if(typeof unitPrice !== 'number' || unitPrice < 0){
        throw('Unit price must be a non-negative number')
    }
  
    if(!restockSuggestion || typeof restockSuggestion !== 'object'){
        throw('Invalid restockSuggestion format')
    }
    const { recommendedQty, nextRestockDate } = restockSuggestion
  
    if(typeof recommendedQty !== 'number' || recommendedQty < 0){
        throw('Recommended quantity must be a non-negative number')
    }
      
    if(!nextRestockDate || isNaN(Date.parse(nextRestockDate))){
        throw('nextRestockDate must be a valid date string')
    }
      
    const newItem = {
        productName,
        categoryId: new ObjectId(categoryId),
        categoryName,
        quantity,
        minThreshold,
        unitPrice,
        restockSuggestion: {
          recommendedQty,
          nextRestockDate: new Date(nextRestockDate)
        },
        lastUpdated: new Date()
    }
  
    const inventoryCollection = await inventory()
  
    const insertInfo = await inventoryCollection.insertOne(newItem)
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw('Could not add item')
    }
      
    return newItem
  }

const createCategory = async ({ categoryName, description }) => {
    categoryName = helper.checkString(categoryName, 'categoryName').toLowerCase()
    description = helper.checkString(description, 'description')    

    const db = await dbConnection()
    const categoryCollection = await db.collection('categories')    
    const existing = await categoryCollection.findOne({ categoryName: categoryName })

    if(existing){
        throw('Category with this name already exists')
    }   

    const newCategory = {
        categoryName,
        description
    }   

    const insertInfo = await categoryCollection.insertOne(newCategory)
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw('Could not create category')
    }   

    return newCategory
}

const logTransaction = async ({productId, userId, actionId, actionName, quantityChanged}) => {
    productId = helper.checkId(productId, 'productId')
    userId = helper.checkId(userId, 'userId')
    actionId = helper.checkId(actionId, 'actionId')
    actionName = helper.checkString(actionName, 'actionName')   

    if(typeof quantityChanged !== 'number'){
        throw('quantityChanged must be a number')
    }   

    const newLog = {
        productId: new ObjectId(productId),
        userId: new ObjectId(userId),
        actionId: new ObjectId(actionId),
        actionName: actionName.toLowerCase(),
        quantityChanged,
        logTimestamp: new Date()
    }   

    const logsCollection = await transactionLogs()

    const insertInfo = await logsCollection.insertOne(newLog)
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw('Could not log transaction')
    }   
    
    return newLog
}

const createNotification = async ({productId, type, message}) => {
    productId = helper.checkId(productId, 'productId')
    type = helper.checkString(type, 'type').toLowerCase()
    message = helper.checkString(message, 'message')

    const validTypes = ['low-stock', 'audit-warning']
    if(!validTypes.includes(type)){
        throw(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`)
    }

    const newNotification = {
        productId: new ObjectId(productId),
        type,
        message,
        timestamp: new Date()
    }

    const notificationsCollection = await notifications()

    const insertInfo = await notificationsCollection.insertOne(newNotification)
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw('Could not create notification')
    }

    return newNotification
}

export { createUser, createItem, createCategory, logTransaction, createNotification }
