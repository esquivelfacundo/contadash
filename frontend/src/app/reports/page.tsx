'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Download,
  Email,
  Schedule,
  PictureAsPdf,
  TableChart,
  Delete,
  PlayArrow,
  Edit,
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'
import { reportsApi } from '@/lib/api/reports'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'

export default function ReportsPage() {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Datos para filtros
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  // Reportes programados
  const [scheduledReports, setScheduledReports] = useState<any[]>([])
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  // Formulario de reporte mensual
  const [monthlyForm, setMonthlyForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  // Formulario de reporte anual
  const [annualForm, setAnnualForm] = useState({
    year: new Date().getFullYear(),
  })

  // Formulario de reporte por cliente
  const [clientForm, setClientForm] = useState({
    clientId: '',
    startDate: '',
    endDate: '',
  })

  // Formulario de reporte por categoría
  const [categoryForm, setCategoryForm] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
  })

  // Formulario de reporte programado
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'MONTHLY' as any,
    frequency: 'MONTHLY' as any,
    format: 'BOTH' as any,
    recipients: [''],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cats, cls, reports] = await Promise.all([
        categoriesApi.getAll(),
        clientsApi.getAll(),
        reportsApi.getScheduledReports(),
      ])
      setCategories(cats)
      setClients(cls)
      setScheduledReports(reports)
    } catch (err: any) {
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleGenerateMonthly = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      setError('')
      const blob = await reportsApi.generateMonthlyReport(
        monthlyForm.month,
        monthlyForm.year,
        format
      )
      downloadFile(blob, `reporte_mensual_${monthlyForm.month}_${monthlyForm.year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      setSuccess('Reporte generado exitosamente')
    } catch (err: any) {
      setError('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAnnual = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      setError('')
      const blob = await reportsApi.generateAnnualReport(annualForm.year, format)
      downloadFile(blob, `reporte_anual_${annualForm.year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      setSuccess('Reporte generado exitosamente')
    } catch (err: any) {
      setError('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateClient = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      setError('')
      const blob = await reportsApi.generateClientReport(
        clientForm.clientId,
        clientForm.startDate,
        clientForm.endDate,
        format
      )
      downloadFile(blob, `reporte_cliente.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      setSuccess('Reporte generado exitosamente')
    } catch (err: any) {
      setError('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCategory = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      setError('')
      const blob = await reportsApi.generateCategoryReport(
        categoryForm.categoryId,
        categoryForm.startDate,
        categoryForm.endDate,
        format
      )
      downloadFile(blob, `reporte_categoria.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      setSuccess('Reporte generado exitosamente')
    } catch (err: any) {
      setError('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateScheduledReport = async () => {
    try {
      setLoading(true)
      setError('')
      await reportsApi.createScheduledReport(scheduleForm)
      setSuccess('Reporte programado creado exitosamente')
      setShowScheduleDialog(false)
      loadData()
    } catch (err: any) {
      setError('Error al crear reporte programado')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleScheduledReport = async (id: string, isActive: boolean) => {
    try {
      await reportsApi.toggleScheduledReport(id, isActive)
      loadData()
    } catch (err: any) {
      setError('Error al actualizar reporte')
    }
  }

  const handleDeleteScheduledReport = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte programado?')) return
    try {
      await reportsApi.deleteScheduledReport(id)
      setSuccess('Reporte eliminado')
      loadData()
    } catch (err: any) {
      setError('Error al eliminar reporte')
    }
  }

  const handleExecuteScheduledReport = async (id: string) => {
    try {
      setLoading(true)
      await reportsApi.executeScheduledReport(id)
      setSuccess('Reporte ejecutado y enviado por email')
    } catch (err: any) {
      setError('Error al ejecutar reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            📊 Reportes
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Mensual" />
              <Tab label="Anual" />
              <Tab label="Por Cliente" />
              <Tab label="Por Categoría" />
              <Tab label="Programados" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Reporte Mensual */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Mes"
                      value={monthlyForm.month}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, month: parseInt(e.target.value) })
                      }
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleDateString('es-AR', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Año"
                      value={monthlyForm.year}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, year: parseInt(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleGenerateMonthly('pdf')}
                        disabled={loading}
                      >
                        Descargar PDF
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<TableChart />}
                        onClick={() => handleGenerateMonthly('excel')}
                        disabled={loading}
                      >
                        Descargar Excel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Reporte Anual */}
              {tabValue === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Año"
                      value={annualForm.year}
                      onChange={(e) =>
                        setAnnualForm({ ...annualForm, year: parseInt(e.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleGenerateAnnual('pdf')}
                        disabled={loading}
                      >
                        Descargar PDF
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<TableChart />}
                        onClick={() => handleGenerateAnnual('excel')}
                        disabled={loading}
                      >
                        Descargar Excel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Reporte por Cliente */}
              {tabValue === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Cliente</InputLabel>
                      <Select
                        value={clientForm.clientId}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, clientId: e.target.value })
                        }
                      >
                        {clients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.company}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha Inicio"
                      InputLabelProps={{ shrink: true }}
                      value={clientForm.startDate}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, startDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha Fin"
                      InputLabelProps={{ shrink: true }}
                      value={clientForm.endDate}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, endDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleGenerateClient('pdf')}
                        disabled={loading || !clientForm.clientId}
                      >
                        Descargar PDF
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<TableChart />}
                        onClick={() => handleGenerateClient('excel')}
                        disabled={loading || !clientForm.clientId}
                      >
                        Descargar Excel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Reporte por Categoría */}
              {tabValue === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        value={categoryForm.categoryId}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, categoryId: e.target.value })
                        }
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha Inicio"
                      InputLabelProps={{ shrink: true }}
                      value={categoryForm.startDate}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, startDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha Fin"
                      InputLabelProps={{ shrink: true }}
                      value={categoryForm.endDate}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, endDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleGenerateCategory('pdf')}
                        disabled={loading || !categoryForm.categoryId}
                      >
                        Descargar PDF
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<TableChart />}
                        onClick={() => handleGenerateCategory('excel')}
                        disabled={loading || !categoryForm.categoryId}
                      >
                        Descargar Excel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Reportes Programados */}
              {tabValue === 4 && (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Schedule />}
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      Nuevo Reporte Programado
                    </Button>
                  </Box>

                  <List>
                    {scheduledReports.map((report) => (
                      <ListItem key={report.id}>
                        <ListItemText
                          primary={report.name}
                          secondary={`${report.type} - ${report.frequency} - ${report.format}`}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={report.isActive}
                            onChange={(e) =>
                              handleToggleScheduledReport(report.id, e.target.checked)
                            }
                          />
                          <IconButton onClick={() => handleExecuteScheduledReport(report.id)}>
                            <PlayArrow />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteScheduledReport(report.id)}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Dialog para crear reporte programado */}
          <Dialog
            open={showScheduleDialog}
            onClose={() => setShowScheduleDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Nuevo Reporte Programado</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={scheduleForm.type}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, type: e.target.value as any })
                      }
                    >
                      <MenuItem value="MONTHLY">Mensual</MenuItem>
                      <MenuItem value="ANNUAL">Anual</MenuItem>
                      <MenuItem value="CLIENT">Por Cliente</MenuItem>
                      <MenuItem value="CATEGORY">Por Categoría</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frecuencia</InputLabel>
                    <Select
                      value={scheduleForm.frequency}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, frequency: e.target.value as any })
                      }
                    >
                      <MenuItem value="DAILY">Diario</MenuItem>
                      <MenuItem value="WEEKLY">Semanal</MenuItem>
                      <MenuItem value="MONTHLY">Mensual</MenuItem>
                      <MenuItem value="QUARTERLY">Trimestral</MenuItem>
                      <MenuItem value="YEARLY">Anual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Formato</InputLabel>
                    <Select
                      value={scheduleForm.format}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, format: e.target.value as any })
                      }
                    >
                      <MenuItem value="PDF">PDF</MenuItem>
                      <MenuItem value="EXCEL">Excel</MenuItem>
                      <MenuItem value="BOTH">Ambos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destinatarios (separados por coma)"
                    value={scheduleForm.recipients.join(',')}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        recipients: e.target.value.split(',').map((r) => r.trim()),
                      })
                    }
                    helperText="Ejemplo: email1@example.com, email2@example.com"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowScheduleDialog(false)}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={handleCreateScheduledReport}
                disabled={loading || !scheduleForm.name || scheduleForm.recipients.length === 0}
              >
                Crear
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </DashboardLayout>
  )
}
