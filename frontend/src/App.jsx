import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes, Navigate, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import axios from 'axios';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import DebtTracker from './pages/DebtTracker';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import PointsInfoPage from './pages/PointsInfoPage';
import TransferHistory from './pages/TransferHistory';
import AIAssistant from './components/AIAssistant';

// Create a custom history object to access navigation outside components
const history = createBrowserHistory({ window });

// Configure future flags for React Router v7
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Set API URL for axios
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else {
  axios.defaults.baseURL = 'http://localhost:5001';
  console.warn('Using default API URL. Set VITE_API_URL in .env for production.');
}

// App Layout Component
function AppLayout({ children, showNavbar = true, showContainer = true }) {
  const { user } = useAuth();
  // Set auth token for axios if user is logged in
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-all duration-500 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10">
        {showNavbar && <Navbar />}
        {user && <AIAssistant />}
        {showContainer ? (
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <HistoryRouter
      history={history}
      future={routerConfig.future}
    >
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-center"
            gutter={12}
            toastOptions={{
              duration: 4500,
              // Global style for toasts; each toast can still override
              style: {
                borderRadius: '12px',
                background: '#ffffff',
                color: '#0f172a',
                boxShadow: '0 10px 30px rgba(2,6,23,0.15)',
                width: 'min(720px, 92%)',
                margin: '0 auto',
                padding: '14px 18px',
                border: '1px solid rgba(15,23,42,0.06)'
              },
              success: {
                icon: '✅',
                style: {
                  borderLeft: '6px solid #10b981',
                  background: '#f6fffb'
                }
              },
              error: {
                icon: '⚠️',
                style: {
                  borderLeft: '6px solid #ef4444',
                  background: '#fff5f5'
                }
              }
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <AppLayout showNavbar={false} showContainer={false}>
                  <Landing />
                </AppLayout>
              }
            />
            <Route
              path="/login"
              element={
                <AppLayout showNavbar={false} showContainer={false}>
                  <Login />
                </AppLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AppLayout showNavbar={false} showContainer={false}>
                  <Signup />
                </AppLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Wallets />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Transactions />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Budgets />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Phase 2 Routes */}
            <Route
              path="/debts"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <DebtTracker />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Goals />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Achievements />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Leaderboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/points-info"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <PointsInfoPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transfers"
              element={
                <ProtectedRoute>
                  <AppLayout showNavbar={true} showContainer={true}>
                    <TransferHistory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </HistoryRouter>
  );
}

export default App;
