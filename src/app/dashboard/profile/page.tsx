import { auth0 } from "@/lib/auth/auth0";
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/');
  }

  const user = session.user;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {user.name || user.nickname || 'User'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  {user.email_verified ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-600 dark:text-green-400 text-sm">Email Verified</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-600 dark:text-red-400 text-sm">Email Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
                Change Picture
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Personal Information
            </h4>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={user.nickname || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your nickname"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={user.sub || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This is your unique user identifier and cannot be changed.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
                <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Account Security
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Password</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Change your account password</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200">
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Login History</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your recent login activity</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}