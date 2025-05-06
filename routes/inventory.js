import { Router } from 'express';
import { addProduct, updateProduct, removeProduct, getProductByName } from "../data/inventoryController.js";
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js';

const router = Router();

router.get("/inventory/:productName", async (req, res) => {
    try {
        const product = await getProductByName(req.params.productName);
        return res.json(product);
    } catch (e) {
        return res.status(404).json({ error: e.message });
    }
});

export default router;