import express from 'express';
import userRoutes from './users.js';
import inventoryRoutes from './inventory.js';
import dashboardRoutes from './dashboardRoutes.js'
import reportRoutes from './report.js'

const router = express.Router();

// Root route - redirect to login
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Mount user routes
router.use('/', userRoutes);
router.use('/', inventoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', reportRoutes)

export default function configRoutes(app) {
    app.use('/', router);
}