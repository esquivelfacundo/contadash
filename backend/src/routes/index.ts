import { Router } from 'express'
import authRoutes from './auth.routes'
import emailVerificationRoutes from './email-verification.routes'
import passwordResetRoutes from './password-reset.routes'
import transactionsRoutes from './transactions.routes'
import categoriesRoutes from './categories.routes'
import clientsRoutes from './clients.routes'
import analyticsRoutes from './analytics.routes'
import exchangeRoutes from './exchange.routes'
import reportsRoutes from './reports.routes'
import creditCardsRoutes from './credit-cards.routes'
import bankAccountsRoutes from './bank-accounts.routes'
import recurringTransactionsRoutes from './recurring-transactions.routes'
import budgetRoutes from './budget.routes'
import uploadRoutes from './upload.routes'
import filesRoutes from './files.routes'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/email-verification', emailVerificationRoutes)
router.use('/password-reset', passwordResetRoutes)
router.use('/transactions', transactionsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/clients', clientsRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/exchange', exchangeRoutes)
router.use('/reports', reportsRoutes)
router.use('/credit-cards', creditCardsRoutes)
router.use('/bank-accounts', bankAccountsRoutes)
router.use('/recurring-transactions', recurringTransactionsRoutes)
router.use('/budgets', budgetRoutes)
router.use('/upload', uploadRoutes)
router.use('/files', filesRoutes)

// API info
router.get('/', (_req, res) => {
  res.json({
    message: 'ContaDash API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        logout: 'POST /api/auth/logout',
      },
      transactions: {
        list: 'GET /api/transactions',
        create: 'POST /api/transactions',
        get: 'GET /api/transactions/:id',
        update: 'PUT /api/transactions/:id',
        delete: 'DELETE /api/transactions/:id',
        stats: 'GET /api/transactions/stats',
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        get: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
      },
      clients: {
        list: 'GET /api/clients',
        create: 'POST /api/clients',
        get: 'GET /api/clients/:id',
        update: 'PUT /api/clients/:id',
        delete: 'DELETE /api/clients/:id',
        stats: 'GET /api/clients/:id/stats',
      },
      bankAccounts: {
        list: 'GET /api/bank-accounts',
        create: 'POST /api/bank-accounts',
        get: 'GET /api/bank-accounts/:id',
        update: 'PUT /api/bank-accounts/:id',
        delete: 'DELETE /api/bank-accounts/:id',
        stats: 'GET /api/bank-accounts/:id/stats',
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        trend: 'GET /api/analytics/trend',
        categoryBreakdown: 'GET /api/analytics/category-breakdown',
        clientAnalysis: 'GET /api/analytics/client/:clientId',
      },
    },
  })
})

export default router
