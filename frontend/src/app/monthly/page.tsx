'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney,
  Add,
  Edit,
  Delete,
  Visibility,
  Repeat,
  History,
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'
import IncomeTransactionDialog from '@/components/IncomeTransactionDialog'
import ExpenseTransactionDialog from '@/components/ExpenseTransactionDialog'
import DocumentViewer from '@/components/DocumentViewer'
import RecurringTransactionsModal from '@/components/modals/RecurringTransactionsModal'
import TransactionHistoryModal from '@/components/modals/TransactionHistoryModal'
import { transactionsApi } from '@/lib/api/transactions'
import { exchangeApi } from '@/lib/api/exchange'
import { useNotificationStore } from '@/lib/store/notification.store'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MonthlyPage() {
  const currentDate = new Date()
  const { showNotification } = useNotificationStore()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [yearSummary, setYearSummary] = useState<any>(null)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentToView, setDocumentToView] = useState<string | null>(null)
  const [recurringModalOpen, setRecurringModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [currentDolarRate, setCurrentDolarRate] = useState<number>(1000)
  const [currentApiDolarRate, setCurrentApiDolarRate] = useState<number>(1000)

  useEffect(() => {
    loadMonthlyData()
    loadDolarRate()
  }, [year, selectedMonth])

  // Cargar cotización actual de la API una sola vez para las cards anuales
  useEffect(() => {
    const loadCurrentApiRate = async () => {
      try {
        const rate = await exchangeApi.getDolarBlue()
        setCurrentApiDolarRate(rate)
      } catch (error) {
        console.error('Error loading current API rate:', error)
        setCurrentApiDolarRate(1000)
      }
    }
    loadCurrentApiRate()
  }, [])

  const loadDolarRate = async () => {
    try {
      const today = new Date()
      const isCurrentOrFutureMonth = 
        year > today.getFullYear() || 
        (year === today.getFullYear() && selectedMonth >= today.getMonth())
      
      if (isCurrentOrFutureMonth) {
        // Si es el mes actual o futuro, usar cotización de hoy
        const rate = await exchangeApi.getDolarBlue()
        setCurrentDolarRate(rate)
      } else {
        // Si es un mes pasado, usar cotización del último día de ese mes
        const lastDayOfMonth = new Date(year, selectedMonth + 1, 0)
        const dateStr = lastDayOfMonth.toISOString().split('T')[0]
        const rate = await exchangeApi.getDolarBlueForDate(dateStr)
        setCurrentDolarRate(rate)
      }
    } catch (err) {
      console.error('Error loading dolar rate:', err)
      // Fallback to current rate
      try {
        const rate = await exchangeApi.getDolarBlue()
        setCurrentDolarRate(rate)
      } catch {
        setCurrentDolarRate(1000)
      }
    }
  }

  const loadMonthlyData = async () => {
    try {
      setLoading(true)
      const month = selectedMonth + 1

      // Get transactions for the selected month with credit card placeholders
      const data = await transactionsApi.getMonthlyWithCreditCards(month, year)

      setMonthlyData(data.transactions)

      // Calculate year summary
      const yearData = await transactionsApi.getStats(undefined, year)
      setYearSummary(yearData)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPaymentMethodLabel = (paymentMethod: string, bankAccount?: any, creditCard?: any) => {
    switch (paymentMethod) {
      case 'CASH':
        return '💵 Efectivo'
      case 'MERCADOPAGO':
        return '💳 MercadoPago'
      case 'BANK_ACCOUNT':
        return bankAccount ? `🏦 ${bankAccount.name}` : '🏦 Cuenta Bancaria'
      case 'CRYPTO':
        return '₿ Criptomoneda'
      default:
        // Fallback para transacciones antiguas con tarjeta de crédito
        return creditCard ? `💳 ${creditCard.name}` : '-'
    }
  }

  const handleCreateTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setEditingTransaction(null)
    if (type === 'INCOME') {
      setIncomeDialogOpen(true)
    } else {
      setExpenseDialogOpen(true)
    }
  }

  const handleEditTransaction = (transaction: any) => {
    // If it's a placeholder, convert it to a new transaction
    if (transaction.isPlaceholder) {
      setEditingTransaction({
        ...transaction,
        id: null, // Remove ID so it creates a new transaction
      })
    } else {
      setEditingTransaction(transaction)
    }
    
    // Abrir el modal correspondiente según el tipo de transacción
    if (transaction.type === 'INCOME') {
      setIncomeDialogOpen(true)
    } else {
      setExpenseDialogOpen(true)
    }
  }

  const handleViewDocument = (url: string) => {
    setDocumentToView(url)
    setDocumentViewerOpen(true)
  }

  const handleDeleteClick = (transaction: any) => {
    // Don't allow deleting placeholders
    if (transaction.isPlaceholder) {
      return
    }
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      await transactionsApi.delete(transactionToDelete.id)
      showNotification('Transacción eliminada exitosamente', 'success')
      loadMonthlyData()
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    } catch (err) {
      showNotification('Error al eliminar transacción', 'error')
    }
  }

  const handleTransactionSuccess = () => {
    showNotification(
      editingTransaction ? 'Transacción actualizada' : 'Transacción creada',
      'success'
    )
    loadMonthlyData()
  }

  // Separate income and expense transactions
  const incomeTransactions = monthlyData.filter(t => t.type === 'INCOME')
  const expenseTransactions = monthlyData.filter(t => t.type === 'EXPENSE')

  // Calculate month totals
  const monthIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amountArs), 0)
  const monthExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amountArs), 0)
  const monthBalance = monthIncome - monthExpense

  const monthIncomeUSD = incomeTransactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)
  const monthExpenseUSD = expenseTransactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)
  const monthBalanceUSD = monthIncomeUSD - monthExpenseUSD

  // Always use the real USD amounts from transactions (amountUsd field)
  // Each transaction already has the correct USD amount calculated with its specific exchange rate
  const monthIncomeUSDReal = monthIncomeUSD
  const monthExpenseUSDReal = monthExpenseUSD
  const monthBalanceUSDReal = monthIncomeUSDReal - monthExpenseUSDReal

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="white">
              Movimientos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen detallado por mes y año
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Repeat />}
              onClick={() => setRecurringModalOpen(true)}
              size="small"
              sx={{ 
                borderColor: '#10B981', 
                color: '#10B981',
                '&:hover': { 
                  borderColor: '#059669', 
                  bgcolor: 'rgba(16, 185, 129, 0.1)' 
                }
              }}
            >
              Transacciones Recurrentes
            </Button>
            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => setHistoryModalOpen(true)}
              size="small"
              sx={{ 
                borderColor: '#3B82F6', 
                color: '#3B82F6',
                '&:hover': { 
                  borderColor: '#2563EB', 
                  bgcolor: 'rgba(59, 130, 246, 0.1)' 
                }
              }}
            >
              Historial de Transacciones
            </Button>
            <TextField
              select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              size="small"
              sx={{ 
                minWidth: 100,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1E293B',
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#334155',
                  },
                  '&:hover fieldset': {
                    borderColor: '#475569',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#10B981',
                  },
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Year Summary */}
        {yearSummary && (
          <Grid container spacing={3} sx={{ mb: 0 }}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                }}
              >
                <CardContent>
                  <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                    Ingresos {year}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(yearSummary.income.ars)}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)">
                    {formatUSD(yearSummary.income.ars / currentApiDolarRate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  border: 'none',
                }}
              >
                <CardContent>
                  <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                    Egresos {year}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(yearSummary.expense.ars)}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)">
                    {formatUSD(yearSummary.expense.ars / currentApiDolarRate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  border: 'none',
                }}
              >
                <CardContent>
                  <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                    Balance {year}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(yearSummary.balance.ars)}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)">
                    {formatUSD(yearSummary.balance.ars / currentApiDolarRate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Month Tabs */}
        <Card sx={{ mb: 3, mt: 2, bgcolor: '#1E293B', border: 'none' }}>
          <Tabs
            value={selectedMonth}
            onChange={(_, value) => setSelectedMonth(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#94A3B8',
                '&.Mui-selected': {
                  color: '#10B981',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#10B981',
              },
            }}
          >
            {MONTHS.map((month, index) => (
              <Tab key={index} label={month} />
            ))}
          </Tabs>
        </Card>


        {/* Dolar Rate Info */}
        <Card sx={{ mb: 3, bgcolor: '#1E293B', border: 'none' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <AttachMoney sx={{ color: '#3B82F6' }} />
              <Box>
                <Typography variant="body2" fontWeight="bold" color="white">
                  Cotización Dólar Blue: ${currentDolarRate.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {(() => {
                    const today = new Date()
                    const isCurrentOrFutureMonth = 
                      year > today.getFullYear() || 
                      (year === today.getFullYear() && selectedMonth >= today.getMonth())
                    
                    if (isCurrentOrFutureMonth) {
                      return `Última actualización: ${new Date().toLocaleDateString('es-AR')}`
                    } else {
                      const lastDayOfMonth = new Date(year, selectedMonth + 1, 0)
                      return `Cotización de cierre: ${lastDayOfMonth.toLocaleDateString('es-AR')}`
                    }
                  })()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Month Summary */}
        <Grid container spacing={3} sx={{ mb: 0 }}>
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                  Ingresos - {MONTHS[selectedMonth]}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatCurrency(monthIncome)}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.9)" display="block">
                  {(() => {
                    const today = new Date()
                    const isCurrentOrFutureMonth = 
                      year > today.getFullYear() || 
                      (year === today.getFullYear() && selectedMonth >= today.getMonth())
                    
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthIncome / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthIncome / currentDolarRate)}`
                    }
                  })()}
                </Typography>
                {(() => {
                  const today = new Date()
                  const isCurrentOrFutureMonth = 
                    year > today.getFullYear() || 
                    (year === today.getFullYear() && selectedMonth >= today.getMonth())
                  
                  if (isCurrentOrFutureMonth) {
                    return (
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Registrado: {formatUSD(monthIncome / currentDolarRate)}
                      </Typography>
                    )
                  }
                  return null
                })()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                  Egresos - {MONTHS[selectedMonth]}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatCurrency(monthExpense)}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.9)" display="block">
                  {(() => {
                    const today = new Date()
                    const isCurrentOrFutureMonth = 
                      year > today.getFullYear() || 
                      (year === today.getFullYear() && selectedMonth >= today.getMonth())
                    
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthExpense / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthExpense / currentDolarRate)}`
                    }
                  })()}
                </Typography>
                {(() => {
                  const today = new Date()
                  const isCurrentOrFutureMonth = 
                    year > today.getFullYear() || 
                    (year === today.getFullYear() && selectedMonth >= today.getMonth())
                  
                  if (isCurrentOrFutureMonth) {
                    return (
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Registrado: {formatUSD(monthExpense / currentDolarRate)}
                      </Typography>
                    )
                  }
                  return null
                })()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                  Balance - {MONTHS[selectedMonth]}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatCurrency(monthBalance)}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.9)" display="block">
                  {(() => {
                    const today = new Date()
                    const isCurrentOrFutureMonth = 
                      year > today.getFullYear() || 
                      (year === today.getFullYear() && selectedMonth >= today.getMonth())
                    
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthBalance / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthBalance / currentDolarRate)}`
                    }
                  })()}
                </Typography>
                {(() => {
                  const today = new Date()
                  const isCurrentOrFutureMonth = 
                    year > today.getFullYear() || 
                    (year === today.getFullYear() && selectedMonth >= today.getMonth())
                  
                  if (isCurrentOrFutureMonth) {
                    return (
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Registrado: {formatUSD(monthBalance / currentDolarRate)}
                      </Typography>
                    )
                  }
                  return null
                })()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Typography color="rgba(255,255,255,0.8)" variant="body2" gutterBottom>
                  Transacciones
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {monthlyData.length}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  {MONTHS[selectedMonth]} {year}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Income Transactions Table */}
        <Card sx={{ mb: 3, mt: 2, bgcolor: '#1E293B', border: 'none' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" color="#10B981">
                📈 Ingresos - {MONTHS[selectedMonth]} {year}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCreateTransaction('INCOME')}
                sx={{
                  bgcolor: '#10B981',
                  '&:hover': {
                    bgcolor: '#059669',
                  },
                }}
              >
                Nuevo Ingreso
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : incomeTransactions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No hay ingresos en {MONTHS[selectedMonth]} {year}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cliente/Empresa</TableCell>
                      <TableCell>Método de Pago</TableCell>
                      <TableCell align="right">ARS</TableCell>
                      <TableCell align="right">USD</TableCell>
                      <TableCell align="right">Cotización</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomeTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{transaction.category.icon}</span>
                            {transaction.category.name}
                          </Box>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.client ? (
                            <Typography variant="body2" color="text.secondary">
                              {transaction.client.company}
                            </Typography>
                          ) : transaction.creditCard ? (
                            <Typography variant="body2" color="text.secondary">
                              💳 {transaction.creditCard.name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getPaymentMethodLabel(transaction.paymentMethod, transaction.bankAccount, transaction.creditCard)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="success.main">
                            {formatCurrency(transaction.amountArs)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="success.dark">
                            {formatUSD(Number(transaction.amountArs) / currentDolarRate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${currentDolarRate.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {transaction.attachmentUrl && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewDocument(transaction.attachmentUrl)}
                              title="Ver documento"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditTransaction(transaction)}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {!transaction.isPlaceholder && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(transaction)}
                              title="Eliminar"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ bgcolor: '#0F172A !important' }}>
                      <TableCell colSpan={5} sx={{ color: 'white', borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="white">TOTAL INGRESOS</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="#10B981">
                          {formatCurrency(monthIncome)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="#10B981">
                          {formatUSD(monthIncome / currentDolarRate)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }} />
                      <TableCell sx={{ borderBottom: 'none' }} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense Transactions Table */}
        <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" color="#EF4444">
                📉 Egresos - {MONTHS[selectedMonth]} {year}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCreateTransaction('EXPENSE')}
                sx={{
                  bgcolor: '#EF4444',
                  '&:hover': {
                    bgcolor: '#DC2626',
                  },
                }}
              >
                Nuevo Egreso
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : expenseTransactions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No hay egresos en {MONTHS[selectedMonth]} {year}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cliente/Empresa</TableCell>
                      <TableCell>Método de Pago</TableCell>
                      <TableCell align="right">ARS</TableCell>
                      <TableCell align="right">USD</TableCell>
                      <TableCell align="right">Cotización</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenseTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{transaction.category.icon}</span>
                            {transaction.category.name}
                          </Box>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.client ? (
                            <Typography variant="body2" color="text.secondary">
                              {transaction.client.company}
                            </Typography>
                          ) : transaction.creditCard ? (
                            <Typography variant="body2" color="text.secondary">
                              💳 {transaction.creditCard.name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getPaymentMethodLabel(transaction.paymentMethod, transaction.bankAccount, transaction.creditCard)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="error.main">
                            {formatCurrency(transaction.amountArs)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="error.dark">
                            {formatUSD(Number(transaction.amountArs) / currentDolarRate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${currentDolarRate.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {transaction.attachmentUrl && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewDocument(transaction.attachmentUrl)}
                              title="Ver documento"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditTransaction(transaction)}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {!transaction.isPlaceholder && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(transaction)}
                              title="Eliminar"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ bgcolor: '#0F172A !important' }}>
                      <TableCell colSpan={5} sx={{ color: 'white', borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="white">TOTAL EGRESOS</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="#EF4444">
                          {formatCurrency(monthExpense)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: 'none' }}>
                        <Typography fontWeight="bold" color="#EF4444">
                          {formatUSD(monthExpense / currentDolarRate)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }} />
                      <TableCell sx={{ borderBottom: 'none' }} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Income Transaction Dialog */}
        <IncomeTransactionDialog
          open={incomeDialogOpen}
          onClose={() => setIncomeDialogOpen(false)}
          onSuccess={handleTransactionSuccess}
          transaction={editingTransaction}
          defaultDate={new Date(year, selectedMonth, 1)}
        />

        {/* Expense Transaction Dialog */}
        <ExpenseTransactionDialog
          open={expenseDialogOpen}
          onClose={() => setExpenseDialogOpen(false)}
          onSuccess={handleTransactionSuccess}
          transaction={editingTransaction}
          defaultDate={new Date(year, selectedMonth, 1)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: '#1E293B',
              color: 'white',
            },
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography color="white">
              ¿Estás seguro de que deseas eliminar esta transacción?
            </Typography>
            {transactionToDelete && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Descripción:</strong> {transactionToDelete.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Monto:</strong> {formatCurrency(transactionToDelete.amountArs)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Document Viewer */}
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          url={documentToView}
          title="Comprobante"
        />

        {/* Recurring Transactions Modal */}
        <RecurringTransactionsModal
          open={recurringModalOpen}
          onClose={() => setRecurringModalOpen(false)}
        />

        {/* Transaction History Modal */}
        <TransactionHistoryModal
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
        />
      </Box>
    </DashboardLayout>
  )
}
