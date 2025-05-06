import express from 'express';
import {registerUser, loginUser} from '../data/userController.js';

const router = express.Router();

// Middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

// Middleware to check if user is not logged in
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Auth routes
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', {title: 'Login | SWIS'});
});

router.post('/login', redirectIfAuthenticated, loginUser);

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', {title: 'Register | SWIS'});
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