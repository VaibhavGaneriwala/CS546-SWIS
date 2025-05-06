import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const SALT_ROUNDS = 10;

const registerUser = async (req, res) => {
    const {firstName, lastName, email, username, password} = req.body;

    if (!firstName || !lastName || !email || !username || !password) return res.status(400).render('register', {title: 'Register', error: 'All fields are required'});

    try {
        const usersCol = await users();

        const existingUser = await usersCol.findOne({username: username});
        if (existingUser) return res.status(400).render('register', {title: 'Register', error: 'Username already exists'});

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = {firstName, lastName, email, username, password: hashedPassword, role: 'user', createdAt: new Date(), lastLogin: null};
        const insertResult = await usersCol.insertOne(newUser);
        if (!insertResult.acknowledged || !insertResult.insertedId) throw new Error('User insert failed');

        req.session.user = {_id: insertResult.insertedId, username, role: 'user'};
        return res.redirect('/dashboard');
    } catch (e) {
        res.status(500).render('register', {title: 'Register', error: 'Failed to register user'});
    }
};

const loginUser = async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) return res.status(400).render('login', {title: 'Login', error: 'All fields are required'});

    try {
        const usersCol = await users();
        const user = await usersCol.findOne({username: username});
        
        if (!user) {
            return res.status(400).render('login', {title: 'Login', error: 'Invalid username or password'});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).render('login', {title: 'Login', error: 'Invalid username or password'});
        }

        // Update last login time
        await usersCol.updateOne(
            {_id: user._id},
            {$set: {lastLogin: new Date()}}
        );

        req.session.user = {
            _id: user._id,
            username: user.username,
            role: user.role
        };

        res.redirect('/dashboard');
    } catch (e) {
        res.status(500).render('login', {title: 'Login', error: 'Failed to login'});
    }
};

export {registerUser, loginUser};