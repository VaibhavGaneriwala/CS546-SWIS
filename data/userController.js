import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as helpers from '../utils/validations.js';

const SALT_ROUNDS = 10;

const registerUser = async (req, res) => {
    const {firstName, lastName, email, username, password} = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).render('register', {
            title: 'Register | SWIS',
            error: 'All fields are required'
        });
    }

    try {
        const validatedFirstName = helpers.validFirstName(firstName);
        const validatedLastName = helpers.validLastName(lastName);
        const validatedEmail = helpers.validEmail(email);
        const validatedUsername = helpers.validUsername(username);
        const validatedPassword = helpers.validPassword(password);

        if (!validatedFirstName || !validatedLastName || !validatedEmail || !validatedUsername || !validatedPassword) {
            return res.status(400).render('register', {
                title: 'Register | SWIS',
                error: 'All fields are required'
            });
        }

        const usersCol = await users();

        const existingUser = await usersCol.findOne({username: validatedUsername});
        if (existingUser) {
            return res.status(400).render('register', {
                title: 'Register | SWIS',
                error: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(validatedPassword, SALT_ROUNDS);

        const newUser = {
            firstName: validatedFirstName,
            lastName: validatedLastName,
            email: validatedEmail,
            username: validatedUsername,
            password: hashedPassword,
            role: 'user',
            createdAt: helpers.createCurrentDateandTime(),
            lastLogin: null
        };

        const insertResult = await usersCol.insertOne(newUser);
        if (!insertResult.acknowledged || !insertResult.insertedId) {
            throw new Error('User insert failed');
        }

        req.session.user = {
            _id: insertResult.insertedId,
            username: validatedUsername,
            role: 'user',
            firstName: validatedFirstName,
            lastName: validatedLastName
        };

        return res.redirect('/dashboard');
    } catch (error) {
        return res.status(400).render('register', {
            title: 'Register | SWIS',
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).render('login', {
            title: 'Login | SWIS',
            error: 'All fields are required'
        });
    }

    try {
        const usersCol = await users();
        const user = await usersCol.findOne({username: username});
        
        if (!user) {
            return res.status(400).render('login', {
                title: 'Login | SWIS',
                error: 'Invalid username or password'
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).render('login', {
                title: 'Login | SWIS',
                error: 'Invalid username or password'
            });
        }

        // Update last login time
        await usersCol.updateOne(
            {_id: user._id},
            {$set: {lastLogin: helpers.createCurrentDateandTime()}}
        );

        // Set session data
        req.session.user = {
            _id: user._id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        };

        // Redirect to dashboard
        return res.redirect('/dashboard');
    } catch (e) {
        return res.status(500).render('login', {
            title: 'Login | SWIS',
            error: 'Failed to login'
        });
    }
};

export {registerUser, loginUser};