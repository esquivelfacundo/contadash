'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material'
import { authApi } from '@/lib/api/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.requestPasswordReset(email)
      // Redirigir a la página de verificación de código
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el email')
      setLoading(false)
    }
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
              ✉️ Email Enviado
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu
              contraseña.
            </Alert>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Revisa tu bandeja de entrada y sigue las instrucciones del email.
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push('/login')}
            >
              Volver al Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

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
            🔐 Recuperar Contraseña
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              autoFocus
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Enviar Enlace'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Volver al Login
                </Typography>
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}
