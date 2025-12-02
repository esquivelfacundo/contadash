import { Router } from 'express'
import * as clientsController from '../controllers/clients.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { createClientSchema, updateClientSchema } from '../validations/client.validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// CRUD
router.get('/', clientsController.getClients)
router.post('/', validateRequest(createClientSchema), clientsController.createClient)
router.get('/:id', clientsController.getClientById)
router.get('/:id/stats', clientsController.getClientStats)
router.put('/:id', validateRequest(updateClientSchema), clientsController.updateClient)
router.delete('/:id', clientsController.deleteClient)

export default router
