import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Receipt, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';

const Navbar = () => {
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white border-b-2 border-gray-800 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate('/dashboard')}
          >
            <div className="h-10 w-10 bg-blue-500 text-white rounded-md flex items-center justify-center transition-transform duration-200 hover:scale-105">
              <Receipt size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                ExpenseTrack
              </span>
              <p className="text-[11px] font-medium text-gray-400 hidden sm:block uppercase tracking-wider">
                Financial Command Center
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-expanded={dropdownOpen}
              >
                {/* Avatar with flat styling */}
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  {/* Status dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900"></div>
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Account'}</p>
                  <p className="text-xs text-gray-400 leading-tight truncate max-w-[140px]">{user?.email}</p>
                </div>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-white' : ''}`}
                />
              </button>

              {/* Dropdown - Solid Color Block Panel, Zero Shadows, Zero Blur */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md bg-white text-gray-900 border-2 border-gray-900 shadow-none py-2 z-50">
                  <div className="px-4 py-3 bg-gray-100 border-b-2 border-gray-200">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{getGreeting()}</p>
                    <p className="text-sm font-extrabold mt-0.5 text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-150 flex items-center gap-2.5"
                    >
                      <LogOut size={16} strokeWidth={2.5} />
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
