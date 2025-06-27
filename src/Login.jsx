import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/'); // Redirect to dashboard
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-black text-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-cyan-500 mb-6 text-center">ADMIN Login</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              placeholder="Enter email"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-500 text-black py-2 rounded-md hover:bg-cyan-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}