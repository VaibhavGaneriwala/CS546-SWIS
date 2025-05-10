import express from 'express'
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js'
import * as helpers from "../utils/validations.js"
import { getReportData } from '../data/reportController.js'

const router = express.Router()

router.get('/reports', requireAuth, async (req, res) => {
    try{
        const reportData = await getReportData()
        res.render('reports', { title: 'Reports | SWIS', ...reportData})
    }catch(e){
        res.status(404).render('error', { title: 'Error | SWIS', error: e.message})
    }
})

export default router