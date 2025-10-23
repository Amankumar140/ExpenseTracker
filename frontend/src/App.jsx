import { useState, useEffect } from 'react';
import UploadReceipt from './components/UploadReceipt';
import ExpenseTable from './components/ExpenseTable';
import Analytics from './components/Analytics';
import { getExpenses } from './services/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'expenses' || activeTab === 'analytics') {
      fetchExpenses();
    }
  }, [activeTab]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data.expenses);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchExpenses();
    setActiveTab('expenses');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Auto-Categorizer
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload receipts, extract data with OCR, and analyze your expenses
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Upload Receipt
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading && activeTab !== 'upload' ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'upload' && (
              <UploadReceipt onUploadSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'expenses' && (
              <ExpenseTable 
                expenses={expenses} 
                onUpdate={fetchExpenses}
                onDelete={fetchExpenses}
              />
            )}
            {activeTab === 'analytics' && <Analytics />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Expense Auto-Categorizer - Built with MERN Stack, Tesseract.js & Recharts
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
