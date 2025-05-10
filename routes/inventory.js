import { Router } from 'express';
import { addProduct, updateProduct, removeProduct, getProductByName, getAllProducts } from "../data/inventoryController.js";
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js';
import * as helpers from "../utils/validations.js";
const router = Router();

// Render inventory page
router.get("/inventory", requireAuth, async (req, res) => {
    try{
        const products = await getAllProducts()

        res.render('inventory', {
            title: 'Inventory | SWIS',
            ...products
        })
    }catch(e){
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        })
    }

})

// search for product by name
router.get("/inventory/:productName", requireAuth, async (req, res) => {
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

// insert neq product into DB
router.post("/inventory", requireAuth, async (req, res) => {
    try{
        req.body.unitPrice = Number(req.body.unitPrice)
        req.body.minThreshold = Number(req.body.minThreshold)
        req.body.quantity = Number(req.body.quantity)

        req.body.productName = req.body.productName.trim()
        req.body.categoryName = req.body.categoryName.trim()

        const restockSuggestion = {
            recommendedQty: 0,
            nextRestockDate: req.body["restockSuggestion.nextRestockDate"].trim()
        }

        helpers.validProductName(req.body.productName)
        helpers.validCategoryName(req.body.categoryName)
        helpers.validQuantity(req.body.quantity)
        helpers.validMinThreshold(req.body.minThreshold)
        helpers.validUnitPrice(req.body.unitPrice)
        helpers.validRestockSuggestion(restockSuggestion)

        const args = [
            req.body.productName,
            req.body.categoryName,
            req.body.quantity,
            req.body.minThreshold,
            req.body.unitPrice,
            restockSuggestion
        ]

        const result = await addProduct(...args)

        if(!result){
            throw new Error("addProduct function failed")
        }

        return res.redirect("/inventory")
    }catch(e){
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        })
    }
})

export default router;