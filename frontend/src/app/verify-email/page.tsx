'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material'
import { authApi } from '@/lib/api/auth'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('Token inválido')
        setLoading(false)
        return
      }

      try {
        await authApi.verifyEmail(token)
        setSuccess(true)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al verificar el email')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [searchParams])

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5">Verificando email...</Typography>
          </Paper>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              ❌ Error
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>

            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/login')}
            >
              Ir al Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              ✅ Email Verificado
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Tu email ha sido verificado exitosamente. Ya puedes acceder a todas las
              funcionalidades de ContaDash.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/login')}
            >
              Ir al Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  return null
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <VerifyEmailForm />
    </Suspense>
  )
}
