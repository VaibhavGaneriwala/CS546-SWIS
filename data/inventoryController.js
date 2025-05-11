import { inventory } from '../config/mongoCollections.js';
import * as helpers from "../utils/validations.js";
import { addAuditLog } from './auditController.js';
import { ObjectId } from 'mongodb';

export {addProduct, updateProduct, removeProduct, getProductByName, getAllProducts};

async function addProduct(productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion, userId, name) {

    if (!productName || !categoryName || !quantity || !minThreshold || !unitPrice || !restockSuggestion) throw { status: 400, message: "You must supply all fields!" };

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

    return true;
}

//probably needs to be changed to find using id
async function updateProduct(productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion, userId, name) {

    if (!productName || !categoryName || !quantity || !minThreshold || !unitPrice || !restockSuggestion) throw { status: 400, message: "You must supply all fields!" };

    productName = helpers.validProductName(productName);
    categoryName = helpers.validCategoryName(categoryName);
    quantity = helpers.validQuantity(quantity);
    minThreshold = helpers.validMinThreshold(minThreshold);
    unitPrice = helpers.validUnitPrice(unitPrice);
    restockSuggestion = helpers.validRestockSuggestion(restockSuggestion);

    const inventoryCollection = await inventory();

    const existingProduct = await inventoryCollection.findOne({ productName });
    if (!existingProduct) throw new Error("Product not found");

    // create update object with only the fields that are provided
    const updateData = {productName: productName, categoryName: categoryName, quantity: quantity, minThreshold: minThreshold, unitPrice: unitPrice, restockSuggestion: restockSuggestion, lastUpdated: helpers.createCurrentDateandTime()};

    const updateInfo = await inventoryCollection.updateOne({ productName: existingProduct.productName },{ $set: updateData});

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw new Error("Could not update product");

    // Log the update action
    await addAuditLog(userId, name, 'updateProduct', {
        before: existingProduct,
        after: updateData
    })

    return true;
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