import { apiClient } from './client'

export interface RecurringTransaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  clientId?: string
  creditCardId?: string
  description: string
  amountArs: number
  amountUsd: number
  exchangeRate: number
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  startDate: string
  endDate?: string
  dayOfMonth?: number
  isActive: boolean
  notes?: string
  category?: any
  client?: any
  creditCard?: any
}

export const recurringTransactionsApi = {
  getAll: async (isActive?: boolean) => {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append('isActive', isActive.toString())
    const response = await apiClient.get(`/recurring-transactions?${params}`)
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/recurring-transactions/${id}`)
    return response.data
  },

  create: async (data: Partial<RecurringTransaction>) => {
    const response = await apiClient.post('/recurring-transactions', data)
    return response.data
  },

  update: async (id: string, data: Partial<RecurringTransaction>) => {
    const response = await apiClient.put(`/recurring-transactions/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/recurring-transactions/${id}`)
  },

  generateTransaction: async (id: string, date?: Date) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/generate`, {
      date: date?.toISOString(),
    })
    return response.data
  },

  markAsPaid: async (transactionId: string) => {
    const response = await apiClient.patch(`/recurring-transactions/transactions/${transactionId}/mark-paid`)
    return response.data
  },

  getUpcoming: async (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    const response = await apiClient.get(`/recurring-transactions/upcoming?${params}`)
    return response.data
  },

  endRecurring: async (id: string, endMonth: number, endYear: number) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/end`, {
      endMonth,
      endYear,
    })
    return response.data
  },
}
