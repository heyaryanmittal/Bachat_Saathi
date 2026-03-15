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

  // Fetch user data using the token
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    // If there's no token, don't try to fetch user
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

      // Clear invalid or expired token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);

        // Only show error if we're not on the login/signup page
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

  // Track if we've already initialized auth
  const initialized = useRef(false);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('AuthProvider mounted, initializing auth...');
    if (initialized.current) {
      console.log('Auth already initialized, skipping...');
      return;
    }

    const initializeAuth = async () => {
      console.log('Running initializeAuth');
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');

      if (token) {
        console.log('Token found, setting up axios headers');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Fetching user profile...');
        const user = await fetchUser();
        console.log('User from fetchUser:', user);

        // If we're on the login/signup page and user is authenticated, redirect to dashboard
        if (user && ['/login', '/signup', '/'].includes(location.pathname)) {
          console.log('User authenticated, redirecting to /dashboard');
          // Use setTimeout to ensure navigation happens after the render phase
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 0);
        }
      } else {
        console.log('No token found, setting loading to false');
        setLoading(false);
        // If there's no token and we're on a protected route, redirect to login
        if (!['/login', '/signup', '/'].includes(location.pathname)) {
          console.log('No token and on protected route, redirecting to /login');
          // Use setTimeout to ensure navigation happens after the render phase
          setTimeout(() => {
            navigate('/login', {
              state: { from: location },
              replace: true
            });
          }, 0);
        }
      }

      initialized.current = true;
      console.log('Auth initialization complete');
    };

    initializeAuth().catch(error => {
      console.error('Error initializing auth:', error);
      setLoading(false);
    });
  }, [fetchUser, location, navigate]);

  const login = async (email, password) => {
    console.log('Login attempt started');
    try {
      setLoading(true);
      setError(null);

      console.log('Sending login request...');
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);

      // Handle 2FA required response
      console.log('Login response status:', response.data?.status);
      if (response.data?.status === 'require-2fa' || response.data?.status === 'REQUIRE-2FA') {
        console.log('2FA required detected');
        // Return special value to indicate 2FA is required
        return { require2FA: true, email };
      }

      if (!response.data?.data?.token || !response.data?.data?.user) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data.data;
      console.log('Login successful, user:', user);

      // Store token and set auth header
      console.log('Setting token in localStorage and axios headers');
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update user state
      console.log('Updating user state');
      await new Promise(resolve => {
        setUser(user);
        setError(null);
        resolve();
      });

      // Show welcome message
      toast.success(`Welcome back, ${user.name || 'User'}!`);

      // Return the user data and let the component handle navigation
      console.log('Login process completed, returning user');
      return user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to log in. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);

    // Don't navigate if we're already on the login page
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
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
    error,
    loading,
    login,
    signup,
    logout,
    updateUser,
    setAuthData,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading || !user ? children : null}
    </AuthContext.Provider>
  );
}
