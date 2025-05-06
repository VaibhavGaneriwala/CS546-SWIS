import express from 'express';
import userRoutes from './users.js';
import inventoryRoutes from './inventory.js';

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

export default function configRoutes(app) {
    app.use('/', router);
}