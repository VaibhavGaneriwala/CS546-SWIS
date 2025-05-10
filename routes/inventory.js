import { Router } from 'express';
import { addProduct, updateProduct, removeProduct, getProductByName, getAllProducts } from "../data/inventoryController.js";
import { authMiddleware } from '../middlewares/auth.js';
import * as helpers from "../utils/validations.js";

const router = Router();

// Render inventory page
router.get("/inventory", authMiddleware, async (req, res) => {
    try {
        const products = await getAllProducts();
        const categoryCount = new Set(products.map(p => p.categoryName?.toLowerCase())).size;
        const lowStockCount = products.filter(p => p.quantity <= p.minThreshold).length;
        const noStockCount = products.filter(p => p.quantity === 0).length;
        
        // Add stock status to each product
        const productsWithStatus = products.map(product => ({
            ...product,
            stockStatus: product.quantity === 0 ? 'out-stock' : 
                        product.quantity <= product.minThreshold ? 'low-stock' : 'in-stock'
        }));
        
        res.render('inventory', {
            title: 'Inventory | SWIS',
            products: productsWithStatus,
            categoryCount,
            lowStockCount,
            noStockCount,
            dummyRevenue: 18300,
            dummyCost: 17432
        });
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

// Export inventory to CSV
router.get("/inventory/export", authMiddleware, async (req, res) => {
    try {
        const data = await getAllProducts();
        
        // Create CSV content
        const headers = ['Product Name', 'Category', 'Quantity', 'Min Threshold', 'Unit Price', 'Stock Status', 'Next Restock Date'];
        const rows = data.products.map(product => [
            product.productName,
            product.categoryName,
            product.quantity,
            product.minThreshold,
            product.unitPrice,
            product.stockStatus,
            product.restockSuggestion.nextRestockDate
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
        
        res.send(csvContent);
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

// search for product by name
router.get("/inventory/:productName", authMiddleware, async (req, res) => {
    try {
        req.params.productName = req.params.productName.trim();
        helpers.validProductName(req.params.productName);

        const product = await getProductByName(req.params.productName);
        return res.json(product);
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

// insert new product into DB
router.post("/inventory", authMiddleware, async (req, res) => {
    try {
        const { productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion } = req.body;

        // Validate input
        helpers.validProductName(productName);
        helpers.validCategoryName(categoryName);
        helpers.validQuantity(quantity);
        helpers.validMinThreshold(minThreshold);
        helpers.validUnitPrice(unitPrice);
        helpers.validRestockSuggestion(restockSuggestion);

        // Trim string inputs
        const trimmedProductName = productName.trim();
        const trimmedCategoryName = categoryName.trim();
        const trimmedNextRestockDate = restockSuggestion.nextRestockDate.trim();

        // Prepare arguments for addProduct
        const args = [
            trimmedProductName,
            trimmedCategoryName,
            quantity,
            minThreshold,
            unitPrice,
            {
                nextRestockDate: trimmedNextRestockDate,
                recommendedQty: restockSuggestion.recommendedQty
            }
        ];

        const result = await addProduct(...args);
        if (!result) throw new Error("Failed to add product");

        res.status(200).json({ message: "Product added successfully" });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

export default router;