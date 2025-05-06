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
    // productName and categoryName: not empty or whitespace
    if (typeof productName !== "string" || !productName.trim()) {
        throw new Error("Product Name must be a non-empty string");
    }
    productName = productName.trim().toLowerCase();

    // category: non-empty string
    if (typeof categoryName !== "string" || !categoryName.trim()) {
        throw new Error("Category Name must be a non-empty string");
    }
    categoryName = categoryName.trim().toLowerCase();

    // quantity: integer >= 1
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be an integer greater than or equal to 1");
    }

    // minThreshold: integer >= 0
    if (typeof minThreshold !== "number" || minThreshold < 0) {
        throw new Error("Minimum Threshold must be a number greater than or equal to zero");
    }

    // unitPrice: non-negative number, always 2 decimal places
    if (typeof unitPrice !== "number" || unitPrice < 0) {
        throw new Error('Invalid unitPrice');
    }
    unitPrice = Number(unitPrice.toFixed(2));

    // restockSuggestion: must be object (non-array)
    if (typeof restockSuggestion !== 'object' || Array.isArray(restockSuggestion) || restockSuggestion === null)
        throw new Error('Restock Suggestion must be of type object, and not an array');

    // restockSuggestion.recommendedQty: integer >= 0
    if (!typeof restockSuggestion.recommendedQty === "number" || restockSuggestion.recommendedQty < 0) {
        throw new Error("Recommended Quantity must be a number greater than or equal to 0");
    }

    // restockSuggestion.nextRestockDate: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(restockSuggestion.nextRestockDate))
        throw new Error("Invalid restockSuggestion.nextRestockDate");

    const lastUpdated = helpers.createCurrentDateandTime();

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
        lastUpdated
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

    // productName: not empty or whitespace
    if (productName !== undefined) {
        if (typeof productName !== "string" || !productName.trim()) {
            throw new Error("Product Name must be a non-empty string");
        }
        updateData.productName = productName.trim.toLowerCase();
    }

    // categoryName: not empty or whitespace
    if (categoryName !== undefined) {
        if (typeof categoryName !== "string" || !categoryName.trim()) {
            throw new Error("Category Name must be a non-empty string");
        }
        updateData.categoryName = categoryName.trim().toLowerCase();
    }

    // quantity: integer >= 1
    if (quantity !== undefined) {
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
            throw new Error("Quantity must be an integer greater than or equal to 1");
        }
        updateData.quantity = quantity;
    }

    // minThreshold: integer >= 0
    if (minThreshold !== undefined) {
        if (typeof minThreshold !== "number" || minThreshold < 0) {
            throw new Error("Minimum Threshold must be a number greater than or equal to zero");
        }
        updateData.minThreshold = minThreshold;
    }

    // unitPrice: non-negative number, always 2 decimal places
    if (unitPrice !== undefined) {
        if (typeof unitPrice !== "number" || unitPrice < 0) {
            throw new Error('Invalid unitPrice');
        }
        updateData.unitPrice = Number(unitPrice.toFixed(2));
    }

    // restockSuggestion: must be object (non-array)
    if (restockSuggestion !== undefined) {
        if (typeof restockSuggestion !== 'object' || Array.isArray(restockSuggestion) || restockSuggestion === null) {
            throw new Error('Restock Suggestion must be of type object, and not an array');
        }

        // restockSuggestion.recommendedQty: integer >= 0
        if (!typeof restockSuggestion.recommendedQty === "number" || restockSuggestion.recommendedQty < 0) {
            throw new Error("Recommended Quantity must be a number greater than or equal to 0");
        }

        // restockSuggestion.nextRestockDate: YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(restockSuggestion.nextRestockDate)) {
            throw new Error("Invalid restockSuggestion.nextRestockDate");
        }

        updateData.restockSuggestion = restockSuggestion;
    }

    // need at least one field to update
    if (Object.keys(updateData).length === 0) {
        throw new Error("No fields to update");
    }

    // update lastUpdated timestamp
    updateData.lastUpdated = helpers.createCurrentDateandTime();

    const updateInfo = await inventoryCollection.updateOne(
        { _id: productId },
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