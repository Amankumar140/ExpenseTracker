import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UploadReceipt from '../components/UploadReceipt';
import ExpenseTable from '../components/ExpenseTable';
import Analytics from '../components/Analytics';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getExpenses, getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  Receipt,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  Lightbulb,
  Check,
  Plus
} from 'lucide-react';

const Dashboard = () => {
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tabs = [
    {
      id: 'upload',
      label: 'Upload Receipt',
      icon: <UploadCloud size={18} strokeWidth={2.5} />
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Receipt size={18} strokeWidth={2.5} />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={18} strokeWidth={2.5} />
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Welcome Section - Bold Color Block Poster style */}
        <div className="relative rounded-lg p-6 sm:p-8 mb-6 overflow-hidden bg-gray-900 text-white shadow-none border-0">
          {/* Subtle Decorative Geometric Shapes (poster design) */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-md rotate-12 bg-white/5 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-md mb-3">
                {getGreeting()}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl">
                Your financial command center. Track spending, extract receipt data with OCR, and monitor cash flow effortlessly.
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-shrink-0">
              <div className="bg-gray-800 rounded-md p-4 min-w-[140px] sm:min-w-[160px] border-l-4 border-blue-500">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">This Month</p>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {statsLoading ? (
                    <div className="h-7 w-20 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    `₹${parseFloat(quickStats.thisMonthTotal || 0).toFixed(0)}`
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-md p-4 min-w-[140px] sm:min-w-[160px] border-l-4 border-emerald-500">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Tracked</p>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {statsLoading ? (
                    <div className="h-7 w-14 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    quickStats.totalExpenses
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">AI-Powered OCR</p>
                <p className="text-xs text-gray-400">99% accuracy in seconds</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Tag size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Auto Categories</p>
                <p className="text-xs text-gray-400">12 smart expense types</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Bank-Level Security</p>
                <p className="text-xs text-gray-400">End-to-end encrypted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Rigid Flat Block */}
        <div className="bg-gray-100 rounded-md p-1.5 mb-6">
          <nav className="flex flex-col sm:flex-row gap-1.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-1 py-3 px-5 text-sm font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    active
                      ? 'bg-blue-500 text-white shadow-none'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <main>
          {loading && activeTab !== 'upload' ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center border-2 border-gray-200">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="font-bold text-gray-700 text-sm uppercase tracking-wider">Loading your records...</p>
            </div>
          ) : (
            <>
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <UploadReceipt onUploadSuccess={handleUploadSuccess} />

                  {/* Pro Tips Section - Flat Card */}
                  <Card color="muted" padding="default">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 text-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lightbulb size={24} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Pro Tips for OCR Accuracy
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                              ✓
                            </span>
                            <span className="text-gray-700"><strong>Good lighting:</strong> Keep receipts flat and shadow-free.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                              ✓
                            </span>
                            <span className="text-gray-700"><strong>All details visible:</strong> Merchant name, date, and totals in frame.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                              ✓
                            </span>
                            <span className="text-gray-700"><strong>Upload promptly:</strong> Digitize quickly to avoid lost receipts.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                              ✓
                            </span>
                            <span className="text-gray-700"><strong>Verify inline:</strong> Review extracted totals and edit if needed.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'expenses' && (
                expenses.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-12 text-center border-2 border-dashed border-gray-300">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt size={32} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                        No Expenses Recorded Yet
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        Start tracking your spending by scanning your first receipt. Our OCR engine parses it automatically in seconds.
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setActiveTab('upload')}
                      >
                        <Plus size={18} strokeWidth={2.5} className="mr-2" />
                        Upload Your First Receipt
                      </Button>
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
