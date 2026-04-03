import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Si ADMIN_SECRET no está en el entorno, /admin no existe
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
