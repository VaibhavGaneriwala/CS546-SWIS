import { Router } from 'express';
import { addProduct, updateProduct, removeProduct, getProductByName } from "../data/inventoryController.js";
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js';
import * as helpers from "../utils/validations.js";

const router = Router();

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
    try {
        helpers.validProductName(req.body.productName);
        helpers.validCategoryName(req.body.categoryName);
        helpers.validQuantity(req.body.quantity);
        helpers.validMinThreshold(req.body.validMinThreshold);
        helpers.validUnitPrice(req.body.unitPrice);
        helpers.validRestockSuggestion(req.body.validRestockSuggestion);

        req.body.productName = req.body.productName.trim();
        req.body.categoryName = req.body.categoryName.trim();
        req.body.validRestockSuggestion.nextRestockDate = req.body.validRestockSuggestion.nextRestockDate.trim();

        args = [req.body.productName, req.body.categoryName, req.body.quantity, req.body.quantity,
        req.body.validMinThreshold, req.body.unitPrice, req.body.validRestockSuggestion
        ];
        const result = await addProduct(...args);
        if (!result) throw new Error("addProduct function failed");
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

export default router;