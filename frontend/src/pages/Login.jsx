import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Receipt, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
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
        setError({
          message: validationErrors.map(e => e.message).join(', '),
          isUnregistered: false
        });
      } else if (errorMessage === 'User not found' || err.response?.status === 404) {
        setError({
          message: 'This email is not registered. Please register / create an account first.',
          isUnregistered: true
        });
      } else if (errorMessage === 'Incorrect password') {
        setError({
          message: 'Incorrect password. Please check your password and try again.',
          isUnregistered: false
        });
      } else if (errorMessage) {
        const isNotReg = errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('not registered');
        setError({
          message: isNotReg ? 'This email is not registered. Please register / create an account first.' : errorMessage,
          isUnregistered: isNotReg
        });
      } else {
        setError({
          message: 'Failed to sign in. Please check your credentials.',
          isUnregistered: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* Poster Background Decorative Shapes - Rule 10: Poster treatment with large geometric shapes */}
      <div className="absolute top-12 -left-16 w-80 h-80 rounded-full bg-blue-500/10 pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-md rotate-12 bg-emerald-500/10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-amber-500/10 pointer-events-none"></div>

      <div className="relative max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-500 text-white rounded-md flex items-center justify-center transition-transform hover:scale-105">
            <Receipt size={32} strokeWidth={2.5} />
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Card Form */}
        <Card color="white" padding="default" className="border-2 border-gray-900 shadow-none">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 rounded-md border-2 ${
                error.isUnregistered
                  ? 'bg-amber-50 border-amber-500 text-amber-900'
                  : 'bg-red-50 border-red-500 text-red-700'
              } text-sm font-semibold flex flex-col gap-2`}>
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={20} strokeWidth={2.5} className={`flex-shrink-0 mt-0.5 ${
                    error.isUnregistered ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p>{error.message}</p>
                    {error.isUnregistered && (
                      <div className="mt-2.5">
                        <Link
                          to="/signup"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors shadow-none"
                        >
                          Register First →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full h-12"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
