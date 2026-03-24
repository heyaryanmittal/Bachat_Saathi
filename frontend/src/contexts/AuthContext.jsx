import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data?.data?.user) {
        const user = response.data.data.user;
        setUser(user);
        setError(null);
        return user;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        if (!['/login', '/signup', '/'].includes(location.pathname)) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login', { state: { from: location }, replace: true });
        }
      }
      setError(error.response?.data?.message || 'Failed to fetch user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const user = await fetchUser();
        if (user && ['/login', '/signup'].includes(location.pathname)) {
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 0);
        }

      } else {
        setLoading(false);
        if (!['/login', '/signup', '/'].includes(location.pathname)) {
          setTimeout(() => {
            navigate('/login', {
              state: { from: location },
              replace: true
            });
          }, 0);
        }
      }
      initialized.current = true;
    };
    initializeAuth().catch(error => {
      console.error('Error initializing auth:', error);
      setLoading(false);
    });
  }, [fetchUser, location, navigate]);
  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      const status = response.data?.status?.toLowerCase();
      
      // Explicit 2FA Check
      if (status === 'require-2fa' || status === '2fa-required') {
        return { 
          require2FA: true, 
          email, 
          message: response.data.message 
        };
      }

      // Success Check
      if (response.data?.data?.token) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setError(null);
        toast.success(`Welcome back, ${user.name}!`);
        return user;
      }

      throw new Error(response.data?.message || 'Invalid response from server');
    } catch (error) {
      console.error('[Auth] Login Failure:', error);
      
      // Fallback: Check if error response mentions 2FA
      if (error.response?.data?.status === 'require-2fa') {
        return { require2FA: true, email };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const verify2FA = async (email, otp) => {
    try {
      setError(null);
      const response = await api.post('/auth/login-2fa', { email, otp });
      
      if (!response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid 2FA verification response');
      }

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      
      toast.success(`2FA Verified. Welcome, ${user.name}!`);
      return user;
    } catch (error) {
      console.error('2FA verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP code.';
      toast.error(errorMessage);
      throw error;
    }
  };


  const signup = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/signup', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });
      if (!response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid response from server');
      }
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
      navigate('/dashboard', { replace: true });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.put('/auth/profile', updatedData);
      const updatedUser = response.data.data.user;
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    toast.success('You have been logged out.');
  };
  const setAuthData = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setError(null);
  }, []);
  const value = {
    user,
    token: localStorage.getItem('token'),
    error,
    loading,
    login,
    verify2FA,
    signup,
    logout,
    updateUser,
    setAuthData,
    isAuthenticated: !!user
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
