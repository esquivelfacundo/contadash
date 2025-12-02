'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning,
  FileDownload,
  Refresh,
  FilterList,
  ShowChart,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
} from '@mui/icons-material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import DashboardLayout from '@/components/DashboardLayout'
import { apiClient } from '@/lib/api/client'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'
import { creditCardsApi } from '@/lib/api/credit-cards'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
)

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [periodMonths, setPeriodMonths] = useState(6)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Datos de gráficos
  const [categoryEvolutionData, setCategoryEvolutionData] = useState<any>(null)
  const [clientEvolutionData, setClientEvolutionData] = useState<any>(null)
  const [cardEvolutionData, setCardEvolutionData] = useState<any>(null)
  const [comparativeData, setComparativeData] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  
  // Datos maestros
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])

  useEffect(() => {
    loadMasterData()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && clients.length > 0 && creditCards.length > 0) {
      loadAnalyticsData()
    }
  }, [periodMonths, selectedYear, categories, clients, creditCards])

  const loadMasterData = async () => {
    try {
      const [categoriesData, clientsData, cardsData] = await Promise.all([
        categoriesApi.getAll(),
        clientsApi.getAll(),
        creditCardsApi.getAll()
      ])
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setClients(Array.isArray(clientsData) ? clientsData : [])
      setCreditCards(Array.isArray(cardsData) ? cardsData : [])
    } catch (err) {
      console.error('Error loading master data:', err)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError('')
      
      await Promise.all([
        loadCategoryEvolution(),
        loadClientEvolution(),
        loadCardEvolution(),
        loadComparativeData(),
        detectAnomalies()
      ])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar analytics')
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryEvolution = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - periodMonths)
      
      const monthsData = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        try {
          const response = await apiClient.get('/transactions', {
            params: { month, year }
          })
          
          const transactions = response.data.transactions || response.data || []
          
          // Agrupar por categoría
          const categoryTotals: any = {}
          
          transactions.forEach((transaction: any) => {
            const categoryName = transaction.categoryName || 'Sin categoría'
            const amount = Math.abs(Number(transaction.amountArs) || 0)
            const type = transaction.type
            
            if (!categoryTotals[categoryName]) {
              categoryTotals[categoryName] = { income: 0, expense: 0 }
            }
            
            if (type === 'INCOME') {
              categoryTotals[categoryName].income += amount
            } else {
              categoryTotals[categoryName].expense += amount
            }
          })
          
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            categories: categoryTotals
          })
        } catch {
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            categories: {}
          })
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Preparar datos para Chart.js
      const allCategories = new Set<string>()
      monthsData.forEach(month => {
        Object.keys(month.categories).forEach(cat => allCategories.add(cat))
      })
      
      const labels = monthsData.map(m => `${m.month} ${m.year}`)
      const datasets: any[] = []
      
      // Datasets para ingresos
      Array.from(allCategories).slice(0, 8).forEach((category, index) => {
        const incomeData = monthsData.map(m => m.categories[category]?.income || 0)
        const expenseData = monthsData.map(m => m.categories[category]?.expense || 0)
        
        if (incomeData.some(v => v > 0)) {
          datasets.push({
            label: `${category} (Ingresos)`,
            data: incomeData,
            borderColor: `hsl(${(index * 45) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 45) % 360}, 70%, 50%, 0.1)`,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          })
        }
        
        if (expenseData.some(v => v > 0)) {
          datasets.push({
            label: `${category} (Egresos)`,
            data: expenseData,
            borderColor: `hsl(${(index * 45 + 180) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 45 + 180) % 360}, 70%, 50%, 0.1)`,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            borderDash: [5, 5]
          })
        }
      })
      
      setCategoryEvolutionData({ labels, datasets })
    } catch (err) {
      console.error('Error loading category evolution:', err)
    }
  }

  const loadClientEvolution = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - periodMonths)
      
      const monthsData = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        try {
          const response = await apiClient.get('/transactions', {
            params: { month, year }
          })
          
          const transactions = response.data.transactions || response.data || []
          
          // Agrupar por cliente (solo ingresos)
          const clientTotals: any = {}
          
          transactions.filter((t: any) => t.type === 'INCOME').forEach((transaction: any) => {
            const clientName = transaction.clientName || 'Sin cliente'
            const amount = Math.abs(Number(transaction.amountArs) || 0)
            
            if (!clientTotals[clientName]) {
              clientTotals[clientName] = 0
            }
            clientTotals[clientName] += amount
          })
          
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            clients: clientTotals
          })
        } catch {
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            clients: {}
          })
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Preparar datos para Chart.js
      const allClients = new Set<string>()
      monthsData.forEach(month => {
        Object.keys(month.clients).forEach(client => allClients.add(client))
      })
      
      const labels = monthsData.map(m => `${m.month} ${m.year}`)
      const datasets: any[] = []
      
      Array.from(allClients).slice(0, 10).forEach((client, index) => {
        const data = monthsData.map(m => m.clients[client] || 0)
        
        if (data.some(v => v > 0)) {
          datasets.push({
            label: client,
            data,
            borderColor: `hsl(${(index * 36) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 36) % 360}, 70%, 50%, 0.1)`,
            borderWidth: 3,
            fill: false,
            tension: 0.4
          })
        }
      })
      
      setClientEvolutionData({ labels, datasets })
    } catch (err) {
      console.error('Error loading client evolution:', err)
    }
  }

  const loadCardEvolution = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - periodMonths)
      
      const monthsData = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        try {
          const response = await apiClient.get('/transactions', {
            params: { month, year }
          })
          
          const transactions = response.data.transactions || response.data || []
          
          // Agrupar por tarjeta (solo egresos)
          const cardTotals: any = {}
          
          transactions.filter((t: any) => t.type === 'EXPENSE' && t.creditCardId).forEach((transaction: any) => {
            const card = creditCards.find(c => c.id === transaction.creditCardId)
            const cardName = card ? `${card.name} (*${card.lastFourDigits})` : 'Tarjeta desconocida'
            const amount = Math.abs(Number(transaction.amountArs) || 0)
            
            if (!cardTotals[cardName]) {
              cardTotals[cardName] = 0
            }
            cardTotals[cardName] += amount
          })
          
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            cards: cardTotals
          })
        } catch {
          monthsData.push({
            month: MONTHS[month - 1],
            year,
            cards: {}
          })
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Preparar datos para Chart.js
      const allCards = new Set<string>()
      monthsData.forEach(month => {
        Object.keys(month.cards).forEach(card => allCards.add(card))
      })
      
      const labels = monthsData.map(m => `${m.month} ${m.year}`)
      const datasets: any[] = []
      
      Array.from(allCards).forEach((card, index) => {
        const data = monthsData.map(m => m.cards[card] || 0)
        
        if (data.some(v => v > 0)) {
          datasets.push({
            label: card,
            data,
            borderColor: `hsl(${(index * 51) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 51) % 360}, 70%, 50%, 0.1)`,
            borderWidth: 3,
            fill: true,
            tension: 0.4
          })
        }
      })
      
      setCardEvolutionData({ labels, datasets })
    } catch (err) {
      console.error('Error loading card evolution:', err)
    }
  }

  const loadComparativeData = async () => {
    try {
      const currentYear = selectedYear
      const previousYear = selectedYear - 1
      
      const monthlyComparison = []
      
      for (let month = 1; month <= 12; month++) {
        try {
          const [currentResponse, previousResponse] = await Promise.all([
            apiClient.get('/transactions', { params: { month, year: currentYear } }),
            apiClient.get('/transactions', { params: { month, year: previousYear } })
          ])
          
          const currentTransactions = currentResponse.data.transactions || currentResponse.data || []
          const previousTransactions = previousResponse.data.transactions || previousResponse.data || []
          
          const currentIncome = currentTransactions
            .filter((t: any) => t.type === 'INCOME')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amountArs) || 0), 0)
          
          const currentExpense = currentTransactions
            .filter((t: any) => t.type === 'EXPENSE')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amountArs) || 0), 0)
          
          const previousIncome = previousTransactions
            .filter((t: any) => t.type === 'INCOME')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amountArs) || 0), 0)
          
          const previousExpense = previousTransactions
            .filter((t: any) => t.type === 'EXPENSE')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amountArs) || 0), 0)
          
          monthlyComparison.push({
            month: MONTHS[month - 1],
            currentIncome,
            currentExpense,
            previousIncome,
            previousExpense,
            incomeGrowth: previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0,
            expenseGrowth: previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0
          })
        } catch {
          monthlyComparison.push({
            month: MONTHS[month - 1],
            currentIncome: 0,
            currentExpense: 0,
            previousIncome: 0,
            previousExpense: 0,
            incomeGrowth: 0,
            expenseGrowth: 0
          })
        }
      }
      
      const labels = monthlyComparison.map(m => m.month)
      const datasets = [
        {
          label: `Ingresos ${currentYear}`,
          data: monthlyComparison.map(m => m.currentIncome),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false
        },
        {
          label: `Ingresos ${previousYear}`,
          data: monthlyComparison.map(m => m.previousIncome),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false
        },
        {
          label: `Egresos ${currentYear}`,
          data: monthlyComparison.map(m => m.currentExpense),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false
        },
        {
          label: `Egresos ${previousYear}`,
          data: monthlyComparison.map(m => m.previousExpense),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false
        }
      ]
      
      setComparativeData({ labels, datasets, monthlyComparison })
    } catch (err) {
      console.error('Error loading comparative data:', err)
    }
  }

  const detectAnomalies = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 3) // Últimos 3 meses
      
      const anomaliesFound = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        try {
          const response = await apiClient.get('/transactions', {
            params: { month, year }
          })
          
          const transactions = response.data.transactions || response.data || []
          
          // Detectar transacciones inusuales (>3 desviaciones estándar)
          const amounts = transactions.map((t: any) => Math.abs(Number(t.amountArs) || 0))
          const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
          const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
          const stdDev = Math.sqrt(variance)
          
          transactions.forEach((transaction: any) => {
            const amount = Math.abs(Number(transaction.amountArs) || 0)
            if (amount > mean + 3 * stdDev && amount > 50000) { // Mínimo $50k
              anomaliesFound.push({
                id: transaction.id,
                date: transaction.date,
                amount,
                description: transaction.description,
                type: transaction.type,
                categoryName: transaction.categoryName,
                severity: amount > mean + 5 * stdDev ? 'high' : 'medium'
              })
            }
          })
        } catch {
          // Ignorar errores de meses individuales
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      setAnomalies(anomaliesFound.slice(0, 10)) // Top 10 anomalías
    } catch (err) {
      console.error('Error detecting anomalies:', err)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const exportToPDF = () => {
    // Implementar exportación PDF
    console.log('Exportando a PDF...')
  }

  const exportToExcel = () => {
    // Implementar exportación Excel
    console.log('Exportando a Excel...')
  }

  const refreshData = () => {
    if (categories.length > 0 && clients.length > 0 && creditCards.length > 0) {
      loadAnalyticsData()
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          color: '#ffffff',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = formatCurrency(context.parsed.y)
            return `${label}: ${value}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
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
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatCurrency(value)
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={refreshData} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="white">
              📊 Analytics Avanzado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análisis profundo de tus finanzas • Últimos {periodMonths} meses
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={refreshData} sx={{ color: '#10B981' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar PDF">
              <IconButton onClick={exportToPDF} sx={{ color: '#EF4444' }}>
                <FileDownload />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 4, bgcolor: '#1E293B', border: 'none' }}>
          <CardContent>
            <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#94A3B8' }}>Período</InputLabel>
                <Select
                  value={periodMonths}
                  onChange={(e) => setPeriodMonths(Number(e.target.value))}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value={3}>Últimos 3 meses</MenuItem>
                  <MenuItem value={6}>Últimos 6 meses</MenuItem>
                  <MenuItem value={12}>Últimos 12 meses</MenuItem>
                  <MenuItem value={24}>Últimos 24 meses</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: '#94A3B8' }}>Año</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  sx={{ color: 'white' }}
                >
                  {[2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Chip
                icon={<FilterList />}
                label={`${categories.length} categorías`}
                size="small"
                sx={{ bgcolor: '#10B981', color: 'white' }}
              />
              <Chip
                icon={<FilterList />}
                label={`${clients.length} clientes`}
                size="small"
                sx={{ bgcolor: '#3B82F6', color: 'white' }}
              />
              <Chip
                icon={<FilterList />}
                label={`${creditCards.length} tarjetas`}
                size="small"
                sx={{ bgcolor: '#F59E0B', color: 'white' }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Grid de Analytics Cards */}
        <Grid container spacing={3}>
          
          {/* Evolución por Categorías - Card Grande */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Timeline sx={{ color: '#10B981', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    📈 Evolución Mensual por Categorías
                  </Typography>
                </Box>
                {categoryEvolutionData ? (
                  <Box sx={{ height: 400 }}>
                    <Line data={categoryEvolutionData} options={chartOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ingresos por Clientes y Consumos por Tarjetas - 2 Columnas */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none', height: 500 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ShowChart sx={{ color: '#3B82F6', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    💰 Ingresos por Clientes
                  </Typography>
                </Box>
                {clientEvolutionData ? (
                  <Box sx={{ flexGrow: 1, height: 350 }}>
                    <Line data={clientEvolutionData} options={chartOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                    <CircularProgress sx={{ color: '#3B82F6' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none', height: 500 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <BarChartIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    💳 Consumos por Tarjetas
                  </Typography>
                </Box>
                {cardEvolutionData ? (
                  <Box sx={{ flexGrow: 1, height: 350 }}>
                    <Line data={cardEvolutionData} options={chartOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                    <CircularProgress sx={{ color: '#F59E0B' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Comparativo Anual - Card Grande */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <TrendingUp sx={{ color: '#8B5CF6', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    📊 Comparativo {selectedYear} vs {selectedYear - 1}
                  </Typography>
                </Box>
                {comparativeData ? (
                  <Box sx={{ height: 400 }}>
                    <Line data={comparativeData} options={chartOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#8B5CF6' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Alertas y Anomalías - Card con Grid Interno */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Warning sx={{ color: '#EF4444', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    ⚠️ Alertas y Transacciones Anómalas
                  </Typography>
                  {anomalies.length > 0 && (
                    <Chip
                      label={`${anomalies.length} detectadas`}
                      size="small"
                      sx={{ bgcolor: '#EF4444', color: 'white', ml: 'auto' }}
                    />
                  )}
                </Box>
                
                {anomalies.length > 0 ? (
                  <Grid container spacing={2}>
                    {anomalies.map((anomaly, index) => (
                      <Grid item xs={12} sm={6} md={4} key={anomaly.id}>
                        <Card 
                          sx={{ 
                            bgcolor: '#0F172A', 
                            border: `1px solid ${anomaly.severity === 'high' ? '#EF4444' : '#F59E0B'}`,
                            height: '100%'
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <Warning 
                                sx={{ 
                                  color: anomaly.severity === 'high' ? '#EF4444' : '#F59E0B',
                                  fontSize: 20
                                }} 
                              />
                              <Chip
                                label={anomaly.severity === 'high' ? 'ALTA' : 'MEDIA'}
                                size="small"
                                sx={{
                                  bgcolor: anomaly.severity === 'high' ? '#EF4444' : '#F59E0B',
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
                              {formatCurrency(anomaly.amount)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              mb={1}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {anomaly.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {anomaly.categoryName}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(anomaly.date).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box 
                    display="flex" 
                    flexDirection="column"
                    justifyContent="center" 
                    alignItems="center" 
                    py={6}
                    sx={{
                      bgcolor: '#0F172A',
                      borderRadius: 2,
                      border: '1px solid #10B981'
                    }}
                  >
                    <Box 
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <Typography variant="h4">✅</Typography>
                    </Box>
                    <Typography variant="h6" color="white" mb={1}>
                      Todo en orden
                    </Typography>
                    <Typography color="text.secondary" textAlign="center">
                      No se detectaron transacciones anómalas en los últimos 3 meses
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>
    </DashboardLayout>
  )
}
