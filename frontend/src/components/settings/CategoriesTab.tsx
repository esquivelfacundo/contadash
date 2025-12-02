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
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { categoriesApi, Category } from '@/lib/api/categories'

const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
  icon: z.string().min(1, 'Icono requerido'),
})

type CategoryForm = z.infer<typeof categorySchema>

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'INCOME',
      color: '#CD9FCC',
      icon: '💰',
    },
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      if (category.isDefault) {
        setError('No puedes editar categorías por defecto')
        return
      }
      setEditingId(category.id)
      reset({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      })
    } else {
      setEditingId(null)
      reset({
        name: '',
        type: tabValue === 0 ? 'INCOME' : 'EXPENSE',
        color: '#CD9FCC',
        icon: '💰',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    reset()
  }

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingId) {
        await categoriesApi.update(editingId, {
          name: data.name,
          color: data.color,
          icon: data.icon,
        })
      } else {
        await categoriesApi.create(data)
      }

      handleCloseDialog()
      loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar categoría')
    }
  }

  const handleDelete = async (category: Category) => {
    if (category.isDefault) {
      setError('No puedes eliminar categorías por defecto')
      return
    }

    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      await categoriesApi.delete(category.id)
      loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar categoría')
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card 
      elevation={0} 
      sx={{ 
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        '&:hover': {
          borderColor: '#10B981',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                fontSize: '2rem',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${category.color}40 0%, ${category.color}20 100%)`,
                borderRadius: 2,
                border: `2px solid ${category.color}60`,
              }}
            >
              {category.icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                {category.name}
              </Typography>
              {category.isDefault && (
                <Chip 
                  label="Por defecto" 
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    bgcolor: '#10B981',
                    color: 'white',
                  }} 
                />
              )}
            </Box>
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(category)}
              disabled={category.isDefault}
              sx={{ color: '#94A3B8', '&:hover': { color: '#10B981' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(category)}
              disabled={category.isDefault}
              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white" mb={1}>
            Gestión de Categorías
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organiza tus transacciones por categorías • {categories.length} categorías totales
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }
          }}
        >
          Nueva Categoría
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, bgcolor: '#0F172A', border: '1px solid #334155' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => setTabValue(v)} 
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
          <Tab label={`Ingresos (${incomeCategories.length})`} />
          <Tab label={`Egresos (${expenseCategories.length})`} />
        </Tabs>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(tabValue === 0 ? incomeCategories : expenseCategories).map((category, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={category.id}
              sx={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <CategoryCard category={category} />
            </Grid>
          ))}
          
          {(tabValue === 0 ? incomeCategories : expenseCategories).length === 0 && (
            <Grid item xs={12}>
              <Box 
                textAlign="center" 
                py={8}
                sx={{
                  opacity: 0.7,
                  animation: 'fadeIn 0.5s ease-out',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 0.7 },
                  },
                }}
              >
                <Typography variant="h6" color="#94A3B8" mb={1}>
                  No hay {tabValue === 0 ? 'ingresos' : 'egresos'} registrados
                </Typography>
                <Typography variant="body2" color="#6B7280">
                  Crea tu primera categoría de {tabValue === 0 ? 'ingresos' : 'egresos'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: 'white',
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ color: 'white' }}>
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent className="form-input-fix">
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              {!editingId && (
                <Grid item xs={12}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Tipo"
                        error={!!errors.type}
                        helperText={errors.type?.message}
                      >
                        <MenuItem value="INCOME">Ingreso</MenuItem>
                        <MenuItem value="EXPENSE">Egreso</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Color"
                      type="color"
                      error={!!errors.color}
                      helperText={errors.color?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Emoji"
                      error={!!errors.icon}
                      helperText={errors.icon?.message}
                      placeholder="💰"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: '#94A3B8' }}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }
              }}
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
