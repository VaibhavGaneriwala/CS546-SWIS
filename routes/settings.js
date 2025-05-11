// settings.js
import express from 'express'
import { users } from '../config/mongoCollections.js'
import { authMiddleware } from '../middlewares/auth.js'
import { addAuditLog } from '../data/logController.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = req.session.user
        if (!user || !user._id) {
            throw new Error('User not authenticated')
        }
        
        const usersCollection = await users()
        const userDoc = await usersCollection.findOne({ _id: new ObjectId(user._id) })
        if (!userDoc) {
            throw new Error('User not found')
        }
        
        const { firstName, lastName, email, username } = userDoc
        res.render('settings', { 
            title: 'Settings | SWIS',
            user: { ...req.session.user, firstName, lastName, email, username },
            cssFile: 'settings.css'
        })
    } catch (e) {
        console.error('Error in settings route:', e)
        res.status(500).render('error', { 
            title: 'Error | SWIS',
            error: e.message 
        })
    }
})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = req.session.user
        if (!user || !user._id) {
            throw new Error('User not authenticated')
        }

        const usersCollection = await users()
        const userDoc = await usersCollection.findOne({ _id: new ObjectId(user._id) })
        if (!userDoc) {
            throw new Error('User not found')
        }

        const { firstName, lastName, email, username } = req.body
        await usersCollection.updateOne(
            { _id: new ObjectId(user._id) }, 
            { $set: { firstName, lastName, email, username } }
        )
        res.redirect('/settings')
    } catch (e) {
        console.error('Error in settings route:', e)
        res.status(500).render('error', { 
            title: 'Error | SWIS',
            error: e.message 
        })
    }
})

export default router;