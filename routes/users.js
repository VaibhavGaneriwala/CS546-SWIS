import express from 'express';
import {registerUser} from '../data/userController.js';

const router = express.Router();

router.post('/register', registerUser);

export default router;