'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  Container,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth.store'

const registerSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password debe tener al menos 8 caracteres'),
  company: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      setError('')
      const response = await authApi.register(data)
      
      // Si requiere verificación, redirigir a la página de verificación
      if (response.requiresVerification) {
        router.push(`/verify-code?userId=${response.user.id}&email=${response.user.email}`)
      } else {
        // Si no requiere verificación (backward compatibility)
        setAuth(response.user, response.token)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #CD9FCC 0%, #0A014F 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
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
                Crear nueva cuenta
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Nombre"
                margin="normal"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Empresa (opcional)"
                margin="normal"
                {...register('company')}
                error={!!errors.company}
                helperText={errors.company?.message}
                disabled={loading}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes cuenta?{' '}
                  <MuiLink href="/login" underline="hover">
                    Inicia sesión
                  </MuiLink>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
