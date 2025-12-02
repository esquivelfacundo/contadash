import { apiClient } from './client'

export interface Client {
  id: string
  company: string
  responsible?: string
  email?: string
  phone?: string
  active: boolean
  _count?: {
    transactions: number
  }
}

export const clientsApi = {
  getAll: async (activeOnly?: boolean) => {
    const response = await apiClient.get('/clients', {
      params: { active: activeOnly },
    })
    return response.data.clients
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}`)
    return response.data.client
  },

  create: async (data: Omit<Client, 'id' | 'active' | '_count'>) => {
    const response = await apiClient.post('/clients', data)
    return response.data.client
  },

  update: async (id: string, data: Partial<Omit<Client, 'id' | '_count'>>) => {
    const response = await apiClient.put(`/clients/${id}`, data)
    return response.data.client
  },

  delete: async (id: string) => {
    await apiClient.delete(`/clients/${id}`)
  },

  getStats: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}/stats`)
    return response.data.stats
  },
}
