import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function EnhancedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/'); // Redirect to dashboard
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage:
          'url(https://thumbs.dreamstime.com/b/admin-message-working-office-table-background-93379017.jpg)',
      }}
    >
      {/* Background Overlay with Blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Login Form Card */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md animate-form-slide-in border border-white/20">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
          ADMIN Login
        </h1>
        {error && (
          <div className="bg-red-500/10 text-red-300 p-3 rounded-lg mb-6 text-sm animate-error-slide-in">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50 transition-all duration-300"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50 transition-all duration-300"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white py-2.5 rounded-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform duration-300 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 4.5A7.5 7.5 0 0 1 12 12a7.5 7.5 0 0 1-7.5 7.5V12A7.5 7.5 0 0 1 4 4.5z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>

      {/* Inline CSS for Animations */}
      <style jsx>{`
        @keyframes form-slide-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes error-slide-in {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-form-slide-in {
          animation: form-slide-in 0.5s ease-out forwards;
        }
        .animate-error-slide-in {
          animation: error-slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}