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

        const newUser = {firstName, lastName, email, username, password: hashedPassword, phone: '', street: '', city: '', state: '', zipCode: '', country: '', role: 'user', createdAt: new Date(), lastLogin: null};
        if (!insertResult.acknowledged || !insertResult.insertedId) throw new Error('User insert failed');

        req.session.user = {_id: insertResult.insertedId, username, role: 'user'};
        return res.redirect('/dashboard');
    } catch (e) {
        res.status(500).render('register', {title: 'Register', error: 'Failed to register user'});
    }
};

export {registerUser};