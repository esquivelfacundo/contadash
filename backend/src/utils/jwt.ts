import jwt from 'jsonwebtoken'
import { config } from '../config/app'

export interface JwtPayload {
  userId: string
  email: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  })
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '30d',
  })
}
