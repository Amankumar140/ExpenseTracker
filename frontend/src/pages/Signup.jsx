import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Receipt, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 5, label: 'Excellent', color: 'bg-green-600' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await signup(name, email, password);
      login(data.user);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;

      if (validationErrors && validationErrors.length > 0) {
        const errorMessages = validationErrors.map(e => e.message);
        setError({ message: errorMessages.join('. '), isAlreadyRegistered: false });
      } else if (errorMessage === 'Email already registered') {
        setError({
          message: 'This email is already registered. Please sign in instead.',
          isAlreadyRegistered: true
        });
      } else if (errorMessage) {
        setError({ message: errorMessage, isAlreadyRegistered: false });
      } else {
        setError({ message: 'Failed to create account. Please try again.', isAlreadyRegistered: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* Poster Background Decorative Shapes - Rule 10 */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-20 w-88 h-88 rounded-md rotate-45 bg-blue-500/10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-8 w-32 h-32 rounded-full bg-amber-500/10 pointer-events-none"></div>

      <div className="relative max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-500 text-white rounded-md flex items-center justify-center transition-transform hover:scale-105">
            <Receipt size={32} strokeWidth={2.5} />
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card Form */}
        <Card color="white" padding="default" className="border-2 border-gray-900 shadow-none">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 rounded-md border-2 ${
                error.isAlreadyRegistered
                  ? 'bg-amber-50 border-amber-500 text-amber-900'
                  : 'bg-red-50 border-red-500 text-red-700'
              } text-sm font-semibold flex flex-col gap-2`}>
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={20} strokeWidth={2.5} className={`flex-shrink-0 mt-0.5 ${
                    error.isAlreadyRegistered ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p>{error.message}</p>
                    {error.isAlreadyRegistered && (
                      <div className="mt-2.5">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors shadow-none"
                        >
                          Sign In Instead →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              icon={User}
            />

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              icon={Mail}
            />

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
              />

              {/* Flat Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-2 flex-1 rounded-full ${
                          lvl <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-gray-700">
                    Strength: <span className="uppercase tracking-wider">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full h-12"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
