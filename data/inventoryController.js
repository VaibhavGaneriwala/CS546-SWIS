import { inventory } from '../config/mongoCollections.js';
import * as helpers from "../utils/validations.js";
import { addAuditLog } from './auditController.js';
import { ObjectId } from 'mongodb';

export {addProduct, updateProduct, removeProduct, getProductByName, getAllProducts, getProductById, updateProductQuantity};

async function addProduct(productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion, userId, name) {

    if (!productName || !categoryName || quantity == null || !minThreshold || !unitPrice || !restockSuggestion) throw { status: 400, message: "You must supply all fields!" };

    productName = helpers.validProductName(productName);
    categoryName = helpers.validCategoryName(categoryName);
    quantity = helpers.validQuantity(quantity);
    minThreshold = helpers.validMinThreshold(minThreshold);
    unitPrice = helpers.validUnitPrice(unitPrice);
    restockSuggestion = helpers.validRestockSuggestion(restockSuggestion);

    const inventoryCollection = await inventory();

    const existingProduct = await inventoryCollection.findOne({ productName: productName });
    if (existingProduct) throw new Error("A product with this name already exists");

    const newProduct = {productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion, lastUpdated: helpers.createCurrentDateandTime()};

    const insertInfo = await inventoryCollection.insertOne(newProduct);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw new Error("Could not add product");

    await addAuditLog(userId, name, 'addProduct', {
        productName,
        categoryName,
        quantity,
        minThreshold,
        unitPrice,
        restockSuggestion
    })

    return { insertedId: insertInfo.insertedId }
}

async function updateProduct(productId, productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion, userId, name) {
    if(!productId || !ObjectId.isValid(productId)){
        throw { status: 400, message: "Invalid product ID" }
    }

    if(!productName || !categoryName || quantity == null || !minThreshold || !unitPrice || !restockSuggestion){
        throw { status: 400, message: "You must supply all fields!" }
    }

    productName = helpers.validProductName(productName)
    categoryName = helpers.validCategoryName(categoryName)
    quantity = helpers.validQuantity(quantity)
    minThreshold = helpers.validMinThreshold(minThreshold)
    unitPrice = helpers.validUnitPrice(unitPrice)
    restockSuggestion = helpers.validRestockSuggestion(restockSuggestion)

    const inventoryCollection = await inventory()
    const id = new ObjectId(productId)

    const existingProduct = await inventoryCollection.findOne({ _id: id })
    if(!existingProduct){
        throw new Error("Product not found")
    }

    const updateData = {
        productName: productName,
        categoryName: categoryName, 
        quantity: quantity, 
        minThreshold: minThreshold, 
        unitPrice: unitPrice, 
        restockSuggestion: restockSuggestion, 
        lastUpdated: helpers.createCurrentDateandTime()
    }

    const updateInfo = await inventoryCollection.updateOne(
        { _id: id },
        { $set: updateData }
    )

    if(!updateInfo.acknowledged || updateInfo.modifiedCount === 0){
        throw new Error("Could not update product")
    }

    // Log the update action
    await addAuditLog(userId, name, 'updateProduct', {
        before: existingProduct,
        after: updateData
    })

    return true
}

async function removeProduct(productId, userId, name) {
    const inventoryCollection = await inventory()

    const id = new ObjectId(productId)
    const existingProduct = await inventoryCollection.findOne({ _id: id })

    if(!existingProduct){
        throw("Product not found")
    } 

    const deleteInfo = await inventoryCollection.deleteOne({ _id: id })
    if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) {
        throw("Could not remove product")
    }

    await addAuditLog(userId, name, 'deleteProduct', {
        productName: existingProduct.productName,
        categoryName: existingProduct.categoryName,
        quantity: existingProduct.quantity
    })

    return true
}

async function getProductByName(productName) {
    if (!productName) throw { status: 400, message: "You must give Product Name!" };
    productName = helpers.validProductName(productName);

    const inventoryCollection = await inventory();
    const product = await inventoryCollection.findOne({ productName });

    if (!product) throw new Error("Product not found");

    return product;
}

async function getAllProducts() {
    const inventoryCollection = await inventory();
    const allProducts = await inventoryCollection.find({}).toArray();
    return allProducts || [];
}

async function getProductById(productId) {
    if (!productId || !ObjectId.isValid(productId)) {
        throw { status: 400, message: "Invalid product ID" };
    }

    const inventoryCollection = await inventory();
    const product = await inventoryCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
        throw { status: 404, message: "Product not found" };
    }

    return product;
}

async function updateProductQuantity(productId, newQuantity, userId, name) {
    if(!productId || !ObjectId.isValid(productId)){
        throw { status: 400, message: "Invalid product ID" }
    }

    newQuantity = helpers.validQuantity(newQuantity)
    const inventoryCollection = await inventory()
    const id = new ObjectId(productId)

    const existingProduct = await inventoryCollection.findOne({ _id: id })
    if(!existingProduct){
        throw { status: 404, message: "Product not found" }
    }

    const updateInfo = await inventoryCollection.updateOne(
        { _id: id },
        {
            $set: {
                quantity: newQuantity,
                lastUpdated: helpers.createCurrentDateandTime()
            }
        }
    );

    if(!updateInfo.acknowledged || updateInfo.modifiedCount === 0){
        throw("Failed to update quantity")
    }

    await addAuditLog(userId, name, 'buyProduct', {
        productName: existingProduct.productName,
        quantityBefore: existingProduct.quantity,
        quantityAfter: newQuantity
    })

    return true
}