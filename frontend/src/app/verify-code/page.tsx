'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Alert,
  TextField,
  Snackbar,
} from '@mui/material'
import { useAuthStore } from '@/lib/store/auth.store'

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const userIdParam = searchParams.get('userId')
    const emailParam = searchParams.get('email')
    
    if (!userIdParam || !emailParam) {
      router.push('/register')
      return
    }
    
    setUserId(userIdParam)
    setEmail(emailParam)
  }, [searchParams, router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newCode = pastedData.split('')
    
    while (newCode.length < 6) {
      newCode.push('')
    }
    
    setCode(newCode)
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await apiClient.post('/email-verification/verify', {
        userId,
        code: verificationCode,
      })

      // Guardar token y usuario en el store
      setAuth(response.data.user, response.data.token)

      // Mostrar mensaje de éxito
      setSuccessMessage('✅ Email verificado exitosamente')
      
      // Esperar 2 segundos y redirigir al login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')

    try {
      await apiClient.post('/email-verification/resend', { userId })
      alert('Código reenviado exitosamente')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar el código')
    } finally {
      setResending(false)
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
              Verifica tu Email 📧
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Hemos enviado un código de 6 dígitos a<br />
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>
                {email}
              </Box>
            </Typography>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Code Input */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                justifyContent: 'center', 
                mb: 3 
              }} 
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <TextField
                  key={index}
                  id={`code-${index}`}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  inputProps={{
                    maxLength: 1,
                    style: { 
                      textAlign: 'center', 
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      padding: '12px 0',
                    }
                  }}
                  sx={{
                    width: '50px',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              ))}
            </Box>

            {/* Verify Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={loading || code.join('').length !== 6}
              sx={{ mb: 2 }}
            >
              {loading ? 'Verificando...' : 'Verificar Email'}
            </Button>

            {/* Resend Code */}
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ¿No recibiste el código?
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </Button>
            </Box>

            {/* Security Notice */}
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                ⚠️ Información de Seguridad
              </Typography>
              <Typography variant="caption" component="div">
                • El código expira en 15 minutos<br />
                • Nunca compartas este código con nadie<br />
                • Si no solicitaste este registro, ignora este mensaje
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
