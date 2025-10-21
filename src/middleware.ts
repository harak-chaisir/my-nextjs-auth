import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth/auth0";

const ROLES_NAMESPACE = 'https://my-app.example.com/roles';

export async function middleware(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return auth0.middleware(request);
  }

  const roles = ((session.idToken as Record<string, unknown>)?.[ROLES_NAMESPACE] as string[]) || [];
  console.log('User roles from token:', roles);

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};