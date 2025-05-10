import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import * as helpers from '../utils/validations.js';

const SALT_ROUNDS = 10;

const registerUser = async (firstName, lastName, email, username, password) => {
    try {
        if (!firstName || !lastName || !email || !username || !password) throw { status: 400, message: "You must supply all fields!" };

        const validatedFirstName = helpers.validFirstName(firstName);
        const validatedLastName = helpers.validLastName(lastName);
        const validatedEmail = helpers.validEmail(email);
        const validatedUsername = helpers.validUsername(username);
        const validatedPassword = helpers.validPassword(password);

        const usersCol = await users();

        const existingUser = await usersCol.findOne({ username: validatedUsername });
        if (existingUser) throw { status: 400, message: "Username already exists" };

        const hashedPassword = await bcrypt.hash(validatedPassword, SALT_ROUNDS);

        const newUser = {firstName: validatedFirstName, lastName: validatedLastName, email: validatedEmail, username: validatedUsername, password: hashedPassword, role: 'user', createdAt: helpers.createCurrentDateandTime(), lastLogin: null};

        const insertResult = await usersCol.insertOne(newUser);
        if (!insertResult.acknowledged || !insertResult.insertedId) throw { status: 500, message: "Could not add user" };

        return { status: 200, user: { _id: insertResult.insertedId, username: validatedUsername, role: 'user', firstName: validatedFirstName, lastName: validatedLastName } };
    } catch (e) {
        throw { status: 500, message: e.message };
    }
};

const loginUser = async (username, password) => {
    let status = 200;
    try {
        if (!username || !password) throw {status: 404, message: "You must supply both username and password!"};

        const usersCol = await users();
        const user = await usersCol.findOne({ username: username });

        if (!user) throw {status: 404, message: "Invalid username or password" };

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw {status:404, message: "Invalid username or password" };

        // Update last login time
        const updateResult = await usersCol.updateOne({ _id: user._id },{ $set: { lastLogin: helpers.createCurrentDateandTime()}});
        if (!updateResult.acknowledged || updateResult.modifiedCount === 0) throw {status: 500, message: "Could not update last login time" };

        return {status: 200, user: {_id: user._id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName}};
    } catch (e) {
        throw { status, message: e.message };
    }
};

export { registerUser, loginUser };