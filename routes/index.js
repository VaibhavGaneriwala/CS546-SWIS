import express from 'express';
import userRoutes from './users.js';
import inventoryRoutes from './inventory.js';
import dashboardRoutes from './dashboard.js';
import reportsRoutes from './reports.js';
import settingsRoutes from './settings.js';
import auditRoutes from './auditRoutes.js';

const router = express.Router();

// Root route - redirect to login
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Mount routes
router.use('/', userRoutes);
router.use('/', inventoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/logs', auditRoutes);
export default function configRoutes(app) {
    app.use('/', router);
}