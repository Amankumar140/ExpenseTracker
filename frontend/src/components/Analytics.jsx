import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalytics, exportToCSV } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed'];

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
      
      // Extract available years from the data
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
      <div className={`rounded-lg shadow-md p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex justify-center items-center h-64">
          <div className={isDark ? 'text-slate-400' : 'text-gray-500'}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow-md p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="text-red-500">{error}</div>
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

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className={`rounded-xl shadow-sm p-4 transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="year-filter" className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Filter by Year:
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {selectedYear !== 'all' && (
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing expenses for <span className="font-semibold text-indigo-600">{selectedYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Expenses</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.stats.totalExpenses}</p>
        </div>
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Spent</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{analytics.stats.totalSpent}</p>
        </div>
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Average Expense</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">₹{analytics.stats.averageExpense}</p>
        </div>
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Tax</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">₹{analytics.stats.totalTax}</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={isDark ? {backgroundColor: '#1e293b', border: '1px solid #475569'} : {}} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</div>
          )}
        </div>

        {/* Monthly Spending Bar Chart */}
        <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Monthly Spending</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#000'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#000'} />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={isDark ? {backgroundColor: '#1e293b', border: '1px solid #475569'} : {}} />
                <Legend />
                <Bar dataKey="total" fill="#0088FE" name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No data available</div>
          )}
        </div>
      </div>

      {/* Category Details Table */}
      <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Category Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}">
            <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Category</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Total Spent</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Count</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Average</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {categoryData.map((cat, index) => (
                <tr key={index} className={`transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 sm:px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</td>
                  <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>₹{cat.value.toFixed(2)}</td>
                  <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>{cat.count}</td>
                  <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>₹{(cat.value / cat.count).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
