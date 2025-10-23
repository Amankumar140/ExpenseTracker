import { useState } from 'react';
import { updateExpense, deleteExpense } from '../services/api';

const ExpenseTable = ({ expenses, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = [
    'Food & Dining', 'Groceries', 'Transportation', 'Shopping',
    'Entertainment', 'Healthcare', 'Utilities', 'Travel',
    'Education', 'Personal Care', 'Insurance', 'Other'
  ];

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
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('merchant')}
              >
                Merchant <SortIcon field="merchant" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon field="date" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                Total <SortIcon field="total" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tax
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                Category <SortIcon field="category" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No expenses found. Upload a receipt to get started!
                </td>
              </tr>
            ) : (
              sortedAndFilteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  {editingId === expense._id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.merchant}
                          onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.total}
                          onChange={(e) => setEditForm({...editForm, total: parseFloat(e.target.value)})}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.tax}
                          onChange={(e) => setEditForm({...editForm, tax: parseFloat(e.target.value)})}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSave(expense._id)}
                          className="text-green-600 hover:text-green-700 mr-2 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.merchant}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${expense.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${(expense.tax || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`font-medium ${expense.confidence >= 70 ? 'text-green-600' : expense.confidence >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {expense.confidence}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-700 mr-3 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
