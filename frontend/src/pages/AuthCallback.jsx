import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAuthToken } from '../services/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAuthToken(token);
      checkAuth().then(() => {
        navigate('/', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-800 font-extrabold uppercase tracking-wider text-sm">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
