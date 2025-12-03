'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material'
import { analyticsApi } from '@/lib/api/analytics'

interface PeriodComparisonProps {
  defaultPeriod1?: { month?: number; year: number }
  defaultPeriod2?: { month?: number; year: number }
}

export default function PeriodComparison({
  defaultPeriod1,
  defaultPeriod2,
}: PeriodComparisonProps) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const [period1, setPeriod1] = useState(
    defaultPeriod1 || { month: currentMonth, year: currentYear }
  )
  const [period2, setPeriod2] = useState(
    defaultPeriod2 || {
      month: currentMonth === 1 ? 12 : currentMonth - 1,
      year: currentMonth === 1 ? currentYear - 1 : currentYear,
    }
  )
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadComparison = async () => {
    try {
      setLoading(true)
      const result = await analyticsApi.comparePeriods(period1, period2)
      setData(result)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComparison()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const renderGrowthChip = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <Chip
        icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
        label={formatPercentage(growth)}
        color={isPositive ? 'success' : 'error'}
        size="small"
      />
    )
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareArrowsIcon />
        Comparación de Períodos
      </Typography>

      {/* Period Selectors */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" gutterBottom>
            Período 1
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              size="small"
              label="Mes"
              value={period1.month || ''}
              onChange={(e) =>
                setPeriod1({ ...period1, month: e.target.value ? Number(e.target.value) : undefined })
              }
              sx={{ flex: 1 }}
            >
              <MenuItem value="">Año completo</MenuItem>
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Año"
              value={period1.year}
              onChange={(e) => setPeriod1({ ...period1, year: Number(e.target.value) })}
              sx={{ flex: 1 }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>

        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            vs
          </Typography>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" gutterBottom>
            Período 2
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              size="small"
              label="Mes"
              value={period2.month || ''}
              onChange={(e) =>
                setPeriod2({ ...period2, month: e.target.value ? Number(e.target.value) : undefined })
              }
              sx={{ flex: 1 }}
            >
              <MenuItem value="">Año completo</MenuItem>
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Año"
              value={period2.year}
              onChange={(e) => setPeriod2({ ...period2, year: Number(e.target.value) })}
              sx={{ flex: 1 }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={loadComparison} fullWidth>
            Comparar
          </Button>
        </Grid>
      </Grid>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <Grid container spacing={2}>
          {/* Income Comparison */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ingresos
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(data.period1.income.ars)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  vs {formatCurrency(data.period2.income.ars)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {renderGrowthChip(data.comparison.incomeGrowth)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Diferencia: {formatCurrency(data.comparison.incomeDiff.ars)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Comparison */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Egresos
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(data.period1.expense.ars)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  vs {formatCurrency(data.period2.expense.ars)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {renderGrowthChip(data.comparison.expenseGrowth)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Diferencia: {formatCurrency(data.comparison.expenseDiff.ars)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Balance Comparison */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Balance
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(data.period1.balance.ars)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  vs {formatCurrency(data.period2.balance.ars)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {renderGrowthChip(data.comparison.balanceGrowth)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Diferencia: {formatCurrency(data.comparison.balanceDiff.ars)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          Selecciona los períodos y haz clic en "Comparar"
        </Typography>
      )}
    </Paper>
  )
}
