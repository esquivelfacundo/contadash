import { Router } from 'express'
import * as categoriesController from '../controllers/categories.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// CRUD
router.get('/', categoriesController.getCategories)
router.post('/', validateRequest(createCategorySchema), categoriesController.createCategory)
router.get('/:id', categoriesController.getCategoryById)
router.put('/:id', validateRequest(updateCategorySchema), categoriesController.updateCategory)
router.delete('/:id', categoriesController.deleteCategory)

export default router
