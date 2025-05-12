import { Router } from 'express';
import { addProduct, updateProduct, removeProduct, getProductByName, getAllProducts, getProductById, updateProductQuantity } from "../data/inventoryController.js";
import { adminOnly, authMiddleware, inventoryRedirectMiddleware } from '../middlewares/auth.js';
import * as helpers from "../utils/validations.js";

const router = Router();

router.get("/inventory", authMiddleware, inventoryRedirectMiddleware)

function computeStockStatus(quantity, minThreshold) {
    if(quantity === 0){
        return 'out-stock'
    }else if(quantity <= minThreshold){
        return 'low-stock'
    }else{
        return 'in-stock'
    }
}

router.get("/inventory/admin", authMiddleware, adminOnly, async (req, res) => {
    try {
        // Pagination params

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search ? req.query.search.trim() : '';
        const allProducts = await getAllProducts();

        // Filter by search term (case-insensitive, partial match)
        let filteredProducts = allProducts;
        if (search) {
            const regex = new RegExp(search, 'i');
            filteredProducts = allProducts.filter(p => regex.test(p.productName));
        } 
        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        const categoryCount = new Set(filteredProducts.map(p => p.categoryName?.toLowerCase())).size;
        const lowStockCount = filteredProducts.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length;
        const noStockCount = filteredProducts.filter(p => p.quantity === 0).length;

        // Calculate total inventory value
        const totalInventoryValue = filteredProducts.reduce((total, product) => {
            const productValue = product.quantity * product.unitPrice;
            return total + productValue;
        }, 0);

        // Add stock status and formatted price to each product
        const productsWithStatus = paginatedProducts.map(product => ({
            ...product,
            stockStatus: product.quantity === 0 ? 'out-stock' :
                product.quantity <= product.minThreshold ? 'low-stock' : 'in-stock',
            formattedPrice: (product.quantity * product.unitPrice).toFixed(2)
        }));

        const today = new Date().toISOString().split("T")[0]

        res.render('inventory-admin', {
            cssFile: 'inventory.css',
            title: 'Inventory | SWIS',
            todayDate: today,
            totalProducts: filteredProducts.length,
            products: productsWithStatus,
            categoryCount,
            lowStockCount,
            noStockCount,
            totalInventoryValue: totalInventoryValue.toFixed(2),
            currentPage: page,
            totalPages,
            search,
        });
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

// Render inventory page
router.get("/inventory/user", authMiddleware, async (req, res) => {
    try {
        // Pagination params

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search ? req.query.search.trim() : '';
        const allProducts = await getAllProducts();

        // Filter by search term (case-insensitive, partial match)
        let filteredProducts = allProducts;
        if (search) {
            const regex = new RegExp(search, 'i');
            filteredProducts = allProducts.filter(p => regex.test(p.productName));
        } 
        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        const categoryCount = new Set(filteredProducts.map(p => p.categoryName?.toLowerCase())).size;
        const lowStockCount = filteredProducts.filter(p => p.quantity <= p.minThreshold).length;
        const noStockCount = filteredProducts.filter(p => p.quantity === 0).length;

        // Calculate total inventory value
        const totalInventoryValue = filteredProducts.reduce((total, product) => {
            const productValue = product.quantity * product.unitPrice;
            return total + productValue;
        }, 0);

        // Add stock status and formatted price to each product
        const productsWithStatus = paginatedProducts.map(product => ({
            ...product,
            stockStatus: product.quantity === 0 ? 'out-stock' :
                product.quantity <= product.minThreshold ? 'low-stock' : 'in-stock',
            formattedPrice: (product.quantity * product.unitPrice).toFixed(2)
        }));

        res.render('inventory-user', {
            cssFile: 'inventory.css',
            title: 'Inventory | SWIS',
            totalProducts: filteredProducts.length,
            products: productsWithStatus,
            categoryCount,
            lowStockCount,
            noStockCount,
            totalInventoryValue: totalInventoryValue.toFixed(2),
            currentPage: page,
            totalPages,
            search,
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
        const rows = data.map(product => [
            product.productName,
            product.categoryName,
            product.quantity,
            product.minThreshold,
            product.unitPrice,
            product.stockStatus || '',
            product.restockSuggestion?.nextRestockDate || ''
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
router.post("/inventory", authMiddleware, adminOnly, async (req, res) => {
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

        const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`

        const result = await addProduct(...args, req.session.user._id, fullName);

        
        if (!result) throw new Error("Failed to add product");

        res.status(200).json({ 
            message: "Product added successfully",
            _id: result.insertedId,
            productName: trimmedProductName,
            categoryName: trimmedCategoryName,
            quantity,
            minThreshold,
            unitPrice,
            restockSuggestion: {
                nextRestockDate: trimmedNextRestockDate,
                recommendedQty: restockSuggestion.recommendedQty
            },
            _id: result.insertedId || "temp-id",
            stockStatus: computeStockStatus(quantity, minThreshold),
            formattedPrice: (unitPrice * quantity).toFixed(2) 
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

router.delete("/inventory/:id", authMiddleware, adminOnly, async (req, res) => {
    try{
        const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`
        await removeProduct(req.params.id, req.session.user._id, fullName)
        res.status(200).json({ message: "Product deleted successfully" })
    }catch(e){
        res.status(400).json({ message: e.message })
    }
})

router.put("/inventory/:id", authMiddleware, adminOnly, async (req, res) => {
  try{
        const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`
        let { productName, categoryName, quantity, minThreshold, unitPrice, restockSuggestion } = req.body

        // Validate
        productName = helpers.validProductName(productName)
        categoryName = helpers.validCategoryName(categoryName)
        quantity = helpers.validQuantity(quantity)
        minThreshold = helpers.validMinThreshold(minThreshold)
        unitPrice = helpers.validUnitPrice(unitPrice)
        restockSuggestion = helpers.validRestockSuggestion(restockSuggestion)

        const updatedProduct = {
            productName,
            categoryName,
            quantity,
            minThreshold,
            unitPrice,
            restockSuggestion
        }

        const success = await updateProduct(
            req.params.id,
            updatedProduct.productName,
            updatedProduct.categoryName,
            updatedProduct.quantity,
            updatedProduct.minThreshold,
            updatedProduct.unitPrice,
            updatedProduct.restockSuggestion,
            req.session.user._id,
            fullName
        )

        if(!success){
            throw("Failed to update product")
        }

        res.status(200).json({
            message: "Product updated successfully",
            ...updatedProduct,
            _id: req.params.id,
            stockStatus: computeStockStatus(quantity, minThreshold),
            formattedPrice: (unitPrice * quantity).toFixed(2)
        })
  }catch(e){
    res.status(400).json({ message: e.message })
  }
})

router.post('/buy/:id', async (req, res) => {
    try{
        const productId = req.params.id
        const { quantity } = req.body

        if(quantity == null || isNaN(quantity) || quantity <= 0){
            return res.status(400).json({ message: "Invalid quantity" })
        }

        const product = await getProductById(productId)

        if(product.quantity < quantity){
            return res.status(400).json({ message: "Not enough stock" })
        }

        const newQuantity = product.quantity - quantity

        const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`

        await updateProductQuantity(productId, newQuantity, req.session.user._id, fullName)

        return res.status(200).json({
            message: "Product purchased successfully",
            updatedQuantity: newQuantity,
            minThreshold: product.minThreshold
        })
    }catch(err){
        res.status(err.status || 500).json({ message: err.message || "Server error" })
    }
})

export default router;