// src/auth/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const response = await api.get('/checkSession', {
        withCredentials: true // Explicitly include credentials
      });
      console.log('Session check response:', response.data);

      if (response.data.isAuthenticated && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('User authenticated:', response.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      console.error('Error details:', error.response?.data);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      await checkAuth(); // Recheck auth state after login
    } catch (error) {
      console.error('Login state update failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);