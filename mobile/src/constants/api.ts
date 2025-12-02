// Detectar si estamos en desarrollo o producción
const isDev = process.env.NODE_ENV === 'development'

// Configurar la URL del backend
// Para APK en red local, siempre usar la IP local
export const API_BASE_URL = 'http://192.168.0.81:3000/api'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_STATS: '/transactions/stats',
  MONTHLY_WITH_CARDS: '/transactions/monthly-with-cards',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Clients
  CLIENTS: '/clients',
  
  // Credit Cards
  CREDIT_CARDS: '/credit-cards',
  
  // Bank Accounts
  BANK_ACCOUNTS: '/bank-accounts',
  
  // Budgets
  BUDGETS: '/budgets',
  
  // Recurring
  RECURRING: '/recurring-transactions',
  
  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_EVOLUTION: '/analytics/monthly-evolution',
  ANALYTICS_CATEGORIES: '/analytics/category-evolution',
  ANALYTICS_CLIENTS: '/analytics/client-income',
  ANALYTICS_CARDS: '/analytics/card-spending',
  ANALYTICS_COMPARISON: '/analytics/year-comparison',
  ANALYTICS_ANOMALIES: '/analytics/anomalies',
  
  // Reports
  REPORTS_GENERATE: '/reports/generate',
  
  // Exchange
  EXCHANGE_CURRENT: '/exchange/dolar-blue',
  EXCHANGE_HISTORICAL: '/exchange/dolar-blue/date',
  
  // User
  USER_PROFILE: '/users/profile',
  USER_CHANGE_PASSWORD: '/users/change-password'
}
