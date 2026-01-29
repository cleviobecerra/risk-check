import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const userId = request.cookies.get('userId')?.value
    const userRole = request.cookies.get('userRole')?.value
    const { pathname } = request.nextUrl

    if (!userId) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/dashboard/solicitante') && userRole !== 'SOLICITANTE') {
        return NextResponse.redirect(new URL('/dashboard/testeador', request.url))
    }

    if (pathname.startsWith('/dashboard/testeador') && userRole !== 'TESTEADOR') {
        return NextResponse.redirect(new URL('/dashboard/solicitante', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*',
}
