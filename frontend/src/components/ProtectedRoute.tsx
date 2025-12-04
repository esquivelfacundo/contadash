'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { CircularProgress, Box } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay token en localStorage
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuth(user, storedToken)
        setIsLoading(false)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        router.push('/login')
      }
    } else if (!isAuthenticated) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, setAuth, router])

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}
