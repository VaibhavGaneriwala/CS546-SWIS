import express from 'express';
import {registerUser, loginUser} from '../data/userController.js';

const router = express.Router();

// Registration routes
router.get('/register', (req, res) => {
    res.render('register', {title: 'Register'});
});
router.post('/register', registerUser);

// Login routes
router.get('/login', (req, res) => {
    res.render('login', {title: 'Login'});
});
router.post('/login', loginUser);

export default router;