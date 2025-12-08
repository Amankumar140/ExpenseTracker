import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const PublicNavbar = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isDark ? 'glass-dark' : 'glass'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-25 blur transition-opacity duration-500"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              ExpenseTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? isDark ? 'text-indigo-400' : 'text-indigo-600'
                    : isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100/50'
                }`}
              >
                {link.label}
                {/* Active underline indicator */}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                )}
              </Link>
            ))}

            {/* Divider */}
            <div className={`w-px h-6 mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

            {/* Auth Buttons & Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100/50'}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button & Dark Mode */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-all duration-200 ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100/50'}`}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block w-6 h-0.5 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-300' : 'bg-slate-700'} ${mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'}`}></span>
                <span className={`absolute left-0 top-3 block w-6 h-0.5 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-300' : 'bg-slate-700'} ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 block w-6 h-0.5 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-300' : 'bg-slate-700'} ${mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slide Down */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`py-4 space-y-1 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive(link.to)
                    ? isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                    : isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100/50'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-center font-semibold border rounded-xl transition-all ${isDark ? 'text-slate-300 border-slate-600 hover:bg-slate-800/50' : 'text-slate-700 border-slate-300 hover:bg-slate-100/50'}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
