'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'
import BudgetFormDialog from '@/components/BudgetFormDialog'
import { budgetsApi, Budget, BudgetSummary } from '@/lib/api/budgets'

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [summary, setSummary] = useState<BudgetSummary['summary'] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()

  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [copyFromMonth, setCopyFromMonth] = useState(currentDate.getMonth())
  const [copyFromYear, setCopyFromYear] = useState(currentDate.getFullYear())

  useEffect(() => {
    loadBudgets()
  }, [selectedMonth, selectedYear])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const data = await budgetsApi.getSummary(selectedMonth, selectedYear)
      setBudgets(data.budgets)
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedBudget(undefined)
    setFormOpen(true)
  }

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return

    try {
      await budgetsApi.delete(id)
      loadBudgets()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar presupuesto')
    }
  }

  const handleCopy = async () => {
    try {
      await budgetsApi.copy(copyFromMonth, copyFromYear, selectedMonth, selectedYear)
      setCopyDialogOpen(false)
      loadBudgets()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al copiar presupuestos')
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok':
        return 'success'
      case 'warning':
        return 'warning'
      case 'exceeded':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircleIcon />
      case 'warning':
        return <WarningIcon />
      case 'exceeded':
        return <WarningIcon />
      default:
        return null
    }
  }

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

  // Generate year options (2 years back to 7 years forward, plus next year if December)
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const includeNextYear = currentMonth === 11 // December is month 11 (0-indexed)
  const yearCount = includeNextYear ? 11 : 10
  const startYear = includeNextYear ? currentYear + 8 : currentYear + 7
  const years = Array.from({ length: yearCount }, (_, i) => startYear - i)

  if (loading && budgets.length === 0) {
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
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Presupuestos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus presupuestos mensuales por categoría
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => setCopyDialogOpen(true)}
            >
              Copiar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Nuevo Presupuesto
            </Button>
          </Box>
        </Box>

        {/* Period Selector */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                select
                label="Mes"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                sx={{ minWidth: 150 }}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Año"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                sx={{ minWidth: 120 }}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Presupuestado
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(summary.totalBudgetedArs)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Gastado
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {formatCurrency(summary.totalSpentArs)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Disponible
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatCurrency(summary.totalRemainingArs)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estado
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={`${summary.ok} OK`} color="success" size="small" />
                    <Chip label={`${summary.warning} Alerta`} color="warning" size="small" />
                    <Chip label={`${summary.exceeded} Excedido`} color="error" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay presupuestos para este período
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Crea tu primer presupuesto o copia desde otro mes
                </Typography>
                <Box mt={2}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Crear Presupuesto
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontSize="1.5rem">{budget.category.icon}</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {budget.category.name}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEdit(budget)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Presupuesto
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(Number(budget.amountArs))}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Gastado
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(budget.spending?.ars || 0)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Disponible
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(budget.remaining?.ars || 0)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={1}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {budget.percentage?.ars.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budget.percentage?.ars || 0, 100)}
                        color={
                          (budget.percentage?.ars || 0) > 100
                            ? 'error'
                            : (budget.percentage?.ars || 0) > 80
                            ? 'warning'
                            : 'success'
                        }
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                      <Chip
                        {...(getStatusIcon(budget.status) && { icon: getStatusIcon(budget.status)! })}
                        label={
                          budget.status === 'ok'
                            ? 'En control'
                            : budget.status === 'warning'
                            ? 'Cerca del límite'
                            : 'Excedido'
                        }
                        color={getStatusColor(budget.status)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Form Dialog */}
        <BudgetFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={loadBudgets}
          budget={selectedBudget}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />

        {/* Copy Dialog */}
        <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Copiar Presupuestos</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Copia los presupuestos de un mes a otro
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Desde Mes"
                  value={copyFromMonth}
                  onChange={(e) => setCopyFromMonth(Number(e.target.value))}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Desde Año"
                  value={copyFromYear}
                  onChange={(e) => setCopyFromYear(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Se copiarán a {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCopyDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCopy}>
              Copiar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
