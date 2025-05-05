import express from 'express';
import userRoutes from './users.js';

const router = express.Router();

router.use('/users', userRoutes);

export default function configRoutes(app) {
    app.use('/', router);
}