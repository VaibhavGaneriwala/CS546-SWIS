import express from 'express'
import { getDashboardData } from '../data/dashboardController.js'
import { redirectIfAuthenticated, requireAuth } from '../src/middlewares/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try{
    const data = await getDashboardData()
    res.render('dashboard', { title: 'Dashboard', ...data })
  }catch(e){
    res.status(404).render('error', { title: 'Dashboard Error', error: e.message })
  }
})

export default router
