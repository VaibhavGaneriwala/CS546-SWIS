import express from 'express'
import { getAuditLogs } from '../data/auditController.js'
import { adminOnly, authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try{
        const logs = await getAuditLogs();
        res.render('logs', { title: 'Audit Logs', cssFile: 'logs.css', logs })
    }catch(e){
        res.status(404).render('error', { title: 'Logs Error', error: e.message })
    }

})

export default router;