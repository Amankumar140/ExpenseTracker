import { useState } from 'react';
import { updateExpense, deleteExpense } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_STYLES = {
  'Food & Dining': { badge: 'badge-food', dot: 'bg-amber-400' },
  'Groceries': { badge: 'badge-groceries', dot: 'bg-emerald-400' },
  'Transportation': { badge: 'badge-transport', dot: 'bg-blue-400' },
  'Shopping': { badge: 'badge-shopping', dot: 'bg-pink-400' },
  'Entertainment': { badge: 'badge-entertainment', dot: 'bg-violet-400' },
  'Healthcare': { badge: 'badge-healthcare', dot: 'bg-red-400' },
  'Utilities': { badge: 'badge-utilities', dot: 'bg-sky-400' },
  'Travel': { badge: 'badge-travel', dot: 'bg-teal-400' },
  'Education': { badge: 'badge-education', dot: 'bg-indigo-400' },
  'Personal Care': { badge: 'badge-personal', dot: 'bg-orange-400' },
  'Insurance': { badge: 'badge-insurance', dot: 'bg-slate-400' },
  'Other': { badge: 'badge-other', dot: 'bg-zinc-400' },
};

const ExpenseTable = ({ expenses, onUpdate, onDelete }) => {
  const { isDark } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = Object.keys(CATEGORY_STYLES);

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      merchant: expense.merchant,
      date: expense.date,
      total: expense.total,
      tax: expense.tax,
      category: expense.category,
      notes: expense.notes || ''
    });
  };

  const handleSave = async (id) => {
    try {
      await updateExpense(id, editForm);
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        if (onDelete) onDelete();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete expense');
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredExpenses = expenses
    .filter(exp => !filterCategory || exp.category === filterCategory)
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => {
    const isActive = sortField === field;
    return (
      <span className={`ml-1 inline-flex transition-colors ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
        {!isActive ? '↕' : sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const ConfidenceBar = ({ value, color }) => (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-1.5 rounded-full overflow-hidden max-w-[60px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span className={`text-xs font-semibold min-w-[32px] ${
        value >= 70 ? 'text-emerald-500' : value >= 40 ? 'text-amber-500' : 'text-red-500'
      }`}>{value}%</span>
    </div>
  );

  const getCatStyle = (category) => CATEGORY_STYLES[category] || CATEGORY_STYLES['Other'];

  return (
    <div className={`rounded-2xl shadow-sm transition-all duration-300 animate-scale-in ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Expenses</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sortedAndFilteredExpenses.length} records</p>
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium border transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className={isDark ? 'bg-slate-700/30' : 'bg-slate-50/80'}>
              {[
                { label: 'Merchant', field: 'merchant', sortable: true },
                { label: 'Date', field: 'date', sortable: true },
                { label: 'Total', field: 'total', sortable: true },
                { label: 'Tax', field: null, sortable: false },
                { label: 'Category', field: 'category', sortable: true },
                { label: 'Confidence', field: null, sortable: false },
                { label: 'AI Source', field: null, sortable: false },
                { label: 'Actions', field: null, sortable: false },
              ].map(col => (
                <th
                  key={col.label}
                  className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                    col.sortable ? 'cursor-pointer' : ''
                  } ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => col.sortable && handleSort(col.field)}
                >
                  {col.label} {col.sortable && <SortIcon field={col.field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
            {sortedAndFilteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="8" className={`px-4 py-12 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📋</span>
                    <span>No expenses found</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedAndFilteredExpenses.map((expense, index) => (
                <tr
                  key={expense._id}
                  className={`transition-all duration-200 group animate-slide-up ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-indigo-50/30'}`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {editingId === expense._id ? (
                    // Edit mode
                    <>
                      <td className="px-4 py-3">
                        <input type="text" value={editForm.merchant} onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                          className={`border rounded-lg px-3 py-1.5 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className={`border rounded-lg px-3 py-1.5 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" step="0.01" value={editForm.total} onChange={(e) => setEditForm({...editForm, total: parseFloat(e.target.value)})}
                          className={`border rounded-lg px-3 py-1.5 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" step="0.01" value={editForm.tax} onChange={(e) => setEditForm({...editForm, tax: parseFloat(e.target.value)})}
                          className={`border rounded-lg px-3 py-1.5 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className={`border rounded-lg px-3 py-1.5 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}
                        >
                          {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleSave(expense._id)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all" title="Save">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} title="Cancel">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Display mode
                    <>
                      <td className={`px-4 py-3.5 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{expense.merchant}</td>
                      <td className={`px-4 py-3.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{expense.date}</td>
                      <td className={`px-4 py-3.5 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{expense.total.toFixed(2)}</td>
                      <td className={`px-4 py-3.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{(expense.tax || 0).toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${getCatStyle(expense.category).badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getCatStyle(expense.category).dot}`}></span>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ConfidenceBar
                          value={expense.confidence}
                          color={expense.confidence >= 70 ? 'bg-emerald-500' : expense.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        {expense.categorizationSource === 'ml' ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                            🤖 ML {Math.round(expense.mlConfidence * 100)}%
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                            📏 Rules
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => handleEdit(expense)}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-blue-500/10 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`} title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(expense._id)}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`} title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {sortedAndFilteredExpenses.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-3xl block mb-2">📋</span>
            No expenses found
          </div>
        ) : (
          sortedAndFilteredExpenses.map((expense, index) => (
            <div
              key={expense._id}
              className={`rounded-xl p-4 border transition-all duration-200 animate-slide-up ${isDark ? 'bg-slate-700/30 border-slate-700/50 hover:bg-slate-700/50' : 'bg-white border-slate-200 hover:shadow-md'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {editingId === expense._id ? (
                <div className="space-y-3">
                  <input type="text" value={editForm.merchant} onChange={(e) => setEditForm({...editForm, merchant: e.target.value})} placeholder="Merchant"
                    className={`border rounded-lg px-3 py-2 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} placeholder="Date"
                      className={`border rounded-lg px-3 py-2 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`} />
                    <input type="number" step="0.01" value={editForm.total} onChange={(e) => setEditForm({...editForm, total: parseFloat(e.target.value)})} placeholder="Total"
                      className={`border rounded-lg px-3 py-2 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`} />
                  </div>
                  <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className={`border rounded-lg px-3 py-2 w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`}>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(expense._id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold">Save</button>
                    <button onClick={() => setEditingId(null)} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{expense.merchant}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{expense.date}</p>
                    </div>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{expense.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${getCatStyle(expense.category).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getCatStyle(expense.category).dot}`}></span>
                      {expense.category}
                    </span>
                    {expense.categorizationSource === 'ml' ? (
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>🤖 ML</span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>📏 Rules</span>
                    )}
                    <ConfidenceBar value={expense.confidence} color={expense.confidence >= 70 ? 'bg-emerald-500' : expense.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(expense)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${isDark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(expense._id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTable;
