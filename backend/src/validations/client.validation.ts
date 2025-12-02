import { z } from 'zod'

export const createClientSchema = z.object({
  company: z.string().min(1).max(100),
  responsible: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
})

export const updateClientSchema = z.object({
  company: z.string().min(1).max(100).optional(),
  responsible: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  active: z.boolean().optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
