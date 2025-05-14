// settings.js
import express from 'express'
import { users } from '../config/mongoCollections.js'
import { authMiddleware } from '../middlewares/auth.js'
import { addAuditLog } from '../data/logController.js'
import { ObjectId } from 'mongodb'
import { validEmail, validFirstName, validLastName, validUsername } from '../utils/validations.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { updateProfilePicture } from '../data/userController.js'

const router = express.Router()

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Only image files are allowed!'))
        }
    }
})

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
        
        const { firstName, lastName, email, username, profilePicture } = userDoc
        res.render('settings', { 
            title: 'Settings | SWIS',
            user: { ...req.session.user, firstName, lastName, email, username, profilePicture },
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
        if(!user || !user._id){
            throw new Error('User not authenticated')
        }

        const usersCollection = await users()
        const userDoc = await usersCollection.findOne({ _id: new ObjectId(user._id) })
        if(!userDoc){
            throw new Error('User not found')
        }

        let { firstName, lastName, email, username } = req.body

        if(!firstName || !lastName || !email || !username){
            throw('Please fill in all fields')
        }

        firstName = validFirstName(firstName)
        lastName = validLastName(lastName)
        email = validEmail(email)
        username = validUsername(username).toLowerCase()

        await usersCollection.updateOne(
            { _id: new ObjectId(user._id) }, 
            { $set: { firstName, lastName, email, username} }
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

// New route for profile picture upload
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded')
        }

        const user = req.session.user
        if (!user || !user._id) {
            throw new Error('User not authenticated')
        }

        const profilePicturePath = '/images/' + req.file.filename
        await updateProfilePicture(new ObjectId(user._id), profilePicturePath)

        // Update session with new profile picture
        req.session.user.profilePicture = profilePicturePath

        res.redirect('/settings')
    } catch (e) {
        console.error('Error uploading profile picture:', e)
        res.status(500).render('error', {
            title: 'Error | SWIS',
            error: e.message
        })
    }
})

export default router;