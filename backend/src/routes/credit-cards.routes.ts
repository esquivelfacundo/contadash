import { Router } from 'express'
import * as creditCardsController from '../controllers/credit-cards.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', creditCardsController.getAllCreditCards)
router.post('/', creditCardsController.createCreditCard)
router.get('/:id', creditCardsController.getCreditCardById)
router.put('/:id', creditCardsController.updateCreditCard)
router.delete('/:id', creditCardsController.deleteCreditCard)
router.get('/:id/stats', creditCardsController.getCreditCardStats)

export default router
