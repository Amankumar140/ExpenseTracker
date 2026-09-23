import { useState } from 'react';
import { updateExpense, deleteExpense } from '../services/api';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { TOKENS } from '../tokens';
import {
  Receipt,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Bot,
  Filter,
  ArrowDownRight
} from 'lucide-react';

const ExpenseTable = ({ expenses, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = Object.keys(TOKENS.categoryColors);

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      merchant: expense.merchant,
      date: expense.date,
      total: expense.total !== null && expense.total !== undefined ? expense.total : '',
      tax: expense.tax !== null && expense.tax !== undefined ? expense.tax : '',
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
    if (window.confirm('Are you sure you want to delete this expense record?')) {
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
    if (!isActive) return <ArrowUpDown size={14} strokeWidth={2.5} className="ml-1 text-gray-400" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={14} strokeWidth={2.5} className="ml-1 text-blue-600" />
      : <ArrowDown size={14} strokeWidth={2.5} className="ml-1 text-blue-600" />;
  };

  const ConfidenceBar = ({ value }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden max-w-[64px]">
        <div
          className={`h-full rounded-full ${
            value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span className="text-xs font-bold text-gray-700 min-w-[32px]">{value}%</span>
    </div>
  );

  return (
    <div className="rounded-lg bg-white border-2 border-gray-100 shadow-none overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 gap-4 border-b-2 border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
            <Receipt size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Expense Records</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {sortedAndFilteredExpenses.length} Total Transactions
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <div className="w-56">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 text-xs font-bold"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Desktop Table - Rule 7: no row borders, alternate white / gray-100 rows, sticky solid header */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="sticky top-0 bg-gray-100 text-gray-900 z-10">
              {[
                { label: 'Merchant', field: 'merchant', sortable: true },
                { label: 'Date', field: 'date', sortable: true },
                { label: 'Total Amount', field: 'total', sortable: true },
                { label: 'Tax', field: null, sortable: false },
                { label: 'Category', field: 'category', sortable: true },
                { label: 'Confidence', field: null, sortable: false },
                { label: 'AI Source', field: null, sortable: false },
                { label: 'Actions', field: null, sortable: false },
              ].map(col => (
                <th
                  key={col.label}
                  className={`px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider select-none ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.field)}
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.sortable && <SortIcon field={col.field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-gray-500 bg-white">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt size={36} strokeWidth={2} className="text-gray-300" />
                    <span className="font-bold text-sm">No expenses match your criteria</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedAndFilteredExpenses.map((expense, index) => {
                const isEven = index % 2 === 0;
                const rowBg = isEven ? 'bg-white' : 'bg-gray-50';

                return (
                  <tr
                    key={expense._id}
                    className={`transition-colors duration-150 ${rowBg} hover:bg-blue-50/70 border-0`}
                  >
                    {editingId === expense._id ? (
                      /* Inline Edit Mode */
                      <>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={editForm.merchant}
                            onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                            className="w-full bg-white border-2 border-blue-500 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full bg-white border-2 border-blue-500 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.total}
                            onChange={(e) => setEditForm({ ...editForm, total: parseFloat(e.target.value) })}
                            className="w-full bg-white border-2 border-blue-500 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.tax}
                            onChange={(e) => setEditForm({ ...editForm, tax: parseFloat(e.target.value) })}
                            className="w-full bg-white border-2 border-blue-500 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full bg-white border-2 border-blue-500 rounded-md px-2 py-1 text-xs font-semibold focus:outline-none"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSave(expense._id)}
                              type="button"
                              className="p-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                              title="Save Changes"
                            >
                              <Check size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              type="button"
                              className="p-1.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                              title="Cancel"
                            >
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      /* Display Mode */
                      <>
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-900">
                          <div className="flex flex-col">
                            <span>{expense.merchant}</span>
                            {expense.needsReview && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 uppercase tracking-wider mt-0.5">
                                <AlertTriangle size={11} strokeWidth={2.5} /> Needs Review
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-gray-600">
                          {expense.date}
                        </td>
                        {/* Rule 5: Income vs expense must not rely on color alone: add +/- sign and arrow */}
                        <td className="px-4 py-3.5 text-sm font-extrabold text-gray-900">
                          {expense.total !== null && expense.total !== undefined ? (
                            <span className="inline-flex items-center gap-0.5 text-red-600">
                              <ArrowDownRight size={14} strokeWidth={2.5} />
                              -₹{expense.total.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold text-xs uppercase">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-gray-500">
                          {expense.tax !== null && expense.tax !== undefined ? `₹${expense.tax.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge category={expense.category} />
                        </td>
                        <td className="px-4 py-3.5">
                          <ConfidenceBar value={expense.confidence} />
                        </td>
                        <td className="px-4 py-3.5 text-xs font-bold">
                          {expense.categorizationSource === 'ml' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase tracking-wider text-[11px]">
                              <Bot size={13} strokeWidth={2.5} /> ML {Math.round((expense.mlConfidence || 0) * 100)}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                              Rules
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEdit(expense)}
                              type="button"
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit Expense"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              type="button"
                              className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Rule 13: horizontal scroll or collapsed stacked cards */}
      <div className="md:hidden space-y-3 p-4 bg-gray-50">
        {sortedAndFilteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt size={32} strokeWidth={2} className="mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-sm">No expenses found</p>
          </div>
        ) : (
          sortedAndFilteredExpenses.map((expense) => (
            <div
              key={expense._id}
              className="rounded-lg p-4 bg-white border-2 border-gray-200 shadow-none space-y-3"
            >
              {editingId === expense._id ? (
                <div className="space-y-3">
                  <Input
                    label="Merchant"
                    value={editForm.merchant}
                    onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                    <Input
                      label="Total (₹)"
                      type="number"
                      step="0.01"
                      value={editForm.total}
                      onChange={(e) => setEditForm({ ...editForm, total: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Select
                    label="Category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={() => handleSave(expense._id)} className="flex-1">
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditingId(null)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                        {expense.merchant}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">{expense.date}</p>
                      {expense.needsReview && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded mt-1 uppercase tracking-wider">
                          <AlertTriangle size={10} strokeWidth={2.5} /> Needs Review
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {expense.total !== null && expense.total !== undefined ? (
                        <span className="inline-flex items-center text-lg font-black text-red-600">
                          <ArrowDownRight size={16} strokeWidth={2.5} />
                          -₹{expense.total.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-bold uppercase">Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                    <Badge category={expense.category} />
                    {expense.categorizationSource === 'ml' ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                        ML {Math.round((expense.mlConfidence || 0) * 100)}%
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                        Rules
                      </span>
                    )}
                    <ConfidenceBar value={expense.confidence} />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      className="flex-1"
                    >
                      <Edit2 size={14} strokeWidth={2.5} className="mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(expense._id)}
                      className="flex-1"
                    >
                      <Trash2 size={14} strokeWidth={2.5} className="mr-1.5" />
                      Delete
                    </Button>
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
