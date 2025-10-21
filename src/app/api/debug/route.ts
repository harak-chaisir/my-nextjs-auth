import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API called');
    console.log('🔍 Environment variables:');
    console.log('  AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);
    console.log('  AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
    console.log('  AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
    console.log('  AUTH0_SECRET exists:', !!process.env.AUTH0_SECRET);
    console.log('  AUTH0_CLIENT_SECRET exists:', !!process.env.AUTH0_CLIENT_SECRET);
    
    const session = await auth0.getSession();
    console.log('🔍 Session:', session ? 'Found' : 'Not found');
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session found',
        envCheck: {
          domain: !!process.env.AUTH0_ISSUER_BASE_URL,
          clientId: !!process.env.AUTH0_CLIENT_ID,
          clientSecret: !!process.env.AUTH0_CLIENT_SECRET,
          secret: !!process.env.AUTH0_SECRET,
          baseUrl: process.env.AUTH0_BASE_URL
        }
      });
    }

    console.log('🔍 User object:', JSON.stringify(session.user, null, 2));

    return NextResponse.json({
      authenticated: true,
      message: 'Session found and valid',
      user: {
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture,
        sub: session.user.sub,
        roles: session.user['https://my-app.example.com/roles'] || 'No custom roles found'
      },
      fullUser: session.user // This will show the complete user object
    });
  } catch (error) {
    console.error('🚨 Debug API error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}