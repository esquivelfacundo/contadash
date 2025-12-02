import { Request, Response, NextFunction } from 'express'
import * as categoryService from '../services/category.service'
import { CreateCategoryInput, UpdateCategoryInput } from '../validations/category.validation'

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const type = req.query.type as 'INCOME' | 'EXPENSE' | undefined

    const categories = await categoryService.getCategories(req.user.userId, type)

    res.json({ categories })
  } catch (error) {
    next(error)
  }
}

export async function getCategoryById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const category = await categoryService.getCategoryById(req.user.userId, id)

    res.json({ category })
  } catch (error) {
    next(error)
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const data: CreateCategoryInput = req.body
    const category = await categoryService.createCategory(req.user.userId, data)

    res.status(201).json({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const data: UpdateCategoryInput = req.body

    const category = await categoryService.updateCategory(req.user.userId, id, data)

    res.json({
      message: 'Category updated successfully',
      category,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const result = await categoryService.deleteCategory(req.user.userId, id)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
