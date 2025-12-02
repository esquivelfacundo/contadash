import { apiClient } from './client'

export interface Transaction {
  id: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  clientId?: string
  description: string
  amountArs: number
  amountUsd: number
  exchangeRate: number
  notes?: string
  category: {
    id: string
    name: string
    color: string
    icon: string
  }
  client?: {
    id: string
    name: string
  }
}

export interface CreateTransactionInput {
  date: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  clientId?: string
  description: string
  amountArs: number
  amountUsd: number
  exchangeRate: number
  notes?: string
}

export const transactionsApi = {
  getAll: async (filters?: any) => {
    const response = await apiClient.get('/transactions', { params: filters })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data.transaction
  },

  create: async (data: CreateTransactionInput) => {
    const response = await apiClient.post('/transactions', data)
    return response.data.transaction
  },

  update: async (id: string, data: Partial<CreateTransactionInput>) => {
    const response = await apiClient.put(`/transactions/${id}`, data)
    return response.data.transaction
  },

  delete: async (id: string) => {
    await apiClient.delete(`/transactions/${id}`)
  },

  getStats: async (month?: number, year?: number) => {
    const response = await apiClient.get('/transactions/stats', {
      params: { month, year },
    })
    return response.data.stats
  },

  getMonthlyWithCreditCards: async (month: number, year: number) => {
    const response = await apiClient.get('/transactions/monthly-with-cards', {
      params: { month, year },
    })
    return response.data
  },
}
