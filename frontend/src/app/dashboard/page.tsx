'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  keyframes,
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CreditCard,
  Savings,
  ShowChart,
  Receipt,
  AccountBalance,
  Folder,
  People,
  AccountBalanceWallet,
} from '@mui/icons-material'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
import DashboardLayout from '@/components/DashboardLayout'
import SplashScreen from '@/components/SplashScreen'
import { useAuthStore } from '@/lib/store/auth.store'
import { analyticsApi } from '@/lib/api/analytics'
import { categoriesApi } from '@/lib/api/categories'
import { creditCardsApi } from '@/lib/api/credit-cards'
import { clientsApi } from '@/lib/api/clients'
import { bankAccountsApi } from '@/lib/api/bank-accounts'
import { apiClient } from '@/lib/api/client'
import PeriodComparison from '@/components/PeriodComparison'
import ProjectionsChart from '@/components/ProjectionsChart'
import { COLORS } from '@/constants/colors'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [showSplash, setShowSplash] = useState(true)
  const [data, setData] = useState<any>(null)
  const [yearlySummary, setYearlySummary] = useState<any>(null)
  const [categoryData, setCategoryData] = useState<any>(null)
  const [categoryError, setCategoryError] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [selectedCategoryMonth, setSelectedCategoryMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState<any>(null)
  const [showUSD, setShowUSD] = useState(false)
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [cardPage, setCardPage] = useState(0)
  const [transactionPage, setTransactionPage] = useState(0)
  const [categoryPage, setCategoryPage] = useState(0)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [stats, setStats] = useState({
    incomeCategories: 0,
    expenseCategories: 0,
    clients: 0,
    creditCards: 0,
    bankAccounts: 0
  })
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null)
  const gradientAnimation = useRef(0)
  const [gradientOpacity, setGradientOpacity] = useState(1)

  // Manejar el fin del splash screen
  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  // Función para calcular el transform de cada tarjeta basado en hover
  const getCardTransform = (cardIndex: number) => {
    const baseTransform = `translateY(${cardIndex * 5}px)`
    
    if (hoveredCardIndex === null) {
      return baseTransform
    }

    // Si esta tarjeta está en hover, mantener posición
    if (cardIndex === hoveredCardIndex) {
      return baseTransform
    }

    // Solo mover las tarjetas que están por debajo (mayor z-index) de la que tiene hover
    // para crear espacio y poder ver la información completa
    if (cardIndex > hoveredCardIndex) {
      // Mover hacia abajo las tarjetas que están encima visualmente - suficiente para ver número de tarjeta
      return `translateY(${cardIndex * 5 + 55}px)`
    }

    // Las tarjetas que están por debajo (menor z-index) no se mueven
    return baseTransform
  }

  const loadStats = async () => {
    try {
      // Cargar categorías
      const categories = await categoriesApi.getAll()
      const incomeCategories = categories.filter((c: any) => c.type === 'INCOME').length
      const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE').length

      // Cargar clientes
      const clients = await clientsApi.getAll()
      const activeClients = clients.filter((c: any) => c.active).length

      // Cargar tarjetas de crédito
      const creditCards = await creditCardsApi.getAll()
      const activeCards = creditCards.filter((c: any) => c.isActive).length

      // Cargar cuentas bancarias
      const bankAccounts = await bankAccountsApi.getAll()
      const activeBankAccounts = bankAccounts.filter((b: any) => b.isActive).length

      setStats({
        incomeCategories,
        expenseCategories,
        clients: activeClients,
        creditCards: activeCards,
        bankAccounts: activeBankAccounts
      })
    } catch (err) {
    }
  }

  // Carga inicial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadStats(),
          loadDashboard(),
          loadYearlySummary(),
          loadCategoryData(),
          loadCreditCards()
        ])
      } catch (error) {
      }
    }
    loadInitialData()
    
    // Animación del gradiente
    const interval = setInterval(() => {
      gradientAnimation.current = (gradientAnimation.current + 0.01) % 2
      const opacity = gradientAnimation.current <= 1 
        ? 1 - (gradientAnimation.current * 0.3)
        : 0.7 + ((gradientAnimation.current - 1) * 0.3)
      setGradientOpacity(opacity)
    }, 50)
    
    return () => clearInterval(interval)
  }, [])

  // Cargar datos de categorías cuando cambien los filtros (sin recargar página)
  useEffect(() => {
    if (!loading) {
      loadCategoryData()
    }
  }, [categoryType, selectedCategoryMonth, selectedYear])

  // Cargar datos de tarjetas cuando cambien los filtros (sin recargar página)
  useEffect(() => {
    if (!loading) {
      loadCreditCards()
    }
  }, [selectedCategoryMonth, selectedYear])

  // Resetear páginas cuando cambien los filtros
  useEffect(() => {
    setCardPage(0)
    setTransactionPage(0)
    setCategoryPage(0)
  }, [selectedYear, selectedCategoryMonth, categoryType])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await analyticsApi.getDashboard()
      setData(response)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadCreditCards = async () => {
    try {
      setCardsLoading(true)
      // Cargar tarjetas de crédito
      const cardsResponse = await creditCardsApi.getAll()
      
      // Para cada tarjeta, obtener consumos del mes/año seleccionado
      const cardsWithConsumption = await Promise.all(
        cardsResponse.map(async (card: any) => {
          try {
            // Obtener TODAS las transacciones del mes/año seleccionado
            const transactionsResponse = await apiClient.get('/transactions', {
              params: {
                month: selectedCategoryMonth,
                year: selectedYear
              }
            })
            
            const allTransactions = transactionsResponse.data.transactions || transactionsResponse.data || []
            
            // Filtrar solo las transacciones de esta tarjeta específica y que sean EXPENSE
            const cardTransactions = allTransactions.filter((t: any) => 
              t.creditCardId === card.id && t.type === 'EXPENSE'
            )
            
            const monthlyConsumption = cardTransactions.reduce((sum: number, t: any) => 
              sum + Math.abs(Number(t.amountArs) || 0), 0)
            
            return {
              ...card,
              monthlyConsumption
            }
          } catch (err) {
            return {
              ...card,
              monthlyConsumption: 0
            }
          }
        })
      )
      
      // Ordenar por consumo mensual (mayor a menor)
      const sortedCards = cardsWithConsumption.sort((a, b) => 
        (b.monthlyConsumption || 0) - (a.monthlyConsumption || 0)
      )
      
      setCreditCards(sortedCards)
    } catch (err) {
      setCreditCards([])
    } finally {
      setCardsLoading(false)
    }
  }

  const loadYearlySummary = async () => {
    try {
      const response = await apiClient.get(`/analytics/yearly-summary?year=${selectedYear}`)
      setYearlySummary(response.data)
    } catch (err) {
    }
  }

  // ============================================
  // GRÁFICO DE EVOLUCIÓN MENSUAL - RECONSTRUIDO
  // ============================================
  
  /**
   * Construye los datos del gráfico de evolución mensual
   * Extrae datos de yearlySummary.monthlyBreakdown y los formatea para Chart.js
   * 
   * @returns Objeto con labels y datasets para Chart.js
   */
  const buildChartData = useCallback(() => {
    // La estructura real es yearlySummary.months, NO monthlyBreakdown
    if (!yearlySummary?.months) {
      return null
    }

    const monthlyBreakdown = yearlySummary.months
    const labels = MONTHS
    const incomeData: number[] = []
    const expenseData: number[] = []
    const balanceData: number[] = []

    // Procesar cada mes (1-12)
    for (let month = 1; month <= 12; month++) {
      const monthData = monthlyBreakdown.find((m: any) => m.month === month)
      
      if (monthData) {
        // Extraer valores según la moneda seleccionada y forzar conversión a número
        const income = showUSD 
          ? parseFloat(monthData.income?.usd || 0)
          : parseFloat(monthData.income?.ars || 0)
        const expense = showUSD 
          ? parseFloat(monthData.expense?.usd || 0)
          : parseFloat(monthData.expense?.ars || 0)
        
        incomeData.push(income)
        expenseData.push(expense)
        balanceData.push(income - expense)
      } else {
        // Mes sin datos
        incomeData.push(0)
        expenseData.push(0)
        balanceData.push(0)
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: COLORS.income.main,
          backgroundColor: `${COLORS.income.main}20`,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.income.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
        },
        {
          label: 'Egresos',
          data: expenseData,
          borderColor: COLORS.expense.main,
          backgroundColor: `${COLORS.expense.main}20`,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.expense.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
        },
        {
          label: 'Balance',
          data: balanceData,
          borderColor: COLORS.balance.main,
          backgroundColor: `${COLORS.balance.main}20`,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.balance.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
        },
      ],
    }
  }, [yearlySummary, showUSD])

  /**
   * Efecto para actualizar chartData cuando cambien los datos o la moneda
   */
  useEffect(() => {
    if (!yearlySummary?.months) {
      setChartData(null)
      return
    }
    
    // Esperar a que el componente esté montado
    const timer = setTimeout(() => {
      const data = buildChartData()
      if (data) {
        setChartData(data)
      }
    }, 200)
    
    return () => clearTimeout(timer)
  }, [yearlySummary, showUSD])

  const loadCategoryData = async () => {
    try {
      setCategoryLoading(true)
      setCategoryError('')
      const type = categoryType
      
      // Obtener TODAS las categorías (sin filtro de tipo en la API)
      const categoriesResponse = await categoriesApi.getAll()
      
      if (!Array.isArray(categoriesResponse)) {
        throw new Error('La respuesta de categorías no es un array')
      }
      
      const allCategories = categoriesResponse.filter((cat: any) => cat.type === type)
      
      let transactions = []
      let filteredTransactions = []
      let transactionTotals: Record<string, any> = {}
      
      try {
        // Intentar obtener transacciones del mes seleccionado
        const transactionsResponse = await apiClient.get('/transactions', {
          params: {
            month: selectedCategoryMonth,
            year: selectedYear
          }
        })
        
        transactions = transactionsResponse.data.transactions || transactionsResponse.data || []
        
        // Filtrar transacciones por tipo
        filteredTransactions = transactions.filter((t: any) => t.type === type)
        
        // Crear un mapa de totales por categoría desde las transacciones
        transactionTotals = filteredTransactions.reduce((acc: Record<string, any>, transaction: any) => {
          const categoryId = transaction.category?.id || 'no-category'
          
          if (!acc[categoryId]) {
            acc[categoryId] = {
              total: 0,
              count: 0
            }
          }
          
          acc[categoryId].total += Number(transaction.amountArs) || 0
          acc[categoryId].count += 1
          
          return acc
        }, {})
      } catch (transactionError) {
        // Si no se pueden cargar las transacciones, al menos mostrar las categorías
      }
      
      // Combinar todas las categorías con sus totales (incluso si es $0)
      const categoryArray = allCategories.map((category: any) => {
        const totals = transactionTotals[category.id] || { total: 0, count: 0 }
        
        return {
          id: category.id,
          name: category.name,
          total: totals.total,
          count: totals.count,
          color: category.color || (type === 'INCOME' ? '#10B981' : '#EF4444')
        }
      })
      
      // Ordenar por total descendente (las que tienen dinero primero, luego las de $0)
      const sortedCategories = categoryArray.sort((a: any, b: any) => {
        if (b.total !== a.total) {
          return b.total - a.total // Por monto descendente
        }
        return a.name.localeCompare(b.name) // Por nombre alfabético si tienen el mismo monto
      })
      
      
      setCategoryData(sortedCategories)
    } catch (err: any) {
      setCategoryError(`Error al cargar categorías: ${err.message || 'Error desconocido'}`)
      setCategoryData([])
    } finally {
      setCategoryLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Mostrar splash screen al inicio
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh' }}>
        {/* Card de Bienvenida con Gradiente Animado */}
        <Card sx={{ bgcolor: '#1E293B', border: 'none', mb: 3, overflow: 'hidden', position: 'relative' }}>
          {/* Gradiente animado de fondo */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(245, 158, 11, 0.2) 100%)',
              opacity: gradientOpacity,
              transition: 'opacity 0.3s ease',
              zIndex: 0,
            }}
          />
          
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3}>
              {/* Columna Izquierda - Texto y Métricas */}
              <Grid item xs={12} md={8}>
                <Typography variant="h4" color="white" sx={{ mb: 1, fontWeight: 600 }}>
                  <Box component="span" sx={{ fontWeight: 400 }}>Hola, </Box>
                  {user?.name || 'Usuario Demo'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Aquí tienes un resumen completo de tus finanzas. Revisa tus ingresos, egresos y el balance general de tu negocio.
                </Typography>
                
                {/* Métricas rápidas */}
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={2.4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#10B981">
                        {stats.incomeCategories}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Categorías de Ingresos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#EF4444">
                        {stats.expenseCategories}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Categorías de Egresos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#3B82F6">
                        {stats.clients}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Clientes Activos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#F59E0B">
                        {stats.creditCards}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tarjetas de Crédito
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#8B5CF6">
                        {stats.bankAccounts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cuentas Bancarias
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Columna Derecha - Botones de Acceso Rápido */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <Typography 
                    variant="caption" 
                    color="white" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 0.75,
                      fontSize: '0.65rem',
                      letterSpacing: '0.5px',
                      textAlign: 'left'
                    }}
                  >
                    Administrá tu Dash
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: { xs: 'space-around', md: 'center' },
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover .icon-box': {
                          borderColor: '#10B981',
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                        }
                      }}
                      onClick={() => window.location.href = '/settings?tab=categories'}
                    >
                      <Box 
                        className="icon-box"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          transition: 'all 0.2s',
                        }}
                      >
                        <Folder sx={{ fontSize: 22, color: 'white' }} />
                      </Box>
                      <Typography variant="caption" color="white" sx={{ fontSize: '0.625rem', textAlign: 'center' }}>
                        Categorías
                      </Typography>
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover .icon-box': {
                          borderColor: '#3B82F6',
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                        }
                      }}
                      onClick={() => window.location.href = '/settings?tab=clients'}
                    >
                      <Box 
                        className="icon-box"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          transition: 'all 0.2s',
                        }}
                      >
                        <People sx={{ fontSize: 22, color: 'white' }} />
                      </Box>
                      <Typography variant="caption" color="white" sx={{ fontSize: '0.625rem', textAlign: 'center' }}>
                        Clientes
                      </Typography>
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover .icon-box': {
                          borderColor: '#F59E0B',
                          bgcolor: 'rgba(245, 158, 11, 0.1)',
                        }
                      }}
                      onClick={() => window.location.href = '/settings?tab=creditCards'}
                    >
                      <Box 
                        className="icon-box"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          transition: 'all 0.2s',
                        }}
                      >
                        <CreditCard sx={{ fontSize: 22, color: 'white' }} />
                      </Box>
                      <Typography variant="caption" color="white" sx={{ fontSize: '0.625rem', textAlign: 'center' }}>
                        Tarjetas
                      </Typography>
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover .icon-box': {
                          borderColor: '#8B5CF6',
                          bgcolor: 'rgba(139, 92, 246, 0.1)',
                        }
                      }}
                      onClick={() => window.location.href = '/settings?tab=bankAccounts'}
                    >
                      <Box 
                        className="icon-box"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          transition: 'all 0.2s',
                        }}
                      >
                        <AccountBalanceWallet sx={{ fontSize: 22, color: 'white' }} />
                      </Box>
                      <Typography variant="caption" color="white" sx={{ fontSize: '0.625rem', textAlign: 'center' }}>
                        Bancos
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Cards de métricas principales con gradientes */}
        <Grid container spacing={3} sx={{ mb: 0 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Ingresos en {MONTHS[currentMonth - 1]}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {data?.currentMonth ? formatCurrency(data.currentMonth.income.ars) : '$0'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <TrendingUp sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        +{data?.previousMonth ? 
                          getPercentageChange(data.currentMonth?.income.ars || 0, data.previousMonth.income.ars).toFixed(1) 
                          : '0'}%
                      </Typography>
                    </Box>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Egresos en {MONTHS[currentMonth - 1]}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {data?.currentMonth ? formatCurrency(data.currentMonth.expense.ars) : '$0'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <TrendingDown sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        +{data?.previousMonth ? 
                          getPercentageChange(data.currentMonth?.expense.ars || 0, data.previousMonth.expense.ars).toFixed(1) 
                          : '0'}%
                      </Typography>
                    </Box>
                  </Box>
                  <CreditCard sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Balance en {MONTHS[currentMonth - 1]}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {data?.currentMonth ? formatCurrency(data.currentMonth.balance.ars) : '$0'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <ShowChart sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        +{data?.currentMonth && data.currentMonth.income.ars > 0 ? 
                          ((data.currentMonth.balance.ars / data.currentMonth.income.ars) * 100).toFixed(1) 
                          : '0'}%
                      </Typography>
                    </Box>
                  </Box>
                  <Savings sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Transacciones
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {data?.recentTransactions?.length || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <TrendingUp sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        +0.8%
                      </Typography>
                    </Box>
                  </Box>
                  <Receipt sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sección: Transacciones Recientes (1/3) + Categorías y Tarjetas (2/3) */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Transacciones Recientes */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none', height: 500 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
                <Box sx={{ bgcolor: '#0F172A', px: 3, py: 3, mb: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color="white">
                      Transacciones Recientes
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ color: '#10B981', textTransform: 'none' }}
                    >
                      Ver todas →
                    </Button>
                  </Box>
                </Box>
                
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: 3, py: 2 }}>
                    {data.recentTransactions.slice(transactionPage * 5, (transactionPage + 1) * 5).map((transaction: any, index: number) => {
                      const transactionType = transaction.type || 'EXPENSE';
                      const amount = transaction.amountArs || 0;
                      const description = transaction.description || 'Sin descripción';
                      const categoryName = transaction.category?.name || 'Sin categoría';
                      const date = transaction.date ? new Date(transaction.date).toLocaleDateString('es-AR') : 'Sin fecha';
                      
                      return (
                        <Box 
                          key={transaction.id || index} 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="space-between" 
                          py={2}
                          sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: transactionType === 'INCOME' ? '#10B981' : '#EF4444',
                                width: 32,
                                height: 32
                              }}
                            >
                              {transactionType === 'INCOME' ? 
                                <TrendingUp fontSize="small" /> : 
                                <TrendingDown fontSize="small" />
                              }
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium" color="white">
                                {description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {categoryName} • {date}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={transactionType === 'INCOME' ? '#10B981' : '#EF4444'}
                          >
                            {transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                          </Typography>
                        </Box>
                      );
                    })}
                    
                    {/* Paginación */}
                    {data?.recentTransactions && data.recentTransactions.length > 5 && (
                      <Box display="flex" justifyContent="center" mt={2}>
                        <Button
                          size="small"
                          disabled={transactionPage === 0}
                          onClick={() => setTransactionPage(transactionPage - 1)}
                          sx={{ color: '#10B981', minWidth: 'auto', mr: 1 }}
                        >
                          ←
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mx: 2, alignSelf: 'center' }}>
                          {transactionPage + 1} de {Math.ceil(data.recentTransactions.length / 5)}
                        </Typography>
                        <Button
                          size="small"
                          disabled={transactionPage >= Math.ceil(data.recentTransactions.length / 5) - 1}
                          onClick={() => setTransactionPage(transactionPage + 1)}
                          sx={{ color: '#10B981', minWidth: 'auto', ml: 1 }}
                        >
                          →
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ px: 3, py: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" textAlign="center">
                      No hay transacciones recientes
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Categorías por Mes y Tarjetas de Crédito */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none', height: 500 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Header unificado con filtros */}
                <Box sx={{ bgcolor: '#0F172A', px: 3, py: 3, mb: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color="white">
                      Categorías y Tarjetas de Crédito
                    </Typography>
                    <Box display="flex" gap={1}>
                      <TextField
                        select
                        size="small"
                        value={selectedCategoryMonth}
                        onChange={(e) => setSelectedCategoryMonth(Number(e.target.value))}
                        sx={{ 
                          minWidth: 100,
                          '& .MuiOutlinedInput-root': {
                            height: '32px',
                            fontSize: '0.75rem',
                          }
                        }}
                      >
                        {MONTHS.map((month, index) => (
                          <MenuItem key={index + 1} value={index + 1}>
                            {month}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        sx={{ 
                          minWidth: 80,
                          '& .MuiOutlinedInput-root': {
                            height: '32px',
                            fontSize: '0.75rem',
                          }
                        }}
                      >
                        {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>
                </Box>

                {/* Grid interno para dividir en 2 columnas */}
                <Grid container spacing={2} sx={{ position: 'relative', flexGrow: 1 }}>
                  {/* Categorías por Mes (1/2) */}
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ px: 3, py: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="white">
                          Categorías por Mes
                        </Typography>
                        
                        {/* Select para tipo de categoría */}
                        <TextField
                          select
                          size="small"
                          value={categoryType}
                          onChange={(e) => setCategoryType(e.target.value as 'INCOME' | 'EXPENSE')}
                          sx={{
                            minWidth: 100,
                            '& .MuiOutlinedInput-root': {
                              height: '32px',
                              fontSize: '0.75rem',
                            },
                          }}
                        >
                          <MenuItem value="INCOME">Ingresos</MenuItem>
                          <MenuItem value="EXPENSE">Egresos</MenuItem>
                        </TextField>
                      </Box>
                      <Box sx={{ px: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

                      {/* Lista de Categorías */}
                      <Box sx={{ opacity: categoryLoading ? 0.5 : 1, transition: 'opacity 0.3s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {categoryLoading && (
                          <Box display="flex" justifyContent="center" mb={2}>
                            <CircularProgress size={16} sx={{ color: '#10B981' }} />
                          </Box>
                        )}
                        {categoryData ? (
                        categoryData.length > 0 ? (
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            {categoryData.slice(categoryPage * 5, (categoryPage + 1) * 5).map((category: any, index: number) => (
                            <Box 
                              key={category.id || index}
                              display="flex" 
                              justifyContent="space-between" 
                              alignItems="center" 
                              py={1.5}
                              sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: category.color || (categoryType === 'INCOME' ? '#10B981' : '#EF4444'),
                                  }}
                                />
                                <Typography variant="body2" color="white" fontWeight="medium" fontSize="0.8rem">
                                  {category.name}
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold" 
                                  fontSize="0.8rem"
                                  color={category.total > 0 ? (categoryType === 'INCOME' ? '#10B981' : '#EF4444') : '#6B7280'}
                                >
                                  {formatCurrency(category.total)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                  {category.count} trans.
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                          
                          {/* Spacer para empujar paginación hacia abajo */}
                          <Box sx={{ flexGrow: 1 }} />
                          
                          {/* Paginación */}
                          {categoryData.length > 5 && (
                            <Box display="flex" justifyContent="center" mt={2}>
                              <Button
                                size="small"
                                disabled={categoryPage === 0}
                                onClick={() => setCategoryPage(categoryPage - 1)}
                                sx={{ color: '#10B981', minWidth: 'auto', mr: 1 }}
                              >
                                ←
                              </Button>
                              <Typography variant="caption" color="text.secondary" sx={{ mx: 2, alignSelf: 'center' }}>
                                {categoryPage + 1} de {Math.ceil(categoryData.length / 5)}
                              </Typography>
                              <Button
                                size="small"
                                disabled={categoryPage >= Math.ceil(categoryData.length / 5) - 1}
                                onClick={() => setCategoryPage(categoryPage + 1)}
                                sx={{ color: '#10B981', minWidth: 'auto', ml: 1 }}
                              >
                                →
                              </Button>
                            </Box>
                          )}
                          </Box>
                        ) : (
                          <Box textAlign="center" py={4}>
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              No hay categorías de {categoryType === 'INCOME' ? 'ingresos' : 'egresos'}
                            </Typography>
                          </Box>
                        )
                      ) : categoryError ? (
                        <Box textAlign="center" py={4}>
                          <Typography variant="body2" color="#EF4444" sx={{ mb: 1 }} fontSize="0.8rem">
                            {categoryError}
                          </Typography>
                          <Button 
                            size="small" 
                            onClick={loadCategoryData}
                            sx={{ color: '#10B981', textTransform: 'none' }}
                          >
                            Reintentar
                          </Button>
                        </Box>
                      ) : (
                        <Box textAlign="center" py={4}>
                          <CircularProgress size={20} sx={{ color: '#10B981' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} fontSize="0.8rem">
                            Cargando...
                          </Typography>
                        </Box>
                      )}
                      </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Divisor */}
                  <Grid item xs={12} sm={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
                  </Grid>
                  
                  {/* Divisor vertical para desktop */}
                  <Box 
                    sx={{ 
                      display: { xs: 'none', sm: 'block' },
                      position: 'absolute',
                      left: '50%',
                      top: '60px',
                      bottom: '20px',
                      width: '1px',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateX(-50%)'
                    }} 
                  />

                  {/* Tarjetas de Crédito (1/2) */}
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ px: 3, py: 2, mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="white">
                          Tarjetas de Crédito
                        </Typography>
                      </Box>
                      
                      <Box sx={{ px: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      
                      <Box sx={{ opacity: cardsLoading ? 0.5 : 1, transition: 'opacity 0.3s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {cardsLoading && (
                          <Box display="flex" justifyContent="center" mb={2}>
                            <CircularProgress size={16} sx={{ color: '#10B981' }} />
                          </Box>
                        )}
                        {creditCards && creditCards.length > 0 ? (
                        <>
                        <Box sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          position: 'relative',
                          minHeight: 360,
                          height: 360,
                        }}>
                          {creditCards.slice(0, 4).map((card: any, index: number) => {
                            // Función para obtener estilos específicos de cada banco (EXACTA de configuración)
                            const getBankCardStyle = (bank: string) => {
                              const styles: Record<string, any> = {
                                'banco-nacion': {
                                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                                  logo: 'BNA',
                                  pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                                },
                                'banco-provincia': {
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
                                  logo: 'BPBA',
                                  pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,255,255,0.1) 15px, rgba(255,255,255,0.1) 30px)',
                                },
                                'banco-ciudad': {
                                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
                                  logo: 'CIUDAD',
                                  pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                },
                                'santander': {
                                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                                  logo: 'SANTANDER',
                                  pattern: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                                },
                                'bbva': {
                                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                                  logo: 'BBVA',
                                  pattern: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
                                },
                                'galicia': {
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                                  logo: 'GALICIA',
                                  pattern: 'radial-gradient(ellipse at top, rgba(255,255,255,0.1), transparent)',
                                },
                                'macro': {
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
                                  logo: 'MACRO',
                                  pattern: 'repeating-linear-gradient(135deg, transparent, transparent 12px, rgba(255,255,255,0.1) 12px, rgba(255,255,255,0.1) 24px)',
                                },
                                'american-express': {
                                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFA500 100%)',
                                  logo: 'AMERICAN EXPRESS',
                                  pattern: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)',
                                  textColor: '#8B4513',
                                },
                                'supervielle': {
                                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
                                  logo: 'SUPERVIELLE',
                                  pattern: 'linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%)',
                                },
                                'icbc': {
                                  background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
                                  logo: 'ICBC',
                                  pattern: 'repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)',
                                },
                                'hsbc': {
                                  background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 50%, #dc2626 100%)',
                                  logo: 'HSBC',
                                  pattern: 'linear-gradient(45deg, rgba(220,38,38,0.1) 25%, transparent 25%, transparent 75%, rgba(220,38,38,0.1) 75%)',
                                  textColor: '#dc2626',
                                },
                                'credicoop': {
                                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
                                  logo: 'CREDICOOP',
                                  pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                },
                                'patagonia': {
                                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                                  logo: 'PATAGONIA',
                                  pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
                                },
                                'frances': {
                                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #dbeafe 100%)',
                                  logo: 'FRANCÉS',
                                  pattern: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                                },
                                'itau': {
                                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                                  logo: 'ITAÚ',
                                  pattern: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
                                }
                              }
                              return styles[bank] || {
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
                                logo: 'BANCO',
                                pattern: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
                              }
                            }
                            
                            const bankStyle = getBankCardStyle(card.bank || 'otro')
                            
                            return (
                              <Card
                                key={card.id || index}
                                className="wallet-card"
                                data-index={index}
                                onMouseEnter={() => setHoveredCardIndex(index)}
                                onMouseLeave={() => setHoveredCardIndex(null)}
                                sx={{
                                  position: 'absolute',
                                  top: index * 40, // Espacio suficiente para ver la primera línea (banco + monto)
                                  left: 0,
                                  right: 0,
                                  height: 120,
                                  background: bankStyle.background,
                                  color: bankStyle.textColor || 'white',
                                  border: 'none',
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  zIndex: index + 1, // Mantener z-index natural del apilamiento
                                  transform: getCardTransform(index), // Usar función dinámica
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  cursor: 'pointer',
                                  boxShadow: hoveredCardIndex === index 
                                    ? '0 20px 60px rgba(0,0,0,0.4)' 
                                    : '0 8px 32px rgba(0,0,0,0.3)',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: bankStyle.pattern,
                                    opacity: 0.3,
                                    zIndex: 1,
                                  }
                                }}
                              >
                                <CardContent sx={{ 
                                  position: 'relative', 
                                  zIndex: 2, 
                                  height: '100%', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  p: 2.5, 
                                  '&:last-child': { pb: 2.5 } 
                                }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                                    <Box 
                                      sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        px: 1.5,
                                        py: 0.8,
                                        borderRadius: 1.5,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(10px)'
                                      }}
                                    >
                                      <Typography 
                                        variant="caption" 
                                        fontWeight="bold" 
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          letterSpacing: 0.8,
                                          color: bankStyle.textColor || 'white'
                                        }}
                                      >
                                        {bankStyle.logo}
                                      </Typography>
                                    </Box>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight="bold"
                                      sx={{ 
                                        color: bankStyle.textColor || 'white',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                      }}
                                    >
                                      {formatCurrency(card.monthlyConsumption)}
                                    </Typography>
                                  </Box>
                                  
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="600" 
                                    sx={{ 
                                      mb: 1,
                                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}
                                  >
                                    {card.name}
                                  </Typography>
                                  
                                  <Typography
                                    variant="body2"
                                    fontWeight="500"
                                    sx={{ 
                                      letterSpacing: 2, 
                                      opacity: 0.95,
                                      fontFamily: 'monospace',
                                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}
                                  >
                                    •••• •••• •••• {card.lastFourDigits}
                                  </Typography>
                                </CardContent>
                              </Card>
                            )
                          })}
                          
                          {/* Indicador de más tarjetas */}
                          {creditCards.length > 4 && (
                            <Box 
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10,
                                bgcolor: 'rgba(15, 23, 42, 0.9)',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#10B981',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              >
                                +{creditCards.length - 4} tarjetas más
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        </>
                      ) : (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          No hay tarjetas de crédito configuradas
                        </Typography>
                      )}
                      </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Resumen Anual */}
        <Card sx={{ bgcolor: '#1E293B', border: 'none', mb: 3, mt: 0 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" color="white">
                📊 Resumen Anual {selectedYear}
              </Typography>
              <TextField
                select
                size="small"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                sx={{ minWidth: 120 }}
              >
                {Array.from({ length: 6 }, (_, i) => currentYear - i).map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Gráfico de Evolución Anual */}
            <Box sx={{ mb: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" color="white" fontWeight="bold">
                    Evolución Mensual {selectedYear}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresos, egresos y balance por mes
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showUSD}
                      onChange={(e) => setShowUSD(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10B981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="white">
                      {showUSD ? 'USD' : 'ARS'}
                    </Typography>
                  }
                />
              </Box>
              
              {chartData && chartData.datasets && chartData.datasets[0]?.data?.length > 0 ? (
                <Box 
                  sx={{ 
                    height: 400,
                    width: '100%',
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          align: 'center',
                          labels: {
                            color: 'white',
                            font: {
                              size: 13,
                              weight: 'bold',
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: '#10B981',
                          borderWidth: 2,
                          cornerRadius: 12,
                          padding: 16,
                          titleFont: {
                            size: 14,
                            weight: 'bold',
                          },
                          bodyFont: {
                            size: 13,
                          },
                          displayColors: true,
                          callbacks: {
                            title: function(context) {
                              return `${context[0].label} ${selectedYear}`;
                            },
                            label: function(context) {
                              const value = context.parsed.y;
                              const currency = showUSD ? 'USD' : 'ARS';
                              const formatter = new Intl.NumberFormat(showUSD ? 'en-US' : 'es-AR', {
                                style: 'currency',
                                currency: currency,
                                minimumFractionDigits: 0,
                              });
                              return `${context.dataset.label}: ${formatter.format(value || 0)}`;
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            color: '#94A3B8',
                            font: {
                              size: 11,
                            },
                          },
                        },
                        y: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            color: '#94A3B8',
                            font: {
                              size: 11,
                            },
                            callback: function(value: any) {
                              return new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: showUSD ? 'USD' : 'ARS',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(value);
                            },
                          },
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      elements: {
                        point: {
                          hoverBorderWidth: 3,
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  sx={{ 
                    height: 380, 
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <Box textAlign="center">
                    <CircularProgress 
                      sx={{ 
                        color: '#10B981',
                        mb: 2,
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        }
                      }} 
                      size={40}
                      thickness={4}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Cargando gráfico...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {yearlySummary ? (
              <>
                {/* Resumen del año - Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card 
                      sx={{ 
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Ingresos Totales
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatCurrency(yearlySummary.totals.income.ars)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <TrendingUp sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                {yearlySummary.totals.income.count} transacciones
                              </Typography>
                            </Box>
                          </Box>
                          <TrendingUp sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card 
                      sx={{ 
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Egresos Totales
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatCurrency(yearlySummary.totals.expense.ars)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <TrendingDown sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                {yearlySummary.totals.expense.count} transacciones
                              </Typography>
                            </Box>
                          </Box>
                          <TrendingDown sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card 
                      sx={{ 
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Balance Total
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatCurrency(yearlySummary.totals.balance.ars)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <ShowChart sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                Año {selectedYear}
                              </Typography>
                            </Box>
                          </Box>
                          <AccountBalance sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Tabla mensual */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Mes</strong></TableCell>
                        <TableCell align="right"><strong>Cotización</strong></TableCell>
                        <TableCell align="right"><strong>Ingresos (ARS)</strong></TableCell>
                        <TableCell align="right"><strong>Ingresos (USD)</strong></TableCell>
                        <TableCell align="right"><strong>Egresos (ARS)</strong></TableCell>
                        <TableCell align="right"><strong>Egresos (USD)</strong></TableCell>
                        <TableCell align="right"><strong>Balance (ARS)</strong></TableCell>
                        <TableCell align="right"><strong>Balance (USD)</strong></TableCell>
                        <TableCell align="right"><strong>PnL (%)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearlySummary.months.map((month: any) => {
                        const profitMargin = month.income.ars > 0 
                          ? ((month.balance.ars / month.income.ars) * 100)
                          : 0
                        
                        return (
                          <TableRow key={month.month} hover>
                            <TableCell>{month.monthName}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                ${month.exchangeRate?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#10B981" fontWeight="medium">
                                {formatCurrency(month.income.ars)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#059669">
                                ${month.income.usd?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#EF4444" fontWeight="medium">
                                {formatCurrency(month.expense.ars)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#DC2626">
                                ${month.expense.usd?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                color={month.balance.ars >= 0 ? '#3B82F6' : '#EF4444'}
                                fontWeight="bold"
                              >
                                {formatCurrency(month.balance.ars)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                color={month.balance.usd >= 0 ? '#2563EB' : '#DC2626'}
                              >
                                ${month.balance.usd?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${profitMargin.toFixed(1)}%`}
                                size="small"
                                sx={{
                                  bgcolor: profitMargin >= 0 ? '#10B981' : '#EF4444',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {/* Totals Row */}
                      <TableRow sx={{ bgcolor: '#0F172A' }}>
                        <TableCell><strong>TOTALES</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            ${(() => {
                              const validRates = yearlySummary.months
                                .map((m: any) => m.exchangeRate)
                                .filter((rate: any) => rate && rate > 0);
                              const avgRate = validRates.length > 0 
                                ? validRates.reduce((sum: number, rate: number) => sum + rate, 0) / validRates.length
                                : 0;
                              return avgRate.toFixed(2);
                            })()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#10B981" fontWeight="bold">
                            {formatCurrency(yearlySummary.totals.income.ars)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#059669" fontWeight="bold">
                            ${yearlySummary.totals.income.usd?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#EF4444" fontWeight="bold">
                            {formatCurrency(yearlySummary.totals.expense.ars)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#DC2626" fontWeight="bold">
                            ${yearlySummary.totals.expense.usd?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            color={yearlySummary.totals.balance.ars >= 0 ? '#3B82F6' : '#EF4444'}
                            fontWeight="bold"
                          >
                            {formatCurrency(yearlySummary.totals.balance.ars)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            color={yearlySummary.totals.balance.usd >= 0 ? '#2563EB' : '#DC2626'}
                            fontWeight="bold"
                          >
                            ${yearlySummary.totals.balance.usd?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${((yearlySummary.totals.balance.ars / yearlySummary.totals.income.ars) * 100).toFixed(1)}%`}
                            size="small"
                            sx={{
                              bgcolor: yearlySummary.totals.balance.ars >= 0 ? '#10B981' : '#EF4444',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <CircularProgress sx={{ color: '#10B981' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Cargando resumen anual...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comparación de Períodos */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <PeriodComparison />
          </Grid>

          {/* Proyecciones Financieras */}
          <Grid item xs={12}>
            <ProjectionsChart defaultMonths={3} />
            
            {/* Explicación del Modelo de Proyecciones */}
            <Box sx={{ mt: 2, px: 3, py: 2, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', lineHeight: 1.6, display: 'block' }}>
                <strong style={{ color: '#10B981' }}>📊 Cómo funciona el modelo de proyecciones:</strong><br />
                El sistema analiza tus transacciones históricas de los últimos 6 meses para generar proyecciones financieras precisas. 
                Para los <strong>ingresos</strong>, calcula el promedio mensual de tus entradas de dinero, identificando patrones recurrentes y estacionalidad. 
                Para los <strong>egresos</strong>, además del promedio histórico, incorpora tus gastos recurrentes configurados (suscripciones, servicios, etc.) 
                y los vencimientos de tarjetas de crédito próximos. El <strong>balance proyectado</strong> se obtiene restando los egresos estimados de los ingresos proyectados. 
                Las proyecciones incluyen un margen de confianza del 85%, representado por las áreas sombreadas en el gráfico, que indica el rango probable 
                de variación basado en la volatilidad histórica de tus finanzas. Este modelo se actualiza automáticamente cada vez que registras nuevas transacciones, 
                mejorando su precisión con el tiempo. Puedes ajustar el período de proyección (1-12 meses) para planificar a corto o largo plazo.
              </Typography>
            </Box>
          </Grid>
        </Grid>

      </Box>
    </DashboardLayout>
  )
}
