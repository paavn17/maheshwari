import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const rolePaths = {
  'student': ['/student'],
  'employee': ['/employee'],
  'institution admin': ['/institute'],
  'super admin': ['/admin']
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtected = Object.values(rolePaths).some(paths =>
    paths.some(prefix => pathname.startsWith(prefix))
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role;

    const allowedPaths = rolePaths[userRole] || [];
    const isAllowed = allowedPaths.some(prefix => pathname.startsWith(prefix));

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/student/:path*',
    '/employee/:path*',
    '/institute/:path*',
    '/admin/:path*'
  ]
};
