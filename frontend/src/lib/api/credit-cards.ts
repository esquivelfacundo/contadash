import { apiClient } from './client'

export interface CreditCard {
  id: string
  name: string
  lastFourDigits: string
  bank?: string
  creditLimit?: number
  closingDay: number
  dueDay: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const creditCardsApi = {
  getAll: async () => {
    const response = await apiClient.get('/credit-cards')
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/credit-cards/${id}`)
    return response.data
  },

  create: async (data: Partial<CreditCard>) => {
    const response = await apiClient.post('/credit-cards', data)
    return response.data
  },

  update: async (id: string, data: Partial<CreditCard>) => {
    const response = await apiClient.put(`/credit-cards/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/credit-cards/${id}`)
  },

  getStats: async (id: string, month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    const response = await apiClient.get(`/credit-cards/${id}/stats?${params}`)
    return response.data
  },
}
