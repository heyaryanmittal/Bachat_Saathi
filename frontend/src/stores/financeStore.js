import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as api from '../services/api';
const useFinanceStore = create(
    devtools(
        persist(
            (set, get) => ({
                transactions: [],
                wallets: [],
                budgets: [],
                goals: [],
                debts: [],
                isLoading: false,
                error: null,
                lastFetch: null,
                loadingStates: {
                    transactions: false,
                    wallets: false,
                    budgets: false,
                    goals: false,
                    debts: false,
                },
                computed: {
                    totalIncome: 0,
                    totalExpenses: 0,
                    netFlow: 0,
                    budgetUtilization: 0,
                },
                setTransactions: (transactions) => {
                    set({ transactions });
                    get().updateComputedValues();
                },
                setWallets: (wallets) => {
                    set({ wallets });
                },
                setBudgets: (budgets) => {
                    set({ budgets });
                    get().updateBudgetComputedValues();
                },
                setGoals: (goals) => set({ goals }),
                setDebts: (debts) => set({ debts }),
                setLoading: (key, loading) => {
                    set((state) => ({
                        loadingStates: {
                            ...state.loadingStates,
                            [key]: loading,
                        },
                    }));
                },
                setError: (error) => set({ error }),
                clearError: () => set({ error: null }),
                updateComputedValues: () => {
                    const { transactions } = get();
                    const totalIncome = transactions
                        .filter(t => t.type?.toLowerCase() === 'income')
                        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const totalExpenses = transactions
                        .filter(t => t.type?.toLowerCase() === 'expense')
                        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const netFlow = totalIncome - totalExpenses;
                    set((state) => ({
                        computed: {
                            ...state.computed,
                            totalIncome,
                            totalExpenses,
                            netFlow,
                        },
                    }));
                },
                updateBudgetComputedValues: () => {
                    const { budgets } = get();
                    const totalBudgeted = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
                    const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
                    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
                    set((state) => ({
                        computed: {
                            ...state.computed,
                            budgetUtilization,
                        },
                    }));
                },
                fetchTransactions: async (params = {}) => {
                    const { setLoading, setError } = get();
                    setLoading('transactions', true);
                    setError(null);
                    try {
                        const response = await api.getTransactions(params);
                        const transactions = response.data?.data?.transactions || [];
                        set({ transactions, lastFetch: Date.now() });
                        return transactions;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch transactions';
                        setError(errorMessage);
                        throw error;
                    } finally {
                        setLoading('transactions', false);
                    }
                },
                fetchWallets: async () => {
                    const { setLoading, setError } = get();
                    setLoading('wallets', true);
                    setError(null);
                    try {
                        const response = await api.getWallets();
                        const wallets = response.data?.data?.wallets || [];
                        set({ wallets });
                        return wallets;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch wallets';
                        setError(errorMessage);
                        throw error;
                    } finally {
                        setLoading('wallets', false);
                    }
                },
                fetchBudgets: async (params = {}) => {
                    const { setLoading, setError } = get();
                    setLoading('budgets', true);
                    setError(null);
                    try {
                        const response = await api.getBudgets(params);
                        const budgets = response.data?.data?.budgets || [];
                        set({ budgets });
                        return budgets;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch budgets';
                        setError(errorMessage);
                        throw error;
                    } finally {
                        setLoading('budgets', false);
                    }
                },
                fetchGoals: async () => {
                    const { setLoading, setError } = get();
                    setLoading('goals', true);
                    setError(null);
                    try {
                        const response = await api.getGoals();
                        const goals = response.data?.data || [];
                        set({ goals });
                        return goals;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch goals';
                        setError(errorMessage);
                        throw error;
                    } finally {
                        setLoading('goals', false);
                    }
                },
                fetchDebts: async () => {
                    const { setLoading, setError } = get();
                    setLoading('debts', true);
                    setError(null);
                    try {
                        const response = await api.getDebts();
                        const debts = response.data?.data || [];
                        set({ debts });
                        return debts;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch debts';
                        setError(errorMessage);
                        throw error;
                    } finally {
                        setLoading('debts', false);
                    }
                },
                createTransaction: async (data) => {
                    try {
                        const response = await api.createTransaction(data);
                        const newTransaction = response.data?.data;
                        if (newTransaction) {
                            set((state) => ({
                                transactions: [newTransaction, ...state.transactions],
                            }));
                            await get().fetchWallets();
                        }
                        return newTransaction;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to create transaction';
                        setError(errorMessage);
                        throw error;
                    }
                },
                updateTransaction: async (id, data) => {
                    try {
                        const response = await api.updateTransaction(id, data);
                        const updatedTransaction = response.data?.data;
                        if (updatedTransaction) {
                            set((state) => ({
                                transactions: state.transactions.map(t =>
                                    t._id === id ? updatedTransaction : t
                                ),
                            }));
                            await get().fetchWallets();
                        }
                        return updatedTransaction;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to update transaction';
                        setError(errorMessage);
                        throw error;
                    }
                },
                deleteTransaction: async (id) => {
                    try {
                        await api.deleteTransaction(id);
                        set((state) => ({
                            transactions: state.transactions.filter(t => t._id !== id),
                        }));
                        await get().fetchWallets();
                        return true;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete transaction';
                        setError(errorMessage);
                        throw error;
                    }
                },
                createWallet: async (data) => {
                    try {
                        const response = await api.createWallet(data);
                        const newWallet = response.data?.data;
                        if (newWallet) {
                            set((state) => ({
                                wallets: [...state.wallets, newWallet],
                            }));
                        }
                        return newWallet;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to create wallet';
                        setError(errorMessage);
                        throw error;
                    }
                },
                updateWallet: async (id, data) => {
                    try {
                        const response = await api.updateWallet(id, data);
                        const updatedWallet = response.data?.data;
                        if (updatedWallet) {
                            set((state) => ({
                                wallets: state.wallets.map(w =>
                                    w._id === id ? updatedWallet : w
                                ),
                            }));
                        }
                        return updatedWallet;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to update wallet';
                        setError(errorMessage);
                        throw error;
                    }
                },
                deleteWallet: async (id) => {
                    try {
                        await api.deleteWallet(id);
                        set((state) => ({
                            wallets: state.wallets.filter(w => w._id !== id),
                        }));
                        return true;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete wallet';
                        setError(errorMessage);
                        throw error;
                    }
                },
                createBudget: async (data) => {
                    try {
                        const response = await api.createBudget(data);
                        const newBudget = response.data?.data;
                        if (newBudget) {
                            set((state) => ({
                                budgets: [...state.budgets, newBudget],
                            }));
                        }
                        return newBudget;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to create budget';
                        setError(errorMessage);
                        throw error;
                    }
                },
                updateBudget: async (id, data) => {
                    try {
                        const response = await api.updateBudget(id, data);
                        const updatedBudget = response.data?.data;
                        if (updatedBudget) {
                            set((state) => ({
                                budgets: state.budgets.map(b =>
                                    b._id === id ? updatedBudget : b
                                ),
                            }));
                        }
                        return updatedBudget;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to update budget';
                        setError(errorMessage);
                        throw error;
                    }
                },
                deleteBudget: async (id) => {
                    try {
                        await api.deleteBudget(id);
                        set((state) => ({
                            budgets: state.budgets.filter(b => b._id !== id),
                        }));
                        return true;
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete budget';
                        setError(errorMessage);
                        throw error;
                    }
                },
                clearAllData: () => {
                    set({
                        transactions: [],
                        wallets: [],
                        budgets: [],
                        goals: [],
                        debts: [],
                        computed: {
                            totalIncome: 0,
                            totalExpenses: 0,
                            netFlow: 0,
                            budgetUtilization: 0,
                        },
                    });
                },
                shouldRefresh: (lastFetch) => {
                    if (!lastFetch) return true;
                    return Date.now() - lastFetch > 5 * 60 * 1000; 
                },
            }),
            {
                name: 'finance-store',
                partialize: (state) => ({
                    transactions: state.transactions,
                    wallets: state.wallets,
                    budgets: state.budgets,
                    goals: state.goals,
                    debts: state.debts,
                }),
            }
        ),
        {
            name: 'finance-store',
        }
    )
);
export const useTransactions = () => useFinanceStore((state) => state.transactions);
export const useWallets = () => useFinanceStore((state) => state.wallets);
export const useBudgets = () => useFinanceStore((state) => state.budgets);
export const useGoals = () => useFinanceStore((state) => state.goals);
export const useDebts = () => useFinanceStore((state) => state.debts);
export const useFinancialStats = () => useFinanceStore((state) => state.computed);
export const useLoadingStates = () => useFinanceStore((state) => state.loadingStates);
export const useFinanceActions = () => useFinanceStore((state) => ({
    fetchTransactions: state.fetchTransactions,
    fetchWallets: state.fetchWallets,
    fetchBudgets: state.fetchBudgets,
    fetchGoals: state.fetchGoals,
    fetchDebts: state.fetchDebts,
    createTransaction: state.createTransaction,
    updateTransaction: state.updateTransaction,
    deleteTransaction: state.deleteTransaction,
    createWallet: state.createWallet,
    updateWallet: state.updateWallet,
    deleteWallet: state.deleteWallet,
    createBudget: state.createBudget,
    updateBudget: state.updateBudget,
    deleteBudget: state.deleteBudget,
    clearAllData: state.clearAllData,
}));
export default useFinanceStore;
