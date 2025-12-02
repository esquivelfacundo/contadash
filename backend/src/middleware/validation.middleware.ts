import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from '../utils/errors'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body)

      if (!result.success) {
        const errors = result.error.flatten()
        return res.status(400).json({
          error: 'Validation error',
          details: errors,
        })
      }

      req.body = result.data
      next()
    } catch (error) {
      next(error)
    }
  }
}
