import { auth0 } from "@/lib/auth/auth0";
import { redirect } from 'next/navigation';

export default async function SupportPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Get help and find answers to common questions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Help */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">How do I change my password?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    You can change your password by going to Profile Settings → Security → Change Password.
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">How do I enable two-factor authentication?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Navigate to Settings → Privacy & Security → Two-Factor Authentication and click Enable.
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">Can I export my data?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Yes, you can export your account data from Settings → Privacy & Security → Data Export.
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">How do I delete my account?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Account deletion can be done from Settings → Danger Zone. This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Contact Support
            </h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="What can we help you with?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option>General Question</option>
                  <option>Technical Issue</option>
                  <option>Account Problem</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Support Resources */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">support@secureapp.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Live Chat</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition duration-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>View Documentation</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition duration-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Watch Tutorials</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition duration-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span>Join Community</span>
                </div>
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}