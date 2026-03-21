import axios from "axios";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    const { status } = error.response;
    if (status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    else if (status >= 500) {
      console.error('Server error:', error.response.data);
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);
export const getWallets = () => api.get("/wallets");
export const createWallet = (data) => api.post("/wallets", data);
export const deleteWallet = (id) => api.delete(`/wallets/${id}`);
export const updateWallet = (id, data) => api.put(`/wallets/${id}`, data);
export const getTransactions = (params) =>
  api.get("/transactions", { params });
export const getTransactionStats = (params) =>
  api.get("/transactions/stats", { params });
export const getTransactionsWithStats = (params) =>
  api.get("/transactions", { params: { ...params, includeStats: true } });
export const createTransaction = (data) =>
  api.post("/transactions", data);
export const updateTransaction = (id, data) =>
  api.patch(`/transactions/${id}`, data);
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`);
export const getBudgets = (params) =>
  api.get("/budgets", { params });
export const getBudgetSummary = (params) =>
  api.get("/budgets/summary", { params });
export const createBudget = (data) =>
  api.post("/budgets", data);
export const updateBudget = (id, data) =>
  api.patch(`/budgets/${id}`, data); 
export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`);
export const getDebts = (params) =>
  api.get("/debts", { params });
export const getDebtStats = () =>
  api.get("/debts/stats/overview");
export const createDebt = (data) =>
  api.post("/debts", data);
export const updateDebt = (id, data) =>
  api.patch(`/debts/${id}`, data);
export const deleteDebt = (id) =>
  api.delete(`/debts/${id}`);
export const updateDebtPayment = (id, data) =>
  api.patch(`/debts/${id}/payment`, data);
export const updateDebtInterest = (id, data) =>
  api.patch(`/debts/${id}/interest`, data);
export const getGoals = (params) =>
  api.get("/goals", { params });
export const getGoalStats = () =>
  api.get("/goals/stats/overview");
export const createGoal = (data) =>
  api.post("/goals", data);
export const updateGoal = (id, data) =>
  api.patch(`/goals/${id}`, data);
export const deleteGoal = (id) =>
  api.delete(`/goals/${id}`);
export const addSavingsToGoal = (id, data) =>
  api.patch(`/goals/${id}/savings`, data);
export const getSpendingAnalysis = (params) =>
  api.get('/spending-analysis', { params });
export const getIncomeReport = (params) =>
  api.get('/income-report', { params });
export const getBudgetReport = (params) =>
  api.get('/budget-report', { params });
export const exportTransactionsCSV = (params) =>
  api.get("/reports/csv/transactions", { params });
export const exportComprehensiveCSV = () =>
  api.get("/reports/csv/comprehensive");
export const exportPDFReport = () =>
  api.get("/reports/pdf/comprehensive");
export const getReportSummary = () =>
  api.get("/reports/summary");
export const getUserPoints = () =>
  api.get("/users/points");
export const getPointsHistory = (params) =>
  api.get("/users/points/history", { params });
export const getUserAchievements = () =>
  api.get("/users/achievements");
export const getCurrentMonthTier = () =>
  api.get("/monthly-tiers/current");
export const getMonthlyTiersHistory = (params) =>
  api.get("/monthly-tiers/history", { params });
export const calculateCurrentMonthTier = () =>
  api.post("/monthly-tiers/calculate");
export const getTierStats = () =>
  api.get("/monthly-tiers/stats");
export default api;
