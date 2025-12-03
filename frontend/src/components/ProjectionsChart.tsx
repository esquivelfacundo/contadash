'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material'
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
import { analyticsApi } from '@/lib/api/analytics'
import { COLORS } from '@/constants/colors'

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

interface ProjectionsChartProps {
  defaultMonths?: number
}

export default function ProjectionsChart({ defaultMonths = 3 }: ProjectionsChartProps) {
  const [months, setMonths] = useState(defaultMonths)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadProjections = async () => {
    try {
      setLoading(true)
      const result = await analyticsApi.getProjections(months)
      setData(result)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjections()
  }, [months])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (month: number, year: number) => {
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ]
    return `${monthNames[month - 1]} ${year}`
  }

  const prepareChartData = () => {
    if (!data) return null

    const historical = data.historical || []
    const projections = data.projections || []
    const allData = [...historical, ...projections]

    const labels = allData.map((item: any) => formatMonth(item.month, item.year))
    
    // Datos históricos
    const historicalIncome = historical.map((item: any) => Number(item.income.ars))
    const historicalExpense = historical.map((item: any) => Number(item.expense.ars))
    const historicalBalance = historical.map((item: any) => Number(item.balance.ars))
    
    // Datos proyectados
    const projectedIncome = projections.map((item: any) => Number(item.income.ars))
    const projectedExpense = projections.map((item: any) => Number(item.expense.ars))
    const projectedBalance = projections.map((item: any) => Number(item.balance.ars))

    // Combinar datos históricos y proyectados
    const incomeData = [...historicalIncome, ...projectedIncome]
    const expenseData = [...historicalExpense, ...projectedExpense]
    const balanceData = [...historicalBalance, ...projectedBalance]

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: COLORS.income.main,
          backgroundColor: `${COLORS.income.main}20`,
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.income.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: COLORS.income.main,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true,
          segment: {
            borderDash: (ctx: any) => {
              const historicalLength = historical.length
              return ctx.p0DataIndex >= historicalLength - 1 ? [5, 5] : undefined
            },
          },
        },
        {
          label: 'Egresos',
          data: expenseData,
          borderColor: COLORS.expense.main,
          backgroundColor: `${COLORS.expense.main}20`,
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.expense.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: COLORS.expense.main,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true,
          segment: {
            borderDash: (ctx: any) => {
              const historicalLength = historical.length
              return ctx.p0DataIndex >= historicalLength - 1 ? [5, 5] : undefined
            },
          },
        },
        {
          label: 'Balance',
          data: balanceData,
          borderColor: COLORS.balance.main,
          backgroundColor: `${COLORS.balance.main}20`,
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: COLORS.balance.main,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: COLORS.balance.main,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true,
          segment: {
            borderDash: (ctx: any) => {
              const historicalLength = historical.length
              return ctx.p0DataIndex >= historicalLength - 1 ? [5, 5] : undefined
            },
          },
        },
      ],
      historicalCount: historical.length,
    }
  }

  const chartData = prepareChartData()

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
            const isProjection = context.dataIndex >= (chartData?.historicalCount || 0)
            return `${label}: ${value}${isProjection ? ' (proyectado)' : ''}`
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

  return (
    <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon />
            Proyecciones Financieras
          </Typography>
          <TextField
            select
            size="small"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                height: '32px',
                fontSize: '0.75rem',
              }
            }}
          >
            {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
              <MenuItem key={m} value={m}>
                {m} {m === 1 ? 'mes' : 'meses'}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {data && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<TrendingUpIcon />}
              label={`Crecimiento ingresos: ${data.trends.avgIncomeGrowth.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: '#10B981',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
            <Chip
              icon={<TrendingUpIcon />}
              label={`Crecimiento egresos: ${data.trends.avgExpenseGrowth.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: '#EF4444',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress sx={{ color: '#10B981' }} />
          </Box>
        ) : chartData ? (
          <Box sx={{ height: 400, position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'block', 
                mt: 2, 
                textAlign: 'center',
                fontSize: '0.7rem'
              }}
            >
              * Las proyecciones (líneas punteadas) se basan en el promedio de crecimiento de los últimos 6 meses
            </Typography>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <Typography variant="body2" color="text.secondary">
              No hay datos suficientes para generar proyecciones
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
