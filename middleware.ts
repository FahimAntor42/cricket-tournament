import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through requests to let client-side code handle authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};





