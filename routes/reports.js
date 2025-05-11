import express from 'express';
import { getDashboardData } from '../data/dashboardController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/reports', authMiddleware, async (req, res) => {
    try {
        const data = await getDashboardData();
        res.render('reports', {
            title: 'Reports | SWIS',
            ...data
        });
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error",
            error: e.message
        });
    }
});

export default router; 