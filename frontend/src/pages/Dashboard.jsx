import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UploadReceipt from '../components/UploadReceipt';
import ExpenseTable from '../components/ExpenseTable';
import Analytics from '../components/Analytics';
import { getExpenses, getDashboardStats } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalExpenses: 0,
    thisMonthTotal: '0',
    totalSpent: '0',
    thisMonthCount: 0,
    lastExpense: null
  });

  useEffect(() => {
    // Load dashboard stats on mount
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'expenses' || activeTab === 'analytics') {
      fetchExpenses();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getDashboardStats();
      setQuickStats(stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data.expenses);
      // Refresh stats after fetching expenses
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDashboardStats(); // Refresh stats immediately
    fetchExpenses(); // Fetch expenses list
    setActiveTab('expenses');
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <Navbar />

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className={`rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden transition-colors ${isDark ? 'bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-indigo-800' : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200'}`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Your financial command center. <span className="font-semibold text-indigo-600 dark:text-indigo-400">Track smarter, spend wiser.</span>
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className={`px-4 py-3 rounded-xl backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-indigo-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>This Month</p>
                  <p className={`text-xl font-bold bg-gradient-to-r  bg-clip-text text-transparent ${isDark?"from-indigo-200 to-purple-200":"from-indigo-600 to-purple-600"}`}>
                    {statsLoading ? '...' : `₹${parseFloat(quickStats.thisMonthTotal).toFixed(0)}`}
                  </p>
                </div>
                <div className={`px-4 py-3 rounded-xl backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-indigo-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Tracked</p>
                  <p className={`text-xl font-bold bg-gradient-to-r ${isDark?"from-indigo-200 to-purple-200":"from-indigo-600 to-purple-600"} bg-clip-text text-transparent`}>
                    {statsLoading ? '...' : quickStats.totalExpenses}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AI-Powered OCR</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>99% accuracy in 2.5s</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Auto Categories</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>12 smart categories</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bank-Level Security</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AES-256 encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`rounded-xl shadow-sm mb-6 overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <nav className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Receipt
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Expenses
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main>
          {loading && activeTab !== 'upload' ? (
            <div className={`rounded-xl shadow-sm p-8 sm:p-12 text-center transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'upload' && (
                <>
                  <UploadReceipt onUploadSuccess={handleUploadSuccess} />
                  
                  {/* Pro Tips Section */}
                  <div className={`mt-6 rounded-xl p-6 transition-colors ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>💡 Pro Tips for Best Results</h3>
                        <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span><strong>Clear photos:</strong> Ensure receipts are well-lit and all text is readable</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span><strong>Flat surface:</strong> Place receipts on a flat surface for better OCR accuracy</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span><strong>Upload promptly:</strong> Process receipts right away - don't lose track of expenses!</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span><strong>Review & edit:</strong> Always verify extracted data for 100% accuracy</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'expenses' && (
                expenses.length === 0 ? (
                  <div className={`rounded-xl p-8 sm:p-12 text-center transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Expenses Yet 🚀
                      </h3>
                      <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Start tracking your expenses by uploading your first receipt. It only takes seconds!
                      </p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Your First Receipt
                      </button>
                    </div>
                  </div>
                ) : (
                  <ExpenseTable 
                    expenses={expenses} 
                    onUpdate={fetchExpenses}
                    onDelete={fetchExpenses}
                  />
                )
              )}
              {activeTab === 'analytics' && <Analytics />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
