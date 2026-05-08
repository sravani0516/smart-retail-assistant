import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a more robust system, you might want to call register if it's a first time user.
      // We will just call login and let it fail if not found.
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Failed to connect to authentication server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: quick register for dev convenience so user isn't stuck
  const handleRegister = async () => {
    if (!email || !password) {
      setError('Enter email and password to register');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.register({ email, password });
      // automatically login after register
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4 ring-4 ring-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Smart Retail Assistant</h2>
          <p className="text-brand-100 mt-2 text-sm">Secure Authentication Gateway</p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Enterprise Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                placeholder="admin@retail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Secure Login'}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={handleRegister}
                disabled={isLoading}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
              >
                Create Account (Dev Mode)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
