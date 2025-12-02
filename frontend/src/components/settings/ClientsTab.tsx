'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientsApi, Client } from '@/lib/api/clients'

const clientSchema = z.object({
  company: z.string().min(1, 'Nombre de empresa requerido'),
  responsible: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})

type ClientForm = z.infer<typeof clientSchema>

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company: '',
      responsible: '',
      email: '',
      phone: '',
      active: true,
    },
  })

  useEffect(() => {
    loadClients()
  }, [showInactive])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientsApi.getAll(!showInactive)
      setClients(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingId(client.id)
      reset({
        company: client.company,
        responsible: client.responsible || '',
        email: client.email || '',
        phone: client.phone || '',
        active: client.active,
      })
    } else {
      setEditingId(null)
      reset({
        company: '',
        responsible: '',
        email: '',
        phone: '',
        active: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    reset()
  }

  const onSubmit = async (data: ClientForm) => {
    try {
      const payload = {
        ...data,
        responsible: data.responsible || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
      }

      if (editingId) {
        await clientsApi.update(editingId, payload)
      } else {
        await clientsApi.create(payload)
      }

      handleCloseDialog()
      loadClients()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar cliente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      await clientsApi.delete(id)
      loadClients()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar cliente')
    }
  }

  const ClientCard = ({ client }: { client: Client }) => (
    <Card 
      elevation={0} 
      sx={{ 
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        '&:hover': {
          borderColor: '#8B5CF6',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon sx={{ color: '#8B5CF6' }} />
              <Typography variant="h6" fontWeight="bold" color="white">
                {client.company}
              </Typography>
            </Box>
            <Chip
              label={client.active ? 'Activo' : 'Inactivo'}
              size="small"
              sx={{ 
                mt: 0.5,
                bgcolor: client.active ? '#10B981' : '#6B7280',
                color: 'white',
              }}
            />
          </Box>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => handleOpenDialog(client)}
              sx={{ color: '#94A3B8', '&:hover': { color: '#8B5CF6' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(client.id)}
              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          {client.responsible && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="#94A3B8" fontWeight="medium">
                Responsable:
              </Typography>
              <Typography variant="body2" color="white">
                {client.responsible}
              </Typography>
            </Box>
          )}
          {client.email && (
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon fontSize="small" sx={{ color: '#94A3B8' }} />
              <Typography variant="body2" color="white">
                {client.email}
              </Typography>
            </Box>
          )}
          {client.phone && (
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneIcon fontSize="small" sx={{ color: '#94A3B8' }} />
              <Typography variant="body2" color="white">
                {client.phone}
              </Typography>
            </Box>
          )}
          {client._count && (
            <Typography variant="caption" color="#94A3B8" mt={1}>
              {client._count.transactions} transacciones
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white" mb={1}>
            Gestión de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona las empresas con las que trabajas • {clients.length} clientes registrados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            }
          }}
        >
          Nueva Empresa
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#CD9FCC',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#CD9FCC',
                },
              }}
            />
          }
          label="Mostrar inactivos"
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#CD9FCC' }} />
        </Box>
      ) : clients.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No hay clientes
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <ClientCard client={client} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogContent className="form-input-fix">
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre de la Empresa"
                      error={!!errors.company}
                      helperText={errors.company?.message}
                      placeholder="Ej: Tech Solutions SA"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="responsible"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Responsable / Contacto (opcional)"
                      error={!!errors.responsible}
                      helperText={errors.responsible?.message}
                      placeholder="Ej: Juan Pérez"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email (opcional)"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Teléfono (opcional)"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              {editingId && (
                <Grid item xs={12}>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch 
                            {...field} 
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#CD9FCC',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#CD9FCC',
                              },
                            }}
                          />
                        }
                        label="Empresa activa"
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ bgcolor: '#CD9FCC', '&:hover': { bgcolor: '#B87DB8' } }}
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
