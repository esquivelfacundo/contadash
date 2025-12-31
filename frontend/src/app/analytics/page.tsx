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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import ProjectionsChart from '@/components/ProjectionsChart'
import PeriodComparison from '@/components/PeriodComparison'

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
  const [filterMode, setFilterMode] = useState<'months' | 'year'>('months')
  const [periodMonths, setPeriodMonths] = useState(6)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Datos de gráficos
  const [categoryEvolutionData, setCategoryEvolutionData] = useState<any>(null)
  const [clientEvolutionData, setClientEvolutionData] = useState<any>(null)
  const [cardEvolutionData, setCardEvolutionData] = useState<any>(null)
  const [comparativeData, setComparativeData] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  
  // Datos para tablas
  const [categoryTableData, setCategoryTableData] = useState<any>(null)
  const [clientTableData, setClientTableData] = useState<any>(null)
  const [cardTableData, setCardTableData] = useState<any>(null)
  
  // Nuevos indicadores
  const [profitByMonthData, setProfitByMonthData] = useState<any>(null)
  const [pnlPercentageData, setPnlPercentageData] = useState<any>(null)
  const [incomeExpenseData, setIncomeExpenseData] = useState<any>(null)
  const [exchangeRateData, setExchangeRateData] = useState<any>(null)
  
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
  }, [filterMode, periodMonths, selectedYear, categories, clients, creditCards])

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
        loadNewIndicators(),
        loadExchangeRateData(),
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
      let endDate: Date
      let startDate: Date
      
      if (filterMode === 'year') {
        // Full year mode
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59)
      } else {
        // Last N months mode
        endDate = new Date()
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - periodMonths)
      }
      
      const monthsData: any[] = []
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
            // Buscar el nombre de la categoría desde el array de categorías
            const category = categories.find(c => c.id === transaction.categoryId)
            const categoryName = category?.name || 'Sin categoría'
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
      
      // Preparar datos para la tabla
      setCategoryTableData({ monthsData, allCategories: Array.from(allCategories) })
    } catch (err) {
      setCategoryEvolutionData(null)
      setCategoryTableData(null)
    }
  }

  const loadClientEvolution = async () => {
    try {
      let endDate: Date
      let startDate: Date
      
      if (filterMode === 'year') {
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59)
      } else {
        endDate = new Date()
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - periodMonths)
      }
      
      const monthsData: any[] = []
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
          
          const incomeTransactions = transactions.filter((t: any) => t.type === 'INCOME')
          
          incomeTransactions.forEach((transaction: any) => {
            // Buscar el nombre del cliente desde el array de clientes o desde la relación
            let clientName = 'Sin cliente'
            
            // Primero intentar desde la relación client (si existe)
            if (transaction.client?.company) {
              clientName = transaction.client.company
            } else if (transaction.client?.name) {
              clientName = transaction.client.name
            } 
            // Si no, buscar en el array de clientes
            else if (transaction.clientId && transaction.clientId !== 'null') {
              const client = clients.find(c => c.id === transaction.clientId)
              if (client) {
                // Los clientes usan "company" como nombre
                clientName = client.company || client.name || 'Cliente sin nombre'
              } else {
              }
            }
            
            
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
      
      // Filtrar "Sin cliente" y tomar los top 10
      const clientsFiltered = Array.from(allClients).filter(c => c !== 'Sin cliente')
      
      clientsFiltered.slice(0, 10).forEach((client, index) => {
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
      
      // Si no hay clientes con nombre, agregar "Sin cliente"
      if (datasets.length === 0 && allClients.has('Sin cliente')) {
        const data = monthsData.map(m => m.clients['Sin cliente'] || 0)
        datasets.push({
          label: 'Sin cliente',
          data,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        })
      }
      
      setClientEvolutionData({ labels, datasets })
      
      // Preparar datos para la tabla
      setClientTableData({ monthsData, allClients: Array.from(allClients) })
    } catch (err) {
      setClientEvolutionData(null)
      setClientTableData(null)
    }
  }

  const loadCardEvolution = async () => {
    try {
      let endDate: Date
      let startDate: Date
      
      if (filterMode === 'year') {
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59)
      } else {
        endDate = new Date()
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - periodMonths)
      }
      
      const monthsData: { month: string; year: number; cards: { [key: string]: number } }[] = []
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
      
      
      // Si no hay datos de tarjetas, setear null para mostrar mensaje
      if (datasets.length === 0) {
        setCardEvolutionData(null)
        setCardTableData(null)
      } else {
        setCardEvolutionData({ labels, datasets })
        // Preparar datos para la tabla
        setCardTableData({ monthsData, allCards: Array.from(allCards) })
      }
    } catch (err) {
      setCardEvolutionData(null)
      setCardTableData(null)
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
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: false
        },
        {
          label: `Egresos ${previousYear}`,
          data: monthlyComparison.map(m => m.previousExpense),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false
        }
      ]
      
      setComparativeData({ labels, datasets, monthlyComparison })
    } catch (err) {
    }
  }

  const loadNewIndicators = async () => {
    try {
      const currentYear = selectedYear
      const monthsData: any[] = []
      
      // Cargar datos de todos los meses del año
      for (let month = 1; month <= 12; month++) {
        try {
          const response = await apiClient.get('/transactions', {
            params: { month, year: currentYear }
          })
          
          const transactions = response.data.transactions || response.data || []
          
          let totalIncome = 0
          let totalExpense = 0
          let totalIncomeUSD = 0
          let totalExpenseUSD = 0
          
          transactions.forEach((t: any) => {
            const amountArs = Number(t.amountArs) || 0
            const amountUsd = Number(t.amountUsd) || 0
            
            if (t.type === 'INCOME') {
              totalIncome += amountArs
              totalIncomeUSD += amountUsd
            } else {
              totalExpense += amountArs
              totalExpenseUSD += amountUsd
            }
          })
          
          const profit = totalIncome - totalExpense
          const profitUSD = totalIncomeUSD - totalExpenseUSD
          const pnlPercentage = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0
          
          monthsData.push({
            month: MONTHS[month - 1],
            monthNumber: month,
            totalIncome,
            totalExpense,
            profit,
            totalIncomeUSD,
            totalExpenseUSD,
            profitUSD,
            pnlPercentage
          })
        } catch {
          monthsData.push({
            month: MONTHS[month - 1],
            monthNumber: month,
            totalIncome: 0,
            totalExpense: 0,
            profit: 0,
            totalIncomeUSD: 0,
            totalExpenseUSD: 0,
            profitUSD: 0,
            pnlPercentage: 0
          })
        }
      }
      
      // 1. Ganancia por mes (Pie/Doughnut)
      const profitLabels = monthsData.filter(m => m.profit > 0).map(m => m.month)
      const profitValues = monthsData.filter(m => m.profit > 0).map(m => m.profit)
      
      setProfitByMonthData({
        labels: profitLabels,
        datasets: [{
          data: profitValues,
          backgroundColor: [
            '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', 
            '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
            '#A855F7', '#22D3EE'
          ],
          borderWidth: 2,
          borderColor: '#0F172A'
        }]
      })
      
      // 2. PnL (%)
      setPnlPercentageData({
        labels: monthsData.map(m => m.month),
        datasets: [{
          label: 'PnL (%)',
          data: monthsData.map(m => m.pnlPercentage),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      })
      
      // 3. Ingresos/Egresos separados en ARS y USD
      setIncomeExpenseData({
        labels: monthsData.map(m => m.month),
        incomeARS: monthsData.map(m => m.totalIncome),
        expenseARS: monthsData.map(m => m.totalExpense),
        incomeUSD: monthsData.map(m => m.totalIncomeUSD),
        expenseUSD: monthsData.map(m => m.totalExpenseUSD),
        profitARS: monthsData.map(m => m.profit),
        profitUSD: monthsData.map(m => m.profitUSD)
      })
      
    } catch (err) {
    }
  }

  const loadExchangeRateData = async () => {
    try {
      const currentYear = selectedYear
      const ratesData = []
      
      for (let month = 1; month <= 12; month++) {
        try {
          // Obtener el último día del mes para tener la cotización correcta
          const date = new Date(currentYear, month, 0) // Día 0 del siguiente mes = último día del mes actual
          const dateStr = date.toISOString().split('T')[0]
          
          
          const response = await apiClient.get('/exchange/blue/date', {
            params: { date: dateStr }
          })
          
          
          ratesData.push({
            month: MONTHS[month - 1],
            rate: response.data.rate || 0
          })
        } catch (err) {
          ratesData.push({
            month: MONTHS[month - 1],
            rate: 0
          })
        }
      }
      
      setExchangeRateData({
        labels: ratesData.map(r => r.month),
        datasets: [{
          label: 'Dólar Libre',
          data: ratesData.map(r => r.rate),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      })
    } catch (err) {
    }
  }

  const detectAnomalies = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 3) // Últimos 3 meses
      
      const anomaliesFound: any[] = []
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
          const mean = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length
          const variance = amounts.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / amounts.length
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
  }

  const exportToExcel = () => {
    // Implementar exportación Excel
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
              Análisis Financiero
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análisis profundo de tus finanzas • {filterMode === 'year' ? `Año ${selectedYear}` : `Últimos ${periodMonths} meses`}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={refreshData} sx={{ color: '#10B981' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar PDF">
              <IconButton onClick={exportToPDF} sx={{ color: '#F59E0B' }}>
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
                <InputLabel sx={{ color: '#94A3B8' }}>Modo de Filtro</InputLabel>
                <Select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as 'months' | 'year')}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="months">Por Período</MenuItem>
                  <MenuItem value="year">Por Año Completo</MenuItem>
                </Select>
              </FormControl>
              
              {filterMode === 'months' ? (
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
              ) : (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: '#94A3B8' }}>Año</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ color: 'white' }}
                  >
                    {[2022, 2023, 2024, 2025, 2026].map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Chip
                icon={<FilterList />}
                label={`${categories.length} categorías`}
                size="small"
                sx={{ bgcolor: '#8B5CF6', color: 'white' }}
              />
              <Chip
                icon={<FilterList />}
                label={`${clients.length} clientes`}
                size="small"
                sx={{ bgcolor: '#10B981', color: 'white' }}
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
                    Evolución Mensual por Categorías
                  </Typography>
                </Box>
                {categoryEvolutionData ? (
                  <>
                    <Box sx={{ height: 400, mb: 4 }}>
                      <Line data={categoryEvolutionData} options={chartOptions} />
                    </Box>
                    
                    {/* Tablas de Detalle */}
                    {categoryTableData && (
                      <Grid container spacing={3}>
                        {/* Tabla de Ingresos */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#10B981" mb={2}>
                            Ingresos por Categoría
                          </Typography>
                          <TableContainer component={Paper} sx={{ bgcolor: '#0F172A', maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
                                  {categoryTableData.monthsData.map((m: any, idx: number) => (
                                    <TableCell key={idx} align="right" sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>
                                      {m.month} {m.year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {categoryTableData.allCategories.map((category: string) => {
                                  const hasIncome = categoryTableData.monthsData.some((m: any) => m.categories[category]?.income > 0)
                                  if (!hasIncome) return null
                                  
                                  return (
                                    <TableRow key={category}>
                                      <TableCell sx={{ color: 'white' }}>{category}</TableCell>
                                      {categoryTableData.monthsData.map((m: any, idx: number) => (
                                        <TableCell key={idx} align="right" sx={{ color: '#10B981' }}>
                                          {formatCurrency(m.categories[category]?.income || 0)}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                        
                        {/* Tabla de Egresos */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#EF4444" mb={2}>
                            Egresos por Categoría
                          </Typography>
                          <TableContainer component={Paper} sx={{ bgcolor: '#0F172A', maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
                                  {categoryTableData.monthsData.map((m: any, idx: number) => (
                                    <TableCell key={idx} align="right" sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>
                                      {m.month} {m.year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {categoryTableData.allCategories.map((category: string) => {
                                  const hasExpense = categoryTableData.monthsData.some((m: any) => m.categories[category]?.expense > 0)
                                  if (!hasExpense) return null
                                  
                                  return (
                                    <TableRow key={category}>
                                      <TableCell sx={{ color: 'white' }}>{category}</TableCell>
                                      {categoryTableData.monthsData.map((m: any, idx: number) => (
                                        <TableCell key={idx} align="right" sx={{ color: '#EF4444' }}>
                                          {formatCurrency(m.categories[category]?.expense || 0)}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </Grid>
                    )}
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ingresos por Clientes y Consumos por Tarjetas - Una debajo de la otra */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ShowChart sx={{ color: '#3B82F6', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Ingresos por Clientes
                  </Typography>
                </Box>
                {clientEvolutionData ? (
                  <>
                    <Box sx={{ height: 350, mb: 3 }}>
                      <Line data={clientEvolutionData} options={chartOptions} />
                    </Box>
                    
                    {/* Tabla de Detalle */}
                    {clientTableData && (
                      <>
                        <Typography variant="subtitle2" fontWeight="bold" color="#3B82F6" mb={2}>
                          Detalle por Cliente
                        </Typography>
                        <TableContainer component={Paper} sx={{ bgcolor: '#0F172A', maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                                {clientTableData.monthsData.map((m: any, idx: number) => (
                                  <TableCell key={idx} align="right" sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>
                                    {m.month}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {clientTableData.allClients
                                .filter((c: string) => c !== 'Sin cliente')
                                .sort((a: string, b: string) => {
                                  // Calculate total income for each client
                                  const totalA = clientTableData.monthsData.reduce((sum: number, m: any) => sum + (m.clients[a] || 0), 0)
                                  const totalB = clientTableData.monthsData.reduce((sum: number, m: any) => sum + (m.clients[b] || 0), 0)
                                  return totalB - totalA // Descending order
                                })
                                .map((client: string) => (
                                <TableRow key={client}>
                                  <TableCell sx={{ color: 'white' }}>{client}</TableCell>
                                  {clientTableData.monthsData.map((m: any, idx: number) => (
                                    <TableCell key={idx} align="right" sx={{ color: '#3B82F6' }}>
                                      {formatCurrency(m.clients[client] || 0)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#3B82F6' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <BarChartIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Consumos por Tarjetas
                  </Typography>
                </Box>
                {cardEvolutionData ? (
                  <>
                    <Box sx={{ height: 350, mb: 3 }}>
                      <Line data={cardEvolutionData} options={chartOptions} />
                    </Box>
                    
                    {/* Tabla de Detalle */}
                    {cardTableData && (
                      <>
                        <Typography variant="subtitle2" fontWeight="bold" color="#F59E0B" mb={2}>
                          Detalle por Tarjeta
                        </Typography>
                        <TableContainer component={Paper} sx={{ bgcolor: '#0F172A', maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>Tarjeta</TableCell>
                                {cardTableData.monthsData.map((m: any, idx: number) => (
                                  <TableCell key={idx} align="right" sx={{ bgcolor: '#1E293B', color: 'white', fontWeight: 'bold' }}>
                                    {m.month}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {cardTableData.allCards.map((card: string) => (
                                <TableRow key={card}>
                                  <TableCell sx={{ color: 'white' }}>{card}</TableCell>
                                  {cardTableData.monthsData.map((m: any, idx: number) => (
                                    <TableCell key={idx} align="right" sx={{ color: '#F59E0B' }}>
                                      {formatCurrency(m.cards[card] || 0)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </>
                ) : (
                  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={300} gap={2}>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      No hay transacciones con tarjetas de crédito en este período
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Las transacciones deben tener una tarjeta asignada para aparecer aquí
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Comparación de Períodos */}
          <Grid item xs={12}>
            <PeriodComparison />
          </Grid>

          {/* Comparativo Anual - Card Grande */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <TrendingUp sx={{ color: '#8B5CF6', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Comparativo {selectedYear} vs {selectedYear - 1}
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

          {/* Nuevos Indicadores - Ganancia por mes y PnL */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Ganancia por mes
                </Typography>
                {profitByMonthData ? (
                  <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Doughnut 
                      data={profitByMonthData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: { color: 'white', font: { size: 12 } }
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const label = context.label || ''
                                const value = formatCurrency(context.parsed)
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                                const percentage = ((context.parsed / total) * 100).toFixed(1)
                                return `${label}: ${value} (${percentage}%)`
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  PnL (%)
                </Typography>
                {pnlPercentageData ? (
                  <Box sx={{ height: 400 }}>
                    <Line 
                      data={pnlPercentageData} 
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...chartOptions.scales?.y,
                            ticks: {
                              ...chartOptions.scales?.y?.ticks,
                              callback: function(value: any) {
                                return value.toFixed(2) + '%'
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ingresos en ARS y USD unificado */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Ingresos (ARS y US$)
                </Typography>
                {incomeExpenseData ? (
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={{
                        labels: incomeExpenseData.labels,
                        datasets: [
                          {
                            label: 'Ingresos ARS',
                            data: incomeExpenseData.incomeARS,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y'
                          },
                          {
                            label: 'Ingresos USD',
                            data: incomeExpenseData.incomeUSD,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1'
                          }
                        ]
                      }} 
                      options={{
                        ...chartOptions,
                        scales: {
                          x: chartOptions.scales?.x,
                          y: {
                            ...chartOptions.scales?.y,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'ARS',
                              color: '#10B981'
                            }
                          },
                          y1: {
                            ...chartOptions.scales?.y,
                            position: 'right',
                            title: {
                              display: true,
                              text: 'USD',
                              color: '#3B82F6'
                            },
                            grid: {
                              drawOnChartArea: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Egresos en ARS y USD unificado */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Egresos (ARS y US$)
                </Typography>
                {incomeExpenseData ? (
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={{
                        labels: incomeExpenseData.labels,
                        datasets: [
                          {
                            label: 'Egresos ARS',
                            data: incomeExpenseData.expenseARS,
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y'
                          },
                          {
                            label: 'Egresos USD',
                            data: incomeExpenseData.expenseUSD,
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1'
                          }
                        ]
                      }} 
                      options={{
                        ...chartOptions,
                        scales: {
                          x: chartOptions.scales?.x,
                          y: {
                            ...chartOptions.scales?.y,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'ARS',
                              color: '#F59E0B'
                            }
                          },
                          y1: {
                            ...chartOptions.scales?.y,
                            position: 'right',
                            title: {
                              display: true,
                              text: 'USD',
                              color: '#EF4444'
                            },
                            grid: {
                              drawOnChartArea: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#F59E0B' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Comparativos Unificados - Ingresos, Egresos y Ganancia */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Ingresos, Egresos y Ganancia (ARS)
                </Typography>
                {incomeExpenseData ? (
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={{
                        labels: incomeExpenseData.labels,
                        datasets: [
                          {
                            label: 'Ingresos',
                            data: incomeExpenseData.incomeARS,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          },
                          {
                            label: 'Egresos',
                            data: incomeExpenseData.expenseARS,
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          },
                          {
                            label: 'Ganancia',
                            data: incomeExpenseData.profitARS,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          }
                        ]
                      }} 
                      options={chartOptions}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Ingresos, Egresos y Ganancia (US$)
                </Typography>
                {incomeExpenseData ? (
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={{
                        labels: incomeExpenseData.labels,
                        datasets: [
                          {
                            label: 'Ingresos',
                            data: incomeExpenseData.incomeUSD,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          },
                          {
                            label: 'Egresos',
                            data: incomeExpenseData.expenseUSD,
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          },
                          {
                            label: 'Ganancia',
                            data: incomeExpenseData.profitUSD,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                          }
                        ]
                      }} 
                      options={chartOptions}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Dólar Libre */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
                  Dólar Libre
                </Typography>
                {exchangeRateData ? (
                  <Box sx={{ height: 400 }}>
                    <Line 
                      data={exchangeRateData} 
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...chartOptions.scales?.y,
                            ticks: {
                              ...chartOptions.scales?.y?.ticks,
                              callback: function(value: any) {
                                return '$' + value.toLocaleString()
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Proyecciones Financieras */}
          <Grid item xs={12}>
            <ProjectionsChart defaultMonths={6} />
            
            {/* Explicación del Modelo de Proyecciones */}
            <Box sx={{ mt: 2, px: 3, py: 2, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', lineHeight: 1.6, display: 'block' }}>
                <strong style={{ color: '#10B981' }}>¿Cómo funciona el modelo de proyecciones?</strong><br /><br />
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

          {/* Alertas y Anomalías - Card con Grid Interno */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Warning sx={{ color: '#EF4444', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Alertas y Transacciones Anómalas
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
