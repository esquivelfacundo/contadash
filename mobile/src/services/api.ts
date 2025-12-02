import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../constants/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },
  
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Analytics API
export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },
  
  getYearlySummary: async (year: number) => {
    const response = await api.get(`/analytics/yearly-summary?year=${year}`)
    return response.data
  },
}

// Transactions API
export const transactionsApi = {
  getAll: async (month?: number, year?: number) => {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    const response = await api.get('/transactions', { params })
    return response.data
  },
  
  getMonthlyWithCreditCards: async (month: number, year: number) => {
    const response = await api.get(`/transactions/monthly-with-cards?month=${month}&year=${year}`)
    return response.data
  },
  
  getStats: async (month?: number, year?: number) => {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    const response = await api.get('/transactions/stats', { params })
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/transactions', data)
    return response.data
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/transactions/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (type?: 'INCOME' | 'EXPENSE') => {
    const params: any = {}
    if (type) params.type = type
    const response = await api.get('/categories', { params })
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/categories', data)
    return response.data
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

// Credit Cards API
export const creditCardsApi = {
  getAll: async () => {
    const response = await api.get('/credit-cards')
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/credit-cards/${id}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/credit-cards', data)
    return response.data
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/credit-cards/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/credit-cards/${id}`)
    return response.data
  },
}

// Clients API
export const clientsApi = {
  getAll: async () => {
    const response = await api.get('/clients')
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/clients', data)
    return response.data
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  },
}

// Bank Accounts API
export const bankAccountsApi = {
  getAll: async () => {
    const response = await api.get('/bank-accounts')
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/bank-accounts/${id}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/bank-accounts', data)
    return response.data
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/bank-accounts/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/bank-accounts/${id}`)
    return response.data
  },
}

// Exchange Rate API
export const exchangeApi = {
  getDolarBlue: async () => {
    const response = await api.get('/exchange/blue')
    return response.data.rate
  },
  
  getDolarBlueForDate: async (date: string) => {
    const response = await api.get(`/exchange/blue/date?date=${date}`)
    return response.data.rate
  },
}

// Budgets API
export const budgetsApi = {
  getSummary: async (month: number, year: number) => {
    const response = await api.get(`/budgets/summary?month=${month}&year=${year}`)
    return response.data
  },

  getAll: async (month?: number, year?: number) => {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    const response = await api.get('/budgets', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/budgets', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/budgets/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  },

  copy: async (fromMonth: number, fromYear: number, toMonth: number, toYear: number) => {
    const response = await api.post('/budgets/copy', {
      fromMonth,
      fromYear,
      toMonth,
      toYear,
    })
    return response.data
  },
}

export default api
