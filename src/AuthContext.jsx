import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const response = await fetch('https://lms-backend-flwq.onrender.com/api/v1/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setToken(storedToken);
            setUser({
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              email: data.data.email,
              role: data.data.role,
              avatar: data.data.avatar,
            });
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://lms-backend-flwq.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        setToken(data.data.token);
        setUser({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          role: data.data.role,
          avatar: data.data.avatar,
        });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Unauthorized: Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error: Unable to connect to the server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);