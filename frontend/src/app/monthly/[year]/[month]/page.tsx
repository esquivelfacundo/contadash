'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Search,
  FilterList,
  CheckCircle,
  RadioButtonUnchecked,
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

const MONTH_SLUGS: { [key: string]: number } = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
  'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
  'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
}

const MONTH_SLUG_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

export default function MonthlyPage() {
  const params = useParams()
  const router = useRouter()
  const currentDate = new Date()
  const { showNotification } = useNotificationStore()
  
  // Get year and month from URL params or use current date
  const urlYear = params?.year ? parseInt(params.year as string) : currentDate.getFullYear()
  const urlMonth = params?.month ? MONTH_SLUGS[params.month as string] : currentDate.getMonth()
  
  const [year, setYear] = useState(urlYear)
  const [selectedMonth, setSelectedMonth] = useState(urlMonth ?? currentDate.getMonth())
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
  const [currentDolarRate, setCurrentDolarRate] = useState<number | null>(null)
  const [currentApiDolarRate, setCurrentApiDolarRate] = useState<number | null>(null)
  
  // Estados para filtros
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all')

  // Update URL when year or month changes
  const updateURL = (newYear: number, newMonth: number) => {
    const monthSlug = MONTH_SLUG_NAMES[newMonth]
    router.push(`/monthly/${newYear}/${monthSlug}`)
  }

  // Sync state with URL params
  useEffect(() => {
    if (params?.year && params?.month) {
      const paramYear = parseInt(params.year as string)
      const paramMonth = MONTH_SLUGS[params.month as string]
      if (paramYear !== year) setYear(paramYear)
      if (paramMonth !== undefined && paramMonth !== selectedMonth) setSelectedMonth(paramMonth)
    }
  }, [params])

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
        // No establecer valor por defecto, dejar como null
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
      // Fallback to current rate
      try {
        const rate = await exchangeApi.getDolarBlue()
        setCurrentDolarRate(rate)
      } catch {
        // No establecer valor por defecto, dejar como null
      }
    }
  }

  const loadMonthlyData = async () => {
    try {
      setLoading(true)
      const month = selectedMonth + 1

      // Get transactions for the selected month with credit card placeholders
      const data = await transactionsApi.getMonthlyWithCreditCards(month, year)

      // Filtrar placeholders que ya tienen una transacción real asociada
      // Un placeholder se considera duplicado si existe una transacción real con el mismo creditCardId y fecha
      const filteredTransactions = data.transactions.filter((transaction: any) => {
        if (!transaction.isPlaceholder) {
          return true // Mantener todas las transacciones reales
        }
        
        // Para placeholders, verificar si existe una transacción real con el mismo creditCardId
        const hasDuplicate = data.transactions.some((t: any) => 
          !t.isPlaceholder && 
          t.creditCardId === transaction.creditCardId &&
          new Date(t.date).toDateString() === new Date(transaction.date).toDateString()
        )
        
        return !hasDuplicate // Solo mantener el placeholder si NO hay duplicado
      })

      setMonthlyData(filteredTransactions)

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

  const handleTogglePaid = async (transaction: any) => {
    try {
      await transactionsApi.update(transaction.id, {
        isPaid: !transaction.isPaid
      })
      showNotification(
        transaction.isPaid ? 'Marcado como no pagado' : 'Marcado como pagado',
        'success'
      )
      loadMonthlyData()
    } catch (err) {
      showNotification('Error al actualizar estado de pago', 'error')
    }
  }

  // Separate income and expense transactions
  const allIncomeTransactions = monthlyData.filter(t => t.type === 'INCOME')
  const allExpenseTransactions = monthlyData.filter(t => t.type === 'EXPENSE')
  
  // Función de filtrado
  const applyFilters = (transactions: any[]) => {
    return transactions.filter(t => {
      // Filtro de texto (búsqueda en descripción)
      if (searchText && !t.description?.toLowerCase().includes(searchText.toLowerCase())) {
        return false
      }
      
      // Filtro de categoría
      if (filterCategory !== 'all' && t.categoryId !== filterCategory) {
        return false
      }
      
      // Filtro de cliente (solo para ingresos)
      if (filterClient !== 'all' && t.clientId !== filterClient) {
        return false
      }
      
      // Filtro de método de pago
      if (filterPaymentMethod !== 'all' && t.paymentMethod !== filterPaymentMethod) {
        return false
      }
      
      return true
    })
  }
  
  // Aplicar filtros
  const incomeTransactions = applyFilters(allIncomeTransactions)
  const expenseTransactions = applyFilters(allExpenseTransactions)
  
  // Obtener listas únicas para los filtros
  const uniqueIncomeCategories = Array.from(
    new Map(
      allIncomeTransactions
        .filter(t => t.category)
        .map(t => [t.category.id, t.category])
    ).values()
  )
  
  const uniqueExpenseCategories = Array.from(
    new Map(
      allExpenseTransactions
        .filter(t => t.category)
        .map(t => [t.category.id, t.category])
    ).values()
  )
  
  const uniqueClients = Array.from(
    new Map(
      allIncomeTransactions
        .filter(t => t.client)
        .map(t => [t.client.id, t.client])
    ).values()
  )
  
  const uniquePaymentMethods = Array.from(new Set(monthlyData.map(t => t.paymentMethod).filter(Boolean)))

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

  // Generate year options (current year and 5 years back, plus next year if December)
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const includeNextYear = currentMonth === 11 // December is month 11 (0-indexed)
  const yearCount = includeNextYear ? 7 : 6
  const startYear = includeNextYear ? currentYear + 1 : currentYear
  const yearOptions = Array.from({ length: yearCount }, (_, i) => startYear - i)

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
              onChange={(e) => {
                const newYear = Number(e.target.value)
                setYear(newYear)
                updateURL(newYear, selectedMonth)
              }}
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
                    {formatUSD(yearSummary.income.usd || 0)}
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
                    {formatUSD(yearSummary.expense.usd || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
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
                    {formatUSD(yearSummary.balance.usd || 0)}
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
            onChange={(_, value) => {
              setSelectedMonth(value)
              updateURL(year, value)
            }}
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
                  Cotización Dólar Blue: {currentDolarRate !== null ? `$${currentDolarRate.toFixed(2)}` : 'Cargando...'}
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
                    
                    if (currentDolarRate === null) {
                      return 'Cargando cotización...'
                    }
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthIncome / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthIncome / currentDolarRate)}`
                    }
                  })()}
                </Typography>
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
                    
                    if (currentDolarRate === null) {
                      return 'Cargando cotización...'
                    }
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthExpense / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthExpense / currentDolarRate)}`
                    }
                  })()}
                </Typography>
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
                    
                    if (currentDolarRate === null) {
                      return 'Cargando cotización...'
                    }
                    if (isCurrentOrFutureMonth) {
                      return `Cotización actual: ${formatUSD(monthBalance / currentDolarRate)}`
                    } else {
                      return `Cotización histórica: ${formatUSD(monthBalance / currentDolarRate)}`
                    }
                  })()}
                </Typography>
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
            
            {/* Filtros para Ingresos */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar por descripción..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 250 }}
              />
              
              <TextField
                select
                size="small"
                label="Categoría"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todas</MenuItem>
                {uniqueIncomeCategories.map((cat: any) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                size="small"
                label="Cliente"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                {uniqueClients.map((client: any) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.company || client.name || 'Sin nombre'}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                size="small"
                label="Método de Pago"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="CASH">💵 Efectivo</MenuItem>
                <MenuItem value="MERCADOPAGO">💳 MercadoPago</MenuItem>
                <MenuItem value="BANK_ACCOUNT">🏦 Cuenta Bancaria</MenuItem>
                <MenuItem value="CRYPTO">₿ Criptomoneda</MenuItem>
              </TextField>
              
              {(searchText || filterCategory !== 'all' || filterClient !== 'all' || filterPaymentMethod !== 'all') && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchText('')
                    setFilterCategory('all')
                    setFilterClient('all')
                    setFilterPaymentMethod('all')
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  Limpiar filtros
                </Button>
              )}
              
              <Chip 
                label={`${incomeTransactions.length} de ${allIncomeTransactions.length}`}
                size="small"
                color="primary"
              />
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
                      <TableRow 
                        key={transaction.id}
                        sx={{
                          bgcolor: transaction.isPaid ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          '&:hover': {
                            bgcolor: transaction.isPaid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
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
                            {currentDolarRate !== null ? formatUSD(Number(transaction.amountArs) / currentDolarRate) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {currentDolarRate !== null ? `$${currentDolarRate.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color={transaction.isPaid ? "success" : "default"}
                            onClick={() => handleTogglePaid(transaction)}
                            title={transaction.isPaid ? "Marcar como no pagado" : "Marcar como pagado"}
                          >
                            {transaction.isPaid ? <CheckCircle fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />}
                          </IconButton>
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
                          {currentDolarRate !== null ? formatUSD(monthIncome / currentDolarRate) : '-'}
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
            
            {/* Filtros para Egresos */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar por descripción..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 250 }}
              />
              
              <TextField
                select
                size="small"
                label="Categoría"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todas</MenuItem>
                {uniqueExpenseCategories.map((cat: any) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                size="small"
                label="Método de Pago"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="CASH">💵 Efectivo</MenuItem>
                <MenuItem value="MERCADOPAGO">💳 MercadoPago</MenuItem>
                <MenuItem value="BANK_ACCOUNT">🏦 Cuenta Bancaria</MenuItem>
                <MenuItem value="CRYPTO">₿ Criptomoneda</MenuItem>
              </TextField>
              
              {(searchText || filterCategory !== 'all' || filterPaymentMethod !== 'all') && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchText('')
                    setFilterCategory('all')
                    setFilterPaymentMethod('all')
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  Limpiar filtros
                </Button>
              )}
              
              <Chip 
                label={`${expenseTransactions.length} de ${allExpenseTransactions.length}`}
                size="small"
                color="secondary"
              />
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
                      <TableRow 
                        key={transaction.id}
                        sx={{
                          bgcolor: transaction.isPaid ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                          '&:hover': {
                            bgcolor: transaction.isPaid ? 'rgba(234, 179, 8, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
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
                            {currentDolarRate !== null ? formatUSD(Number(transaction.amountArs) / currentDolarRate) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {currentDolarRate !== null ? `$${currentDolarRate.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color={transaction.isPaid ? "warning" : "default"}
                            onClick={() => handleTogglePaid(transaction)}
                            title={transaction.isPaid ? "Marcar como no pagado" : "Marcar como pagado"}
                          >
                            {transaction.isPaid ? <CheckCircle fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />}
                          </IconButton>
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
                          {currentDolarRate !== null ? formatUSD(monthExpense / currentDolarRate) : '-'}
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
          onSuccess={() => {
            showNotification('Transacción recurrente guardada', 'success')
            loadMonthlyData()
          }}
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
