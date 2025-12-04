import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware deshabilitado - usamos ProtectedRoute component en su lugar
// porque Next.js middleware no tiene acceso a localStorage
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
