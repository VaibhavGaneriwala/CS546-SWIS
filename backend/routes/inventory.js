import express from 'express';
import { connectToDb } from '../dbConnection.js';

const router = express.Router();

router.get('/api/inventory', async (req, res) => {
    try {
        const db = await connectToDb();
        const items = await db.collection('inventory').find({}).toArray();
        res.json({ items });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/api/inventory/add', async (req, res) => {
    const { name, quantity } = req.body;
    try {
        const db = await connectToDb();
        const result = await db.collection('inventory').insertOne({
            name,
            quantity,
            lastUpdated: new Date()
        });
        res.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        console.error('Error adding inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
