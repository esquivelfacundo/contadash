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
  Card,
  CardContent,
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontFamily: 'var(--font-satisfy)',
                  fontSize: '3rem',
                  fontWeight: 400,
                }}
              >
                ContaDash
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Gestión Financiera
              </Typography>
            </Box>

            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
              Recuperar Contraseña 🔐
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Ingresa tu email y te enviaremos un código de verificación
            </Typography>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
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
                {loading ? <CircularProgress size={24} /> : 'Enviar Código'}
              </Button>

              <Box textAlign="center">
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Volver al Login
                  </Typography>
                </Link>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
