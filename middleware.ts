import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/documents", 
  "/notifications",
  "/settings"
];

// API routes that require authentication
const protectedApiRoutes = [
  "/api/documents",
  "/api/upload",
  "/api/notifications",
  "/api/dashboard",
  "/api/settings"
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    
    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    );

    // If no token and trying to access protected route, redirect to login
    if (!token && (isProtectedRoute || isProtectedApiRoute)) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For API routes, return 401 instead of redirect
    if (!token && isProtectedApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Allow access to protected routes if authenticated
    if (token && (isProtectedRoute || isProtectedApiRoute)) {
      return NextResponse.next();
    }

    // Allow access to public routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For API routes, we handle authorization in the middleware function
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true; // Let the middleware function handle it
        }
        return !!token;
      },
    },
  }
);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|auth/login|auth/register).*)",
  ],
};