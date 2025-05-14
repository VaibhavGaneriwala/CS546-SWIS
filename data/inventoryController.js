import { inventory } from '../config/mongoCollections.js';
import * as helpers from "../utils/validations.js";
import { addAuditLog } from './auditController.js';
import { ObjectId } from 'mongodb';
import { auditLogs } from '../config/mongoCollections.js';

export { addProduct, updateProduct, removeProduct, getProductByName, getAllProducts, getProductById, updateProductQuantity, calculateExpectedQuantity, checkInventoryDiscrepancies };

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

    const newProduct = {
        productName,
        categoryName,
        quantity,
        expectedQuantity: quantity,
        minThreshold,
        unitPrice,
        restockSuggestion,
        lastUpdated: helpers.createCurrentDateandTime()
    };

    const insertInfo = await inventoryCollection.insertOne(newProduct);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw new Error("Could not add product");

    await addAuditLog(insertInfo.insertedId, userId, name, 'addProduct', {
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
    if (!productId || !ObjectId.isValid(productId)) {
        throw { status: 400, message: "Invalid product ID" }
    }

    if (!productName || !categoryName || quantity == null || !minThreshold || !unitPrice || !restockSuggestion) {
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
    if (!existingProduct) {
        throw new Error("A product with this id already exists")
    }

    productId = new ObjectId(productId)

    const sameNameProduct = await inventoryCollection.findOne({ 
        _id: { $ne: productId },
        productName: productName, 
    })

    if(sameNameProduct){
        throw new Error("A product with this name already exists")
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

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
        throw new Error("Could not update product")
    }

    await addAuditLog(productId, userId, name, 'updateProduct', {
        before: existingProduct,
        after: updateData
    })

    // recalculate expected quantity and discrepancy
    await calculateExpectedQuantity(productId);

    return true
}

async function removeProduct(productId, userId, name) {
    const inventoryCollection = await inventory()

    const id = new ObjectId(productId)
    const existingProduct = await inventoryCollection.findOne({ _id: id })

    if (!existingProduct) {
        throw ("Product not found")
    }

    const deleteInfo = await inventoryCollection.deleteOne({ _id: id })
    if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) {
        throw ("Could not remove product")
    }

    productId = new ObjectId(productId)

    await addAuditLog(productId, userId, name, 'deleteProduct', {
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
    if (!productId || !ObjectId.isValid(productId)) {
        throw { status: 400, message: "Invalid product ID" }
    }

    newQuantity = helpers.validQuantity(newQuantity)
    const inventoryCollection = await inventory()
    const id = new ObjectId(productId)

    const existingProduct = await inventoryCollection.findOne({ _id: id })
    if (!existingProduct) {
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

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
        throw ("Failed to update quantity")
    }

    productId = new ObjectId(productId)

    await addAuditLog(productId, userId, name, 'buyProduct', {
        productName: existingProduct.productName,
        quantityBefore: existingProduct.quantity,
        quantityAfter: newQuantity
    });

    // recalculate expected quantity and discrepancy
    await calculateExpectedQuantity(productId);

    return true
}

async function calculateExpectedQuantity(productId) {
    if (!productId || !ObjectId.isValid(productId)) {
        throw { status: 400, message: "Invalid product ID" }
    }

    const inventoryCollection = await inventory();
    const auditLogsCollection = await auditLogs();
    const id = new ObjectId(productId);

    const product = await inventoryCollection.findOne({ _id: id });
    if (!product) {
        throw { status: 404, message: "Product not found" }
    }

    // get all logs for this product
    const logs = await auditLogsCollection.find({
        $or: [
            { 'details.productName': product.productName },
            { 'details.before.productName': product.productName },
            { 'details.after.productName': product.productName }
        ]
    }).sort({ timestamp: 1 }).toArray();

    let expectedQty = typeof product.expectedQuantity === 'number' ? product.expectedQuantity : product.quantity;

    // process each log to calculate expected quantity
    for (const log of logs) {
        switch (log.action) {
            case 'addProduct':
                if (log.details.productName === product.productName) {
                    expectedQty = log.details.quantity;
                }
                break;
            case 'updateProduct':
                if (log.details.before?.productName === product.productName) {
                    expectedQty = log.details.after.quantity;
                }
                break;
            case 'buyProduct':
                if (log.details.productName === product.productName) {
                    expectedQty = log.details.quantityAfter;
                }
                break;
            case 'deleteProduct':
                if (log.details.productName === product.productName) {
                    expectedQty = 0;
                }
                break;
        }
    }

    // ensure expectedQty is a number
    if (typeof expectedQty !== 'number' || isNaN(expectedQty)) {
        expectedQty = product.quantity;
    }
    const discrepancy = expectedQty - product.quantity;

    // update expected quantity and discrepancy in DB
    const updateInfo = await inventoryCollection.updateOne(
        { _id: id },
        { $set: { expectedQuantity: expectedQty, discrepancy: discrepancy } }
    );

    if (!updateInfo.acknowledged) {
        throw new Error("Failed to update expected quantity/discrepancy");
    }

    return expectedQty;
}

async function checkInventoryDiscrepancies() {
    const inventoryCollection = await inventory();
    // return products with a discrepancy
    const products = await inventoryCollection.find({ $expr: { $ne: ["$quantity", "$expectedQuantity"] } }).toArray();
    return products;
}