import express from 'express'
import { getDashboardData } from '../data/dashboardController.js'
import { checkInventoryDiscrepancies } from '../data/inventoryController.js'
import { authMiddleware, adminOnly } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const dashboardData = await getDashboardData()
    const discrepancies = await checkInventoryDiscrepancies()

    res.render('dashboard', {
      title: 'Dashboard | SWIS',
      cssFile: 'dashboard.css',
      ...dashboardData,
      discrepancies,
      hasDiscrepancies: discrepancies.length > 0
    })
  } catch (e) {
    res.status(500).render('error', { title: 'Error | SWIS', error: e.message })
  }
})

// API endpoint to check discrepancies
router.get('/discrepancies', authMiddleware, adminOnly, async (req, res) => {
  try {
    const discrepancies = await checkInventoryDiscrepancies()
    res.json({ discrepancies })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
