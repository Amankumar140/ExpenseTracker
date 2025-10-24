import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const { isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <nav className={`border-b sticky top-0 z-50 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>ExpenseTracker</h1>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Smart expense management</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <DarkModeToggle />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
                <svg
                  className={`hidden sm:block h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
