import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes, Navigate, useLocation, unstable_HistoryRouter as HistoryRouter, Outlet } from 'react-router-dom';
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
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';

const history = createBrowserHistory({ window });
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else {
  axios.defaults.baseURL = 'http://localhost:5001/api';
  console.warn('Using default API URL. Set VITE_API_URL in .env for production.');
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
}


const getPageContext = (path) => {
  const contexts = {
    '/dashboard': { title: 'Dashboard', desc: 'Monthly Snapshot & Analytics' },
    '/wallets': { title: 'My Wallets', desc: 'Track and manage your money across all accounts.' },
    '/transactions': { title: 'Transactions', desc: 'Detailed history of all your financial activity.' },
    '/budgets': { title: 'Budget Planner', desc: 'Set and monitor spending limits for each category.' },
    '/debts': { title: 'Debt Tracker', desc: 'Monitor and optimize your debt repayment progress.' },
    '/goals': { title: 'Financial Goals', desc: 'Plan and track your long-term financial goals.' },
    '/achievements': { title: 'Achievements', desc: 'Your progress and milestones on BachatSaathi.' },
    '/leaderboard': { title: 'Leaderboard', desc: 'See how you compare with other savers globally.' },
    '/reports': { title: 'Financial Reports', desc: 'Visual insights into your financial health.' },
    '/profile': { title: 'Account Settings', desc: 'Manage your profile, preferences and security.' },
    '/points-info': { title: 'Platform Guide', desc: 'Learn how to earn points effectively.' },
    '/transfers': { title: 'Transfer History', desc: 'History of all account-to-account transfers.' }
  };
  return contexts[path] || { title: 'BachatSaathi', desc: 'Wealth Management Suite' };
};

function ProtectedLayout() {
  const { token } = useAuth();
  const location = useLocation();
  const { title, desc } = getPageContext(location.pathname);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300">
          <div className="flex-1">
             <h2 className="text-2xl font-black uppercase tracking-widest text-foreground leading-none mb-1">
               {title}
             </h2>
             <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">
               {desc}
             </p>
          </div>
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            <div className="flex items-center space-x-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest hidden sm:flex">
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="w-1 h-1 bg-border rounded-full"></span>
              <span className="text-emerald-500">Status: Active</span>
            </div>
          </div>
        </header>


        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">
           <AIAssistant />
           <Outlet />
        </main>
      </div>
    </div>
  );
}

function PublicLayout({ showNavbar = true, children }) {
  const { loading } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {showNavbar && !isLanding && <Navbar />}
      <div className="relative z-10">
        {children || <Outlet />}
      </div>
    </div>
  );
}


function App() {
  return (
    <HistoryRouter history={history} future={routerConfig.future}>
      <ThemeProvider>
        <AuthProvider>
          <Toaster 
            position="top-center" 
            gutter={12} 
            toastOptions={{ 
              duration: 4500, 
              style: { 
                borderRadius: '12px', background: '#ffffff', color: '#0f172a', 
                boxShadow: '0 10px 30px rgba(2,6,23,0.15)', width: 'min(720px, 92%)', 
                margin: '0 auto', padding: '14px 18px', border: '1px solid rgba(15,23,42,0.06)' 
              },
              success: { icon: '✅', style: { borderLeft: '6px solid #10b981', background: '#f6fffb' } },
              error: { icon: '⚠️', style: { borderLeft: '6px solid #ef4444', background: '#fff5f5' } }
            }} 
          />
          <Routes>
            {}
            <Route element={<PublicLayout showNavbar={false} />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {}
            <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/debts" element={<DebtTracker />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/points-info" element={<PointsInfoPage />} />
              <Route path="/transfers" element={<TransferHistory />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </HistoryRouter>
  );
}

export default App;
