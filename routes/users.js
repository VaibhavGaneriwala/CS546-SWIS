import express from 'express';
import { registerUser, loginUser } from '../data/userController.js';
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js';

const router = express.Router();

// Auth routes
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login | SWIS' });
});

router.post('/login', redirectIfAuthenticated, loginUser);

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { title: 'Register | SWIS' });
});

router.post('/register', redirectIfAuthenticated, registerUser);

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protected routes
router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard | SWIS',
        user: req.session.user
    });
});

export default router;