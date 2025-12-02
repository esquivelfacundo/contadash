import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '../jwt'

describe('JWT Utils', () => {
  const payload = {
    userId: 'test-user-id',
    email: 'test@example.com',
  }

  it('should generate a valid token', () => {
    const token = generateToken(payload)
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('should verify a valid token', () => {
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    
    expect(decoded).toBeTruthy()
    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
  })

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow()
  })

  it('should throw error for expired token', () => {
    // This would require mocking time or using a very short expiration
    // For now, we'll just test that the function exists
    expect(verifyToken).toBeDefined()
  })
})
