import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/monthly',
    '/balance',
    '/budgets',
    '/analytics',
    '/settings',
    '/profile',
  ]

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/monthly/:path*',
    '/balance/:path*',
    '/budgets/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
}
