import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getAnalytics, exportToCSV } from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import StatCard from './ui/StatCard';
import { TOKENS } from '../tokens';
import {
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

const STAT_CONFIGS = [
  {
    key: 'totalExpenses',
    label: 'Total Expenses',
    icon: Receipt,
    variant: 'blue',
    format: (v) => v || 0
  },
  {
    key: 'totalSpent',
    label: 'Total Spent',
    icon: DollarSign,
    variant: 'rose',
    format: (v) => `-₹${v || 0}`
  },
  {
    key: 'averageExpense',
    label: 'Average Expense',
    icon: TrendingUp,
    variant: 'amber',
    format: (v) => `₹${v || 0}`
  },
  {
    key: 'totalTax',
    label: 'Total Tax',
    icon: FileSpreadsheet,
    variant: 'emerald',
    format: (v) => `₹${v || 0}`
  },
];

const Analytics = () => {
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
      setError('Failed to load analytics data');
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg p-6 bg-gray-100 animate-pulse h-32 border-0"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-lg p-6 bg-gray-100 animate-pulse h-80 border-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card color="rose" padding="default" className="text-center border-2 border-red-500">
        <p className="text-red-700 font-bold">{error}</p>
      </Card>
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

  // Rule 4 & 8: Flat solid tooltip - zero blur, zero shadows, high contrast
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-gray-900 text-white rounded-md border-2 border-gray-900 shadow-none text-xs">
          <p className="font-extrabold uppercase tracking-wider text-gray-300">
            {payload[0].name || payload[0].payload.month || payload[0].payload.name}
          </p>
          <p className="font-black text-sm text-blue-400 mt-0.5">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Year Filter & Export Bar - Rigid Flat Color Block */}
      <div className="rounded-lg p-4 bg-gray-100 border-2 border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mr-2">
            <Calendar size={15} strokeWidth={2.5} /> Filter Year:
          </span>
          <button
            onClick={() => setSelectedYear('all')}
            type="button"
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
              selectedYear === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              type="button"
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                selectedYear === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          className="bg-white hover:bg-gray-200 text-gray-900"
        >
          <Download size={15} strokeWidth={2.5} className="mr-1.5" />
          Export CSV Data
        </Button>
      </div>

      {/* Summary Stat Cards - Rule 6: color-block cards using tints with bold stat numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIGS.map((config) => (
          <StatCard
            key={config.key}
            label={config.label}
            value={config.format(analytics.stats[config.key])}
            icon={config.icon}
            variant={config.variant}
          />
        ))}
      </div>

      {/* Flat Charts Grid - Rule 4: solid fills only, no gradients, no glow, no shadow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spending by Category - Donut Chart */}
        <Card color="white" padding="default" className="border-2 border-gray-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
              <PieIcon size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Spending by Category
            </h3>
          </div>

          {categoryData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TOKENS.chartColors[index % TOKENS.chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Stat - Pure Typography */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total</span>
                <span className="text-xl font-black text-gray-900">₹{totalSpentNum.toFixed(0)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 font-bold text-sm">
              No category data available
            </div>
          )}
        </Card>

        {/* Monthly Spending - Flat Solid Bar Chart */}
        <Card color="white" padding="default" className="border-2 border-gray-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BarChart3 size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Monthly Spending
            </h3>
          </div>

          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                {/* Flat Cartesian grid */}
                <CartesianGrid strokeDasharray="0" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Flat Solid Fill Primary Blue (#3B82F6) */}
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Monthly Total"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-gray-400 font-bold text-sm">
              No monthly data available
            </div>
          )}
        </Card>
      </div>

      {/* Category Breakdown Table - Flat Design Rule 7 */}
      <div className="rounded-lg bg-white border-2 border-gray-100 overflow-hidden">
        <div className="p-5 border-b-2 border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider">
            Detailed Category Distribution
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider">Total Spent</th>
                <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider">Budget Share</th>
                <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider">Count</th>
                <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider">Average</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((cat, index) => {
                const percentage = (cat.value / totalSpentNum) * 100;
                const isEven = index % 2 === 0;
                const rowBg = isEven ? 'bg-white' : 'bg-gray-50';

                return (
                  <tr key={index} className={`${rowBg} hover:bg-blue-50/70 transition-colors`}>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: TOKENS.chartColors[index % TOKENS.chartColors.length] }}
                        />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-extrabold text-red-600">
                      -₹{cat.value.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden max-w-[120px]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: TOKENS.chartColors[index % TOKENS.chartColors.length]
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 min-w-[36px]">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-700">{cat.count} txns</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-700">₹{(cat.value / cat.count).toFixed(2)}</td>
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
