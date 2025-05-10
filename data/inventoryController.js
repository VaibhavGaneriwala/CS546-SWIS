import { inventory } from '../config/mongoCollections.js';
import * as helpers from "../utils/validations.js";

export async function addProduct(
    productName,
    categoryName,
    quantity,
    minThreshold,
    unitPrice,
    restockSuggestion
) {
    productName = helpers.validProductName(productName);
    categoryName = helpers.validCategoryName(categoryName);
    quantity = helpers.validQuantity(quantity);
    minThreshold = helpers.validMinThreshold(minThreshold);
    unitPrice = helpers.validUnitPrice(unitPrice);
    restockSuggestion = helpers.validRestockSuggestion(restockSuggestion);

    const inventoryCollection = await inventory();

    // check for duplicate product name
    const existingProduct = await inventoryCollection.findOne({ productName: productName });
    if (existingProduct) {
        throw new Error("A product with this name already exists");
    }

    const newProduct = {
        productName,
        categoryName,
        quantity,
        minThreshold,
        unitPrice,
        restockSuggestion,
        lastUpdated: helpers.createCurrentDateandTime()
    };

    const insertInfo = await inventoryCollection.insertOne(newProduct);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw new Error("Could not add product");
    }

    return true;
}

export async function updateProduct(
    productName,
    categoryName,
    quantity,
    minThreshold,
    unitPrice,
    restockSuggestion
) {
    const inventoryCollection = await inventory();

    // check if product exists
    const existingProduct = await inventoryCollection.findOne({ productName });
    if (!existingProduct) {
        throw new Error("Product not found");
    }

    // create update object with only the fields that are provided
    const updateData = {};

    if (productName !== undefined) {
        updateData.productName = helpers.validProductName(productName);
    }

    if (categoryName !== undefined) {
        updateData.categoryName = helpers.validCategoryName(categoryName);
    }

    if (quantity !== undefined) {
        updateData.quantity = helpers.validQuantity(quantity);
    }

    if (minThreshold !== undefined) {
        updateData.minThreshold = helpers.validMinThreshold(minThreshold);
    }

    if (unitPrice !== undefined) {
        updateData.unitPrice = helpers.validUnitPrice(unitPrice);
    }

    if (restockSuggestion !== undefined) {
        updateData.restockSuggestion = helpers.validRestockSuggestion(restockSuggestion);
    }

    // need at least one field to update
    if (Object.keys(updateData).length === 0) {
        throw new Error("No fields to update");
    }

    // update lastUpdated timestamp
    updateData.lastUpdated = helpers.createCurrentDateandTime();

    const updateInfo = await inventoryCollection.updateOne(
        { productName: existingProduct.productName },
        { $set: updateData }
    );

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
        throw new Error("Could not update product");
    }

    return true;
}

export async function removeProduct(productName) {
    if (typeof productName !== "string" || !productName.trim()) {
        throw new Error("Product Name must be a non-empty string");
    }
    productName = productName.trim().toLowerCase();

    const inventoryCollection = await inventory();

    // check if product exists
    const existingProduct = await inventoryCollection.findOne({ productName });
    if (!existingProduct) {
        throw new Error("Product not found");
    }

    const deleteInfo = await inventoryCollection.deleteOne({ productName });
    if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) {
        throw new Error("Could not remove product");
    }

    return true;
}

export async function getProductByName(productName) {
    productName = helpers.validProductName(productName);

    const inventoryCollection = await inventory();
    const product = await inventoryCollection.findOne({ productName });

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
}

export async function getAllProducts() {
    const inventoryCollection = await inventory()
    const rawProducts = await inventoryCollection.find({}).toArray()

    const categoryCount = new Set(rawProducts.map(p => p.categoryName?.toLowerCase())).size

    if(!rawProducts || rawProducts.length === 0){
        throw("No products found")
    }

    const products = rawProducts.map((item) => {
        let stockStatus

        if(item.quantity === 0){
            stockStatus = 'out-stock'
        }else if(item.quantity <= item.minThreshold){
            stockStatus = 'low-stock'
        }else{
            stockStatus = 'in-stock'
        }

        

        return {
            ...item,
            stockStatus,
        }
    })

    const lowStockCount = products.filter((p) => p.quantity <= p.minThreshold && p.quantity > 0).length

    const noStockCount = products.filter((p) => p.quantity === 0).length

    return {
        products,
        categoryCount,
        lowStockCount,
        noStockCount,
        dummyRevenue: 25000,
        dummyCost: 2500,
    }
}