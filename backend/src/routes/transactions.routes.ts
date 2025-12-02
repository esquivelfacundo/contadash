import { Router } from 'express'
import * as transactionsController from '../controllers/transactions.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { createTransactionSchema, updateTransactionSchema } from '../validations/transaction.validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Stats
router.get('/stats', transactionsController.getTransactionStats)

// Monthly with credit cards
router.get('/monthly-with-cards', transactionsController.getTransactionsWithCreditCards)

// CRUD
router.get('/', transactionsController.getTransactions)
router.post('/', validateRequest(createTransactionSchema), transactionsController.createTransaction)
router.get('/:id', transactionsController.getTransactionById)
router.put('/:id', validateRequest(updateTransactionSchema), transactionsController.updateTransaction)
router.delete('/:id', transactionsController.deleteTransaction)

export default router
