import { auth0 } from "@/lib/auth/auth0";
import { redirect } from 'next/navigation';

export default async function MessagesPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage your messages and communications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">SA</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Support Team</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Welcome to SecureApp! How can we help?</p>
                </div>
                <div className="text-xs text-gray-400">2m</div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">SY</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">System</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Your profile has been updated successfully</p>
                </div>
                <div className="text-xs text-gray-400">1h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SA</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support Team</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="p-6 h-96 overflow-y-auto space-y-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">SA</span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Welcome to SecureApp! We&apos;re here to help you get the most out of your account. 
                    Is there anything specific you&apos;d like assistance with today?
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <div className="flex-1 flex justify-end">
                <div className="bg-blue-500 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-white">
                    Hi! Thanks for reaching out. I&apos;m just exploring the dashboard features.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Message Input */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}