import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicNavbar from './components/PublicNavbar';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Pages that should show the public navbar
  const publicPages = ['/', '/about', '/contact', '/login', '/signup'];
  const showPublicNavbar = publicPages.includes(location.pathname) || (!user && location.pathname.startsWith('/auth'));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPublicNavbar && <PublicNavbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={!user ? <Home /> : <Navigate to="/dashboard" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Root Route - Show Home if not logged in, Dashboard if logged in */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
