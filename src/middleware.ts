import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './utils/server/verifyToken';

const PUBLIC_ROUTES = ['/', '/user-authentication', '/searched-profile']
const PUBLIC_API_ROUTES = [
    '/api/auth/user/auth-forgot-password',
    '/api/auth/user/auth-signup',
    '/api/auth/user/forgot-password',
    '/api/auth/user/signin',
    '/api/auth/user/signup',
    '/api/auth/user/user-otp',
    '/api/auth/status',
];

const API_PREFIX = '/api'

function isAuthPage(pathname: string) {
    return PUBLIC_ROUTES.includes(pathname)
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isPublicApi(pathname: string) {
    return PUBLIC_API_ROUTES.includes(pathname)
}

function isApiRoute(pathname: string) {
    return pathname.startsWith(API_PREFIX)
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get(process.env.NEXT_TOKEN!)?.value || ''
    // console.log('[Middleware] Token seen:', token);
    const { pathname } = request.nextUrl

    let isAuthenticated = false

    try {
        const payload = await verifyToken(token)
        isAuthenticated = !!payload        
        // console.log('[Middleware] Decoded token:', payload);
    } catch (err) {
        console.error('[Middleware] Token verification failed:', err);
        isAuthenticated = false;
    }


    // Protected App Routes
    if (!isAuthenticated && !isAuthPage(pathname) && !isApiRoute(pathname)) {
        return NextResponse.redirect(new URL('/user-authentication', request.url))
    }

    if (isAuthenticated && pathname === '/user-authentication') {
        const referer = request.headers.get('referer') || '/'
        return NextResponse.redirect(new URL(referer, request.url))
    }

    //Protected API Routes
    // if (isApiRoute(pathname) && !isAuthenticated && !isPublicApi(pathname)) {
    //     console.log('Protected API Routes error*****');
    //     return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
    //         status: 401,
    //         headers: { 'Content-Type': 'application/json' },
    //     })
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'], // Intercepts all except Next internals
}
