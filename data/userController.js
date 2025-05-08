import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as helpers from '../utils/validations.js';

const SALT_ROUNDS = 10;

const registerUser = async (firstName, lastName, email, username, password) => {
    let status = 200;

    try {
        if (!firstName || !lastName || !email || !username || !password) {
            status = 404;
            throw new Error("You must supply all fields!");
        }

        const validatedFirstName = helpers.validFirstName(firstName);
        const validatedLastName = helpers.validLastName(lastName);
        const validatedEmail = helpers.validEmail(email);
        const validatedUsername = helpers.validUsername(username);
        const validatedPassword = helpers.validPassword(password);

        if (!validatedFirstName || !validatedLastName || !validatedEmail || !validatedUsername || !validatedPassword) {
            status = 404;
            throw new Error("You must supply all fields!");
        }

        const usersCol = await users();

        const existingUser = await usersCol.findOne({ username: validatedUsername });
        if (existingUser) {
            status = 404;
            throw new Error("Username already exists!");
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
            status = 500;
            throw new Error('User insert failed');
        }

        return { status, user: { _id: insertResult._id, username: insertResult.username, role: insertResult.role, firstName: insertResult.firstName } };
    } catch (e) {
        throw { status, message: e.message };
    }
};

const loginUser = async (username, password) => {
    let status = 200;

    try {
        if (!username || !password) {
            status = 404;
            throw new Error("Fill out username and password!");
        }
        const usersCol = await users();
        const user = await usersCol.findOne({ username: username });

        if (!user) {
            status = 404;
            throw new Error("Invalid username or password");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            status = 404;
            throw new Error("Invalid username or password");
        }

        // Update last login time
        await usersCol.updateOne(
            { _id: user._id },
            { $set: { lastLogin: helpers.createCurrentDateandTime() } }
        );

        return {
            status: status,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    } catch (e) {
        throw { status, message: e.message };
    }
};

export { registerUser, loginUser };