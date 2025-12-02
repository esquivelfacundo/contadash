import { Router } from 'express'
import * as bankAccountsController from '../controllers/bank-accounts.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', bankAccountsController.getAllBankAccounts)
router.post('/', bankAccountsController.createBankAccount)
router.get('/:id', bankAccountsController.getBankAccountById)
router.put('/:id', bankAccountsController.updateBankAccount)
router.delete('/:id', bankAccountsController.deleteBankAccount)
router.get('/:id/stats', bankAccountsController.getBankAccountStats)

export default router
