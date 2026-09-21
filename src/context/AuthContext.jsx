import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('swaranidhi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('swaranidhi_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('swaranidhi_token', token);
    } else {
      localStorage.removeItem('swaranidhi_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('swaranidhi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('swaranidhi_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const authData = res.data.data;
      setToken(authData.token);
      setUser({
        userId: authData.userId,
        businessId: authData.businessId,
        businessName: authData.businessName,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
        currency: authData.currency || 'INR',
        defaultLanguage: authData.defaultLanguage || 'en',
      });
      return { success: true };
    } catch (err) {
      // Fallback for offline or demo before backend starts
      if (email === 'owner@kirana.com' && password === 'password123') {
        const demoUser = {
          userId: 1,
          businessId: 1,
          businessName: 'Swaranidhi Kirana & General Store',
          email: 'owner@kirana.com',
          fullName: 'Ramesh Kumar',
          role: 'OWNER',
          currency: 'INR',
          defaultLanguage: 'en',
        };
        const demoToken = 'demo-jwt-token-local';
        setToken(demoToken);
        setUser(demoUser);
        return { success: true, offlineMode: true };
      }
      const message = err.response?.data?.message || 'Please check your email and password.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      const authData = res.data.data;
      setToken(authData.token);
      setUser({
        userId: authData.userId,
        businessId: authData.businessId,
        businessName: authData.businessName,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
        currency: authData.currency || 'INR',
        defaultLanguage: authData.defaultLanguage || 'en',
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please check your details.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swaranidhi_token');
    localStorage.removeItem('swaranidhi_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
