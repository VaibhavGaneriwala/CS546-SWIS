import express from 'express';
import userRoutes from './users.js';

const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.render('login', {title: 'Login'});
});

// Mount user routes at both / and /users
router.use('/', userRoutes);
router.use('/users', userRoutes);

export default function configRoutes(app) {
  app.use('/', router);
}