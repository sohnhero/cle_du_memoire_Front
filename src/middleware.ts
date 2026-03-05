import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Temporarily deactivated as per user request
    return NextResponse.next();

    /* 
    const user = "user";
    const password = "12345";

    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [providedUser, providedPassword] = atob(authValue).split(':');

        if (providedUser === user && providedPassword === password) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
    */
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
