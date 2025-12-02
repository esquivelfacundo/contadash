import { z } from 'zod'

export const createTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid(),
  clientId: z.string().cuid().optional(),
  creditCardId: z.string().cuid().optional(),
  paymentMethod: z.enum(['CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO']).optional(),
  bankAccountId: z.string().cuid().optional(),
  description: z.string().min(1).max(500),
  amountArs: z.number().nonnegative(),
  amountUsd: z.number().nonnegative(),
  exchangeRate: z.number().positive(),
  isPaid: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  attachmentUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  metadata: z.record(z.any()).optional().nullable(),
}).refine(
  (data) => data.amountArs > 0 || data.amountUsd > 0,
  { message: 'At least one amount must be greater than 0' }
)

export const updateTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional().nullable(),
  creditCardId: z.string().cuid().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO']).optional(),
  bankAccountId: z.string().cuid().optional().nullable(),
  description: z.string().min(1).max(500).optional(),
  amountArs: z.number().nonnegative().optional(),
  amountUsd: z.number().nonnegative().optional(),
  exchangeRate: z.number().positive().optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
  attachmentUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.any()).optional().nullable(),
})

export const transactionFiltersSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
