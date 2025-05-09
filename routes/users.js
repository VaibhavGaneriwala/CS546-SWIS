import express from 'express';
import { registerUser, loginUser } from '../data/userController.js';
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js';
import *  as helpers from "../utils/validations.js";

const router = express.Router();

// Auth routes
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login | SWIS' });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
    let { username, password } = req.body;

    // req validation
    try {
        username = helpers.validUsername(req.body.username).trim();
        password = helpers.validPassword(req.body.password).trim();
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error | SWIS",
            error: e.message
        });
    }

    // DB comparison
    try {
        const result = await loginUser(username, password);

        // Set session data
        req.session.user = {
            _id: result.user._id,
            username: result.user.username,
            role: result.user.role,
            firstName: result.user.firstName,
            lastName: result.user.lastName
        };

        return res.redirect('/dashboard');
    } catch (e) {
        return res.status(e.status || 500).render("error", {
            title: "Error | SWIS",
            error: e.message
        });
    }
});

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { title: 'Register | SWIS' });
});

router.post('/register', redirectIfAuthenticated, async (req, res) => {
    let { firstName, lastName, email, username, password } = req.body;

    // req validation
    try {
        firstName = helpers.validFirstName(req.body.firstName).trim();
        lastName = helpers.validLastName(req.body.lastName).trim();
        email = helpers.validEmail(req.body.email).trim();
        username = helpers.validUsername(req.body.username).trim();
        password = helpers.validPassword(req.body.password).trim();
    } catch (e) {
        return res.status(404).render("error", {
            title: "Error | SWIS",
            error: e.message
        });
    }

    // DB insert
    try {
        const result = await registerUser(firstName, lastName, email, username, password);

        // Set session data
        req.session.user = {
            _id: result.user._id,
            username: result.user.username,
            role: result.user.role,
            firstName: result.user.firstName,
            lastName: result.user.lastName
        };

        return res.redirect("/login");
    } catch (e) {
        return res.status(e.status || 500).render("error", {
            title: "Error | SWIS",
            error: e.message
        });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

export default router;