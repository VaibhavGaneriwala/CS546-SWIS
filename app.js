import './backend/server.js';
import inventoryRoutes from './backend/routes/inventory.js';

const configRoutesFunction = (app) => {
    app.use('/', inventoryRoutes);

    app.use('*', (req, res) => {
        res.status(404).render('error', { message: 'Page Not Found' });
    });
};

export default configRoutesFunction;
