import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../config/database'
import { RegisterInput, LoginInput } from '../validations/auth.validation'
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { emailService } from './email.service'

/**
 * Create default categories for a new user
 */
async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    // INGRESOS
    { name: 'Salario', type: 'INCOME', icon: '💼', color: '#10b981' },
    { name: 'Freelance', type: 'INCOME', icon: '💻', color: '#3b82f6' },
    { name: 'Inversiones', type: 'INCOME', icon: '📈', color: '#8b5cf6' },
    { name: 'Ventas', type: 'INCOME', icon: '🛍️', color: '#06b6d4' },
    { name: 'Otros Ingresos', type: 'INCOME', icon: '💰', color: '#14b8a6' },
    
    // EGRESOS - Vivienda
    { name: 'Alquiler', type: 'EXPENSE', icon: '🏠', color: '#ef4444' },
    { name: 'Expensas', type: 'EXPENSE', icon: '🏢', color: '#f97316' },
    { name: 'Servicios', type: 'EXPENSE', icon: '💡', color: '#f59e0b' },
    
    // EGRESOS - Alimentación
    { name: 'Supermercado', type: 'EXPENSE', icon: '🛒', color: '#84cc16' },
    { name: 'Restaurantes', type: 'EXPENSE', icon: '🍽️', color: '#22c55e' },
    
    // EGRESOS - Transporte
    { name: 'Transporte', type: 'EXPENSE', icon: '🚗', color: '#06b6d4' },
    { name: 'Combustible', type: 'EXPENSE', icon: '⛽', color: '#0ea5e9' },
    
    // EGRESOS - Salud
    { name: 'Salud', type: 'EXPENSE', icon: '🏥', color: '#ec4899' },
    { name: 'Farmacia', type: 'EXPENSE', icon: '💊', color: '#f43f5e' },
    
    // EGRESOS - Entretenimiento
    { name: 'Entretenimiento', type: 'EXPENSE', icon: '🎬', color: '#a855f7' },
    { name: 'Deportes', type: 'EXPENSE', icon: '⚽', color: '#8b5cf6' },
    
    // EGRESOS - Educación
    { name: 'Educación', type: 'EXPENSE', icon: '📚', color: '#6366f1' },
    
    // EGRESOS - Tecnología
    { name: 'Tecnología', type: 'EXPENSE', icon: '💻', color: '#3b82f6' },
    { name: 'Suscripciones', type: 'EXPENSE', icon: '📱', color: '#2563eb' },
    
    // EGRESOS - Otros
    { name: 'Impuestos', type: 'EXPENSE', icon: '📋', color: '#dc2626' },
    { name: 'Seguros', type: 'EXPENSE', icon: '🛡️', color: '#b91c1c' },
    { name: 'Ropa', type: 'EXPENSE', icon: '👔', color: '#db2777' },
    { name: 'Regalos', type: 'EXPENSE', icon: '🎁', color: '#e11d48' },
    { name: 'Otros Gastos', type: 'EXPENSE', icon: '💸', color: '#64748b' },
  ]

  await prisma.category.createMany({
    data: defaultCategories.map((cat) => ({
      userId,
      name: cat.name,
      type: cat.type as 'INCOME' | 'EXPENSE',
      icon: cat.icon,
      color: cat.color,
      isDefault: false, // El usuario puede eliminarlas
    })),
  })
}

export async function register(data: RegisterInput) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new ConflictError('Email already registered')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      company: data.company,
      plan: 'FREE',
    },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      plan: true,
      createdAt: true,
    },
  })

  // Create default categories for new user
  await createDefaultCategories(user.id)

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  }

  const token = generateToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    user,
    token,
    refreshToken,
  }
}

export async function login(data: LoginInput) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new UnauthorizedError('Invalid credentials')
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials')
  }

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  }

  const token = generateToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      plan: user.plan,
      createdAt: user.createdAt,
    },
    token,
    refreshToken,
  }
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      plan: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  return user
}

/**
 * Solicitar recuperación de contraseña
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Por seguridad, no revelar si el email existe o no
    return { message: 'If the email exists, a reset link will be sent' }
  }

  // Generar token único
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Guardar token con expiración de 1 hora
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    },
  })

  // Enviar email
  await emailService.sendPasswordResetEmail(user.email, resetToken, user.name)

  return { message: 'If the email exists, a reset link will be sent' }
}

/**
 * Verificar token de reset y cambiar contraseña
 */
export async function resetPassword(token: string, newPassword: string) {
  // Hash del token para comparar
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Buscar usuario con token válido y no expirado
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw new UnauthorizedError('Invalid or expired reset token')
  }

  // Hash de la nueva contraseña
  const passwordHash = await bcrypt.hash(newPassword, 12)

  // Actualizar contraseña y limpiar tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  return { message: 'Password reset successful' }
}

/**
 * Enviar email de verificación
 */
export async function sendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new NotFoundError('User not found')
  }

  if (user.emailVerified) {
    throw new ConflictError('Email already verified')
  }

  // Generar token único
  const verificationToken = crypto.randomBytes(32).toString('hex')

  // Guardar token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
    },
  })

  // Enviar email
  await emailService.sendEmailVerification(user.email, verificationToken, user.name)

  return { message: 'Verification email sent' }
}

/**
 * Verificar email con token
 */
export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
  })

  if (!user) {
    throw new UnauthorizedError('Invalid verification token')
  }

  if (user.emailVerified) {
    throw new ConflictError('Email already verified')
  }

  // Marcar email como verificado
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
    },
  })

  return { message: 'Email verified successfully' }
}
