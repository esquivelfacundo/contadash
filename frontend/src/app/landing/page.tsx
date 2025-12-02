'use client'

import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  PieChart,
  Security,
  Speed,
  CloudDone,
  CheckCircle,
  ArrowForward,
  Person,
  Business,
  Storefront,
} from '@mui/icons-material'

export default function LandingPage() {
  const router = useRouter()
  const theme = useTheme()

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Analytics en Tiempo Real',
      description: 'Visualiza tus ingresos, egresos y balance con gráficos interactivos y KPIs actualizados.',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Multi-Moneda',
      description: 'Gestiona tus finanzas en ARS y USD con conversión automática y cotizaciones históricas.',
    },
    {
      icon: <PieChart sx={{ fontSize: 40 }} />,
      title: 'Presupuestos Inteligentes',
      description: 'Crea presupuestos por categoría y recibe alertas cuando te acerques al límite.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Seguridad Total',
      description: 'Tus datos están protegidos con encriptación de nivel bancario y aislamiento multi-tenant.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Rápido y Eficiente',
      description: 'Interfaz optimizada que carga en segundos. Sin esperas, sin frustraciones.',
    },
    {
      icon: <CloudDone sx={{ fontSize: 40 }} />,
      title: 'Siempre Disponible',
      description: 'Accede desde cualquier dispositivo, en cualquier momento. Tus datos sincronizados en la nube.',
    },
  ]

  const useCases = [
    {
      icon: <Person sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      title: 'Personas',
      subtitle: 'Control Personal',
      benefits: [
        'Controla tus gastos diarios',
        'Ahorra más cada mes',
        'Visualiza tus patrones de consumo',
        'Planifica tu futuro financiero',
      ],
      cta: 'Ideal para ti',
    },
    {
      icon: <Storefront sx={{ fontSize: 60, color: theme.palette.success.main }} />,
      title: 'Emprendedores',
      subtitle: 'Gestión Profesional',
      benefits: [
        'Separa finanzas personales y del negocio',
        'Tracking de clientes y proyectos',
        'Reportes para impuestos',
        'Análisis de rentabilidad',
      ],
      cta: 'Impulsa tu negocio',
    },
    {
      icon: <Business sx={{ fontSize: 60, color: theme.palette.warning.main }} />,
      title: 'Empresas',
      subtitle: 'Dashboard Ejecutivo',
      benefits: [
        'KPIs en tiempo real',
        'Múltiples usuarios y permisos',
        'Reportes personalizados',
        'Integración con sistemas existentes',
      ],
      cta: 'Escala tu empresa',
    },
  ]

  const benefits = [
    'Sin instalación, 100% web',
    'Actualizaciones automáticas',
    'Soporte técnico incluido',
    'Exporta a PDF y Excel',
    'Categorías personalizables',
    'Transacciones recurrentes',
    'Múltiples tarjetas de crédito',
    'Proyecciones financieras',
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="🚀 Nuevo: Presupuestos Inteligentes"
                sx={{
                  mb: 2,
                  bgcolor: alpha('#fff', 0.2),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <Typography
                variant="h2"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                Tus Finanzas,
                <br />
                Bajo Control
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                La plataforma más simple y poderosa para gestionar tu dinero.
                Sin complicaciones, sin hojas de cálculo.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                    },
                    py: 1.5,
                    px: 4,
                  }}
                  endIcon={<ArrowForward />}
                >
                  Comenzar Gratis
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#fff', 0.1),
                    },
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Iniciar Sesión
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '8rem', md: '12rem' },
                    opacity: 0.2,
                  }}
                >
                  💰
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Todo lo que necesitas
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Herramientas profesionales al alcance de todos
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Use Cases Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Perfecto para ti
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Sea cual sea tu situación, ContaDash se adapta a tus necesidades
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    border: 2,
                    borderColor: 'transparent',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Box mb={2}>{useCase.icon}</Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {useCase.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {useCase.subtitle}
                  </Typography>
                  <Box my={3}>
                    {useCase.benefits.map((benefit, idx) => (
                      <Box
                        key={idx}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={1}
                      >
                        <CheckCircle
                          sx={{ fontSize: 20, color: theme.palette.success.main, mr: 1 }}
                        />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Chip
                    label={useCase.cta}
                    color="primary"
                    sx={{ fontWeight: 'bold', px: 2 }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            ¿Por qué ContaDash?
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                display="flex"
                alignItems="center"
                p={2}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 2,
                }}
              >
                <CheckCircle sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  {benefit}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Comienza hoy mismo
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Únete a miles de usuarios que ya controlan sus finanzas con ContaDash
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/register')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.success.main,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9),
              },
              py: 2,
              px: 6,
              fontSize: '1.1rem',
            }}
            endIcon={<ArrowForward />}
          >
            Crear Cuenta Gratis
          </Button>
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
            No requiere tarjeta de crédito • Configuración en 2 minutos
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.grey[900], color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontFamily: 'var(--font-satisfy)',
                  fontSize: '2rem',
                  fontWeight: 400,
                }}
              >
                ContaDash
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                La forma más simple de gestionar tus finanzas personales y empresariales.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Producto
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Características
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Precios
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Seguridad
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Términos de Servicio
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Política de Privacidad
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Contacto
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box textAlign="center" mt={4} pt={4} borderTop={1} borderColor={alpha('#fff', 0.1)}>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              © 2025 ContaDash. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
