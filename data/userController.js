import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import * as helpers from '../utils/validations.js';

const SALT_ROUNDS = 10;

const registerUser = async (firstName, lastName, email, username, password, role) => {
    try {
        if (!firstName || !lastName || !email || !username || !password || !role) throw { status: 400, message: "You must supply all fields!" };

        const validatedFirstName = helpers.validFirstName(firstName);
        const validatedLastName = helpers.validLastName(lastName);
        const validatedEmail = helpers.validEmail(email);
        const validatedUsername = helpers.validUsername(username);
        const validatedPassword = helpers.validPassword(password);

        // Validate role
        if (role !== 'user' && role !== 'admin') {
            throw { status: 400, message: "Invalid role selected" };
        }

        const usersCol = await users();

        const existingUser = await usersCol.findOne({ username: validatedUsername });
        if (existingUser) throw { status: 400, message: "Username already exists" };

        const hashedPassword = await bcrypt.hash(validatedPassword, SALT_ROUNDS);

        const newUser = {
            firstName: validatedFirstName,
            lastName: validatedLastName,
            email: validatedEmail,
            username: validatedUsername,
            password: hashedPassword,
            roleName: role,
            createdAt: helpers.createCurrentDateandTime(),
            lastLogin: null
        };

        const insertResult = await usersCol.insertOne(newUser);
        if (!insertResult.acknowledged || !insertResult.insertedId) throw { status: 500, message: "Could not add user" };

        return {
            status: 200,
            user: {
                _id: insertResult.insertedId,
                username: validatedUsername,
                roleName: role,
                firstName: validatedFirstName,
                lastName: validatedLastName
            }
        };
    } catch (e) {
        throw { status: 500, message: e.message };
    }
};

const loginUser = async (username, password) => {
    let status = 200;
    try {
        if (!username || !password) throw { status: 404, message: "You must supply both username and password!" };

        const usersCol = await users();
        const user = await usersCol.findOne({ username: username });

        if (!user) throw { status: 404, message: "Invalid username or password" };

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw { status: 404, message: "Invalid username or password" };

        // Update last login time
        const updateResult = await usersCol.updateOne({ _id: user._id }, { $set: { lastLogin: helpers.createCurrentDateandTime() } });
        if (!updateResult.acknowledged || updateResult.modifiedCount === 0) throw { status: 500, message: "Could not update last login time" };

        return { status: 200, user: { _id: user._id, username: user.username, roleName: user.roleName, firstName: user.firstName, lastName: user.lastName } };
    } catch (e) {
        throw { status, message: e.message };
    }
};

const updateUser = async (userId, updates) => {
    try {
        const usersCol = await users();
        const updateResult = await usersCol.updateOne({ _id: userId }, { $set: updates });
        if (!updateResult.acknowledged || updateResult.modifiedCount === 0) throw { status: 500, message: "Could not update user" };

        return { status: 200, message: "User updated successfully" };
    } catch (e) {
        throw { status: 500, message: e.message };
    }
};

export { registerUser, loginUser, updateUser };
