interface NavigationProps {
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              SecureApp
            </a>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <a href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Admin Dashboard
              </a>
              <div className="flex items-center space-x-3">
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {user.name || user.email}
                </span>
              </div>
              <a href="/auth/logout">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200">
                  Sign Out
                </button>
              </a>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a href="/auth/login">
                <button className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg transition duration-200">
                  Sign In
                </button>
              </a>
              <a href="/auth/login?screen_hint=signup">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                  Sign Up
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}