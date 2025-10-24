import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const PublicNavbar = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b shadow-sm transition-colors ${isDark ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              ExpenseTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}
            >
              Contact
            </Link>

            {/* Auth Buttons & Dark Mode Toggle */}
            <div className="flex items-center gap-3 ml-4">
              <DarkModeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 lg:px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-4 lg:px-5 py-2.5 text-sm font-semibold transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 lg:px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
              className={`p-2 transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t py-4 space-y-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              Contact
            </Link>
            <div className="pt-3 space-y-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-center font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 text-center font-semibold border rounded-lg transition-colors ${isDark ? 'text-slate-300 border-slate-600 hover:bg-slate-800' : 'text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-center font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
