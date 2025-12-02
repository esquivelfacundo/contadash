import { Router } from 'express'
import * as budgetController from '../controllers/budget.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Get all budgets (with optional filters)
router.get('/', budgetController.getBudgets)

// Get budget summary for a period
router.get('/summary', budgetController.getBudgetSummary)

// Get budgets with spending comparison
router.get('/with-spending', budgetController.getBudgetsWithSpending)

// Copy budgets from one period to another
router.post('/copy', budgetController.copyBudgets)

// Get a single budget by ID
router.get('/:id', budgetController.getBudgetById)

// Create a new budget
router.post('/', budgetController.createBudget)

// Update a budget
router.put('/:id', budgetController.updateBudget)

// Delete a budget
router.delete('/:id', budgetController.deleteBudget)

export default router
