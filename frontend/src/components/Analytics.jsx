import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalytics, exportToCSV } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1'];

const STAT_CONFIGS = [
  { key: 'totalExpenses', label: 'Total Expenses', icon: '📊', gradient: 'from-blue-500 to-indigo-500', format: (v) => v },
  { key: 'totalSpent', label: 'Total Spent', icon: '💰', gradient: 'from-emerald-500 to-green-500', format: (v) => `₹${v}` },
  { key: 'averageExpense', label: 'Average Expense', icon: '📈', gradient: 'from-violet-500 to-purple-500', format: (v) => `₹${v}` },
  { key: 'totalTax', label: 'Total Tax', icon: '🏛️', gradient: 'from-amber-500 to-orange-500', format: (v) => `₹${v}` },
];

const Analytics = () => {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = selectedYear !== 'all' ? { year: selectedYear } : {};
      const data = await getAnalytics(params);
      setAnalytics(data);
      
      if (data.availableYears) {
        setAvailableYears(data.availableYears);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = selectedYear !== 'all' ? { year: selectedYear } : {};
      await exportToCSV(params);
    } catch (err) {
      alert('Failed to export CSV');
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
              <div className={`h-4 w-24 rounded mb-3 ${isDark ? 'skeleton-dark' : 'skeleton'}`}></div>
              <div className={`h-8 w-32 rounded ${isDark ? 'skeleton-dark' : 'skeleton'}`}></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
              <div className={`h-6 w-48 rounded mb-4 ${isDark ? 'skeleton-dark' : 'skeleton'}`}></div>
              <div className={`h-64 rounded ${isDark ? 'skeleton-dark' : 'skeleton'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
        <span className="text-3xl block mb-3">⚠️</span>
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count
  }));

  const monthlyData = Object.entries(analytics.monthlySpending || {}).map(([month, total]) => ({
    month,
    total
  }));

  const totalSpentNum = parseFloat(analytics.stats.totalSpent) || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-4 py-3 rounded-xl shadow-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{payload[0].name || payload[0].payload.month || payload[0].payload.name}</p>
          <p className="text-sm font-bold text-indigo-500">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Year Filter & Export */}
      <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
        <div className="flex items-center gap-3">
          <label htmlFor="year-filter" className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            📅 Filter by Year:
          </label>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedYear === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : isDark ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                    : isDark ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIGS.map((config, i) => (
          <div
            key={config.key}
            className={`rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] animate-slide-up ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{config.label}</h3>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg text-lg`}>
                {config.icon}
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {config.format(analytics.stats[config.key])}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className={`rounded-2xl p-5 sm:p-6 animate-slide-up animation-delay-200 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span className="text-xl">🍩</span> Spending by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  fill="#8884d8"
                  dataKey="value"
                  cornerRadius={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {/* Center Label */}
                <text x="50%" y="47%" textAnchor="middle" className="text-xs" fill={isDark ? '#94a3b8' : '#64748b'}>Total</text>
                <text x="50%" y="56%" textAnchor="middle" className="text-sm font-bold" fill={isDark ? '#fff' : '#1e293b'}>₹{totalSpentNum.toFixed(0)}</text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="text-3xl block mb-2">📊</span>
              No data available
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className={`rounded-2xl p-5 sm:p-6 animate-slide-up animation-delay-300 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span className="text-xl">📊</span> Monthly Spending
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="text-3xl block mb-2">📊</span>
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Category Details Table */}
      <div className={`rounded-2xl overflow-hidden animate-slide-up animation-delay-400 ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
        <div className="p-5 sm:p-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span className="text-xl">📋</span> Category Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={isDark ? 'bg-slate-700/30' : 'bg-slate-50/80'}>
                <th className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</th>
                <th className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Spent</th>
                <th className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Share</th>
                <th className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Count</th>
                <th className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              {categoryData.map((cat, index) => {
                const percentage = (cat.value / totalSpentNum) * 100;
                return (
                  <tr key={index} className={`transition-all duration-200 ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-indigo-50/30'}`}>
                    <td className={`px-6 py-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        {cat.name}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{cat.value.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden max-w-[100px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                        </div>
                        <span className={`text-xs font-semibold min-w-[36px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cat.count}</td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>₹{(cat.value / cat.count).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
