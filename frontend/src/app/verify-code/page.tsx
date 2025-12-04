'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

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

      // Guardar token y usuario
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirigir al dashboard
      router.push('/dashboard')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ContaDash</h1>
          <p className="text-gray-400 text-sm">Sistema de Gestión Financiera</p>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-2 text-center">
          Verifica tu Email 📧
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Hemos enviado un código de 6 dígitos a<br />
          <span className="text-indigo-400 font-medium">{email}</span>
        </p>

        {/* Code Input */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || code.join('').length !== 6}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Verificando...' : 'Verificar Email'}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            ¿No recibiste el código?
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {resending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-yellow-500/10 border-l-4 border-yellow-500 rounded p-4">
          <p className="text-yellow-400 text-xs font-semibold mb-1">
            ⚠️ Información de Seguridad
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• El código expira en 15 minutos</li>
            <li>• Nunca compartas este código con nadie</li>
            <li>• Si no solicitaste este registro, ignora este mensaje</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
