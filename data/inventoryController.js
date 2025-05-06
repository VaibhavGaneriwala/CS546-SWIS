import { inventory } from '../config/mongoCollections.js';

//TODO: add args to db w/ mongo API
export async function addProduct(
    productName,
    categoryName,
    quantity,
    minThreshold,
    unitPrice,
    restockSuggestion,
    lastUpdated
) {
    // productName and categoryName: not empty or whitespace
    const nameRegex = /^(?!\s*$).+/;
    if (!nameRegex.test(productName)) return 'Invalid productName';
    if (!nameRegex.test(categoryName)) return 'Invalid categoryName';

    // quantity: integer >= 1
    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
        throw new Error("Quantity must be an integer");
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

    // lastUpdated: ISO datetime string
    const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (!isoDateTimeRegex.test(lastUpdated)) {
        throw new Error("Last Updated time is not in proper format");
    }


}