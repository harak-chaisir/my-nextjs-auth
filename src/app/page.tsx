import { auth0 } from "@/lib/auth/auth0";
import { redirect } from 'next/navigation';
import { createRBACContext, getDefaultRedirect } from '@/lib/rbac';
import './globals.css';

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If session exists, redirect based on user role
  if (session) {
    console.log('🔍 Session found, creating RBAC context...', session);
    const rbacContext = createRBACContext(session.user, session);
    console.log('🔍 User roles detected:', rbacContext.user.roles);
    const redirectPath = getDefaultRedirect(rbacContext.user.roles);
    console.log('🔍 Redirecting to:', redirectPath);
    redirect(redirectPath);
  }

  // If no session, show beautiful landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to
            <span className="text-blue-600 dark:text-blue-400"> SecureApp</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A modern, secure authentication system built with Next.js and Auth0. 
            Experience seamless login and robust security for your applications.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Authentication</h3>
            <p className="text-gray-600 dark:text-gray-300">Industry-standard security with Auth0 integration</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-300">Optimized performance with Next.js 15</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Responsive Design</h3>
            <p className="text-gray-600 dark:text-gray-300">Beautiful UI that works on all devices</p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="text-center">
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a href="/auth/login" className="inline-block">
              <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105">
                Sign In
              </button>
            </a>
            <a href="/auth/login?screen_hint=signup" className="inline-block">
              <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105">
                Create Account
              </button>
            </a>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Free to use • No credit card required • Secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}