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
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDashboardStats();
    fetchExpenses();
    setActiveTab('expenses');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    return { text: 'Good Evening', emoji: '🌙' };
  };

  const greeting = getGreeting();
  const tabs = [
    { id: 'upload', label: 'Upload Receipt', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    )},
    { id: 'expenses', label: 'Expenses', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      <Navbar />

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className={`rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden animate-slide-up ${isDark ? 'bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-pink-950/80 border border-indigo-800/50' : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/60'}`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl animate-float animation-delay-4000"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {greeting.emoji} {greeting.text}
                </p>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Your financial command center. <span className={`font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Track smarter, spend wiser.</span>
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-3">
                <div className={`px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 ${isDark ? 'glass-dark' : 'glass'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>This Month</p>
                  <p className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-indigo-300 to-purple-300' : 'from-indigo-600 to-purple-600'}`}>
                    {statsLoading ? (
                      <span className={`inline-block w-16 h-6 rounded ${isDark ? 'skeleton-dark' : 'skeleton'}`}></span>
                    ) : `₹${parseFloat(quickStats.thisMonthTotal).toFixed(0)}`}
                  </p>
                </div>
                <div className={`px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 ${isDark ? 'glass-dark' : 'glass'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Tracked</p>
                  <p className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-indigo-300 to-purple-300' : 'from-indigo-600 to-purple-600'}`}>
                    {statsLoading ? (
                      <span className={`inline-block w-10 h-6 rounded ${isDark ? 'skeleton-dark' : 'skeleton'}`}></span>
                    ) : quickStats.totalExpenses}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '⚡', label: 'AI-Powered OCR', desc: '99% accuracy in 2.5s', delay: '' },
                { icon: '🏷️', label: 'Auto Categories', desc: '12 smart categories', delay: 'animation-delay-100' },
                { icon: '🔒', label: 'Bank-Level Security', desc: 'AES-256 encrypted', delay: 'animation-delay-200' },
              ].map((feature) => (
                <div key={feature.label} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] animate-slide-up ${feature.delay} ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-white/50'}`}>
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{feature.label}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Bar - Pill Style */}
        <div className={`rounded-2xl p-1.5 mb-6 animate-slide-up animation-delay-200 ${isDark ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-slate-100/80 border border-slate-200/50'}`}>
          <nav className="flex flex-col sm:flex-row gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 sm:px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="animate-slide-up animation-delay-300">
          {loading && activeTab !== 'upload' ? (
            <div className={`rounded-2xl p-8 sm:p-12 text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200/50'}`}>
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'upload' && (
                <>
                  <UploadReceipt onUploadSuccess={handleUploadSuccess} />
                  
                  {/* Pro Tips Section */}
                  <div className={`mt-6 rounded-2xl p-6 animate-slide-up animation-delay-400 ${isDark ? 'glass-dark' : 'glass'}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Pro Tips for Best Results</h3>
                        <ul className={`space-y-2.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {[
                            { tip: 'Clear photos:', detail: 'Ensure receipts are well-lit and all text is readable' },
                            { tip: 'Flat surface:', detail: 'Place receipts on a flat surface for better OCR accuracy' },
                            { tip: 'Upload promptly:', detail: 'Process receipts right away - don\'t lose track of expenses!' },
                            { tip: 'Review & edit:', detail: 'Always verify extracted data for 100% accuracy' },
                          ].map((item) => (
                            <li key={item.tip} className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-bold mt-0.5 text-base">✓</span>
                              <span><strong>{item.tip}</strong> {item.detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'expenses' && (
                expenses.length === 0 ? (
                  <div className={`rounded-2xl p-8 sm:p-12 text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
                    <div className="max-w-md mx-auto">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                        <svg className={`w-10 h-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105"
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
