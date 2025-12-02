import { z } from 'zod'

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoría requerida'),
  month: z.number().int().min(1).max(12, 'Mes debe estar entre 1 y 12'),
  year: z.number().int().min(2020).max(2100, 'Año inválido'),
  amountArs: z.number().nonnegative('Monto ARS debe ser positivo o cero'),
  amountUsd: z.number().nonnegative('Monto USD debe ser positivo o cero'),
}).refine(
  (data) => data.amountArs > 0 || data.amountUsd > 0,
  {
    message: 'Al menos uno de los montos debe ser mayor a 0',
    path: ['amountArs'],
  }
)

export const updateBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoría requerida').optional(),
  month: z.number().int().min(1).max(12, 'Mes debe estar entre 1 y 12').optional(),
  year: z.number().int().min(2020).max(2100, 'Año inválido').optional(),
  amountArs: z.number().nonnegative('Monto ARS debe ser positivo o cero').optional(),
  amountUsd: z.number().nonnegative('Monto USD debe ser positivo o cero').optional(),
})

export const budgetFiltersSchema = z.object({
  categoryId: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type BudgetFilters = z.infer<typeof budgetFiltersSchema>
