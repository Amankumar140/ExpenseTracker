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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isDark ? 'glass-dark' : 'glass'} border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {/* Animated ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500"></div>
            </div>
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white to-slate-300' : 'from-slate-900 to-slate-700'}`}>
                ExpenseTrack
              </h1>
              <p className={`text-xs hidden sm:block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Smart expense management
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            <DarkModeToggle />
            
            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80'}`}
              >
                {/* Avatar with gradient ring */}
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-indigo-500/50 ring-offset-transparent"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                </div>
                
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
                <svg
                  className={`hidden sm:block h-4 w-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 animate-slide-down ${isDark ? 'glass-dark border-slate-700' : 'glass border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                    <p className={`text-xs font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{getGreeting()}</p>
                    <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 rounded-lg mx-1 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                      style={{ width: 'calc(100% - 8px)' }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      Sign out
                    </button>
                  </div>
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
