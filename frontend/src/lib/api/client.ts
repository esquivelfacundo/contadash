import axios from 'axios'

// Detectar si estamos en localhost o en red local
const getApiUrl = () => {
  // Si hay NEXT_PUBLIC_API_URL configurada, usarla (producción)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // En el servidor (SSR), usar localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api'
  }
  
  // En el cliente, usar la IP del host actual
  const hostname = window.location.hostname
  
  // Si es localhost, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api'
  }
  
  // Si es una IP de red local, usar esa IP para el backend
  return `http://${hostname}:3000/api`
}

const API_URL = getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
