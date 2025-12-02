import { apiClient } from './client'

export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  isDefault: boolean
}

export const categoriesApi = {
  getAll: async (type?: 'INCOME' | 'EXPENSE') => {
    const response = await apiClient.get('/categories', { params: { type } })
    return response.data.categories
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data.category
  },

  create: async (data: Omit<Category, 'id' | 'isDefault'>) => {
    const response = await apiClient.post('/categories', data)
    return response.data.category
  },

  update: async (id: string, data: Partial<Omit<Category, 'id' | 'isDefault' | 'type'>>) => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data.category
  },

  delete: async (id: string) => {
    await apiClient.delete(`/categories/${id}`)
  },
}
