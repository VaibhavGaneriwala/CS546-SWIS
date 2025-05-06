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
    productName = productName.trim();

    // category: non-empty string
    if (typeof categoryName !== "string" || !categoryName.trim()) {
        throw new Error("Category Name must be a non-empty string");
    }
    categoryName = categoryName.trim();

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

    return { insertedProduct: true, productId: insertInfo.insertedId };
}