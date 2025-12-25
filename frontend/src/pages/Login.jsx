import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await signin(email, password);
      login(data.user);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors.map(e => e.message).join(', '));
      } else if (errorMessage) {
        if (errorMessage.includes('Invalid email') || err.response?.status === 401) {
          setError('User not found. Please sign up first.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Floating Orbs */}
      <div className={`absolute top-20 left-10 w-72 h-72 rounded-full filter blur-3xl animate-blob ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-300/30'}`}></div>
      <div className={`absolute top-40 right-10 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-2000 ${isDark ? 'bg-purple-900/20' : 'bg-purple-300/20'}`}></div>
      <div className={`absolute bottom-20 left-1/3 w-80 h-80 rounded-full filter blur-3xl animate-blob animation-delay-4000 ${isDark ? 'bg-pink-900/20' : 'bg-pink-300/20'}`}></div>

      <div className="relative max-w-md w-full space-y-8 my-8 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-float">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome back
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className={`mt-8 py-8 px-6 rounded-2xl transition-all duration-300 ${isDark ? 'glass-dark' : 'glass shadow-xl'} gradient-border`}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className={`border px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 animate-slide-up ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white/50 border-slate-300 placeholder-slate-400'}`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white/50 border-slate-300 placeholder-slate-400'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
