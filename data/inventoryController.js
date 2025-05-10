import { inventory } from '../config/mongoCollections.js';
import * as helpers from "../utils/validations.js";

export {addProduct, updateProduct, removeProduct, getProductByName, getAllProducts};

async function addProduct(productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion) {

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

    return true;
}

async function updateProduct(productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion) {

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

    return true;
}

async function removeProduct(productName) {
    if (!productName) throw { status: 400, message: "You must give Product Name!" };
    productName = helpers.validProductName(productName);

    const inventoryCollection = await inventory();

    // check if product exists
    const existingProduct = await inventoryCollection.findOne({ productName });
    if (!existingProduct) throw new Error("Product not found");

    const deleteInfo = await inventoryCollection.deleteOne({ productName });
    if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) throw new Error("Could not remove product");

    return true;
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

    if (!allProducts) throw new Error("No products found");

    return allProducts;
}