import express from 'express'
import { getDashboardData } from '../data/dashboardController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try{
    const data = await getDashboardData()
    res.render('dashboard', { title: 'Dashboard | SWIS', cssFile: 'dashboard.css', ...data })
  }catch(e){
    res.status(404).render('error', { title: 'Dashboard Error', error: e.message })
  }
})

export default router
