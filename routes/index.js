import express from 'express';
import userRoutes from './users.js';
import inventoryRoutes from './inventory.js';
import dashboardRoutes from './dashboardRoutes.js';

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


export default function configRoutes(app) {
    app.use('/', router);
}