import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import TransactionForm from '../components/TransactionForm';
import { Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  TrendingUp, TrendingDown, Search, Plus, Edit3, Trash2, 
  Calendar, CreditCard, Filter, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState({ walletId: '', type: '', category: '', startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, transaction: null, isDeleting: false });

  useEffect(() => { fetchWallets(); }, []);
  useEffect(() => { fetchTransactions(); fetchAllStats(); }, [currentPage, filters]);

  const fetchWallets = async () => {
    try {
      const response = await api.getWallets();
      setWallets(response.data.data.wallets || []);
    } catch (e) { toast.error('Core sync failed.'); }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTransactions({ ...filters, page: currentPage, limit: 10 });
      setTransactions(response.data.data.transactions || []);
      setTotalPages(response.data.data.pagination.pages);
    } catch (e) { toast.error('Stream failure.'); }
    finally { setIsLoading(false); }
  };

  const fetchAllStats = async () => {
    try {
      const response = await api.getTransactions({ ...filters, limit: 1000, page: 1 });
      setAllTransactions(response.data.data.transactions || []);
    } catch (e) { /* silent fail */ }
  };

  const handleAction = async (data, isEdit) => {
    try {
      const payload = { ...data, notes: data.description || data.notes };
      if (isEdit) {
        await api.updateTransaction(editingTransaction._id, payload);
        toast.success('Node synchronized.');
      } else {
        await api.createTransaction(payload);
        toast.success('Node initialized.');
      }
      setIsEditing(false); setIsCreating(false);
      fetchTransactions(); fetchAllStats();
    } catch (e) { toast.error('Protocol error.'); }
  };

  const confirmDelete = async () => {
    try {
      setDeleteDialog(p => ({ ...p, isDeleting: true }));
      await api.deleteTransaction(deleteDialog.transaction._id);
      toast.success('Node purged.');
      setDeleteDialog({ isOpen: false, transaction: null, isDeleting: false });
      fetchTransactions(); fetchAllStats();
    } catch (e) { toast.error('Purge failed.'); }
  };

  const stats = useMemo(() => {
    const income = allTransactions.filter(t => t.type?.toLowerCase() === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = allTransactions.filter(t => t.type?.toLowerCase() === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    return { income, expense, net: income - expense };
  }, [allTransactions]);

  if (isLoading && !transactions.length) {
    return <div className="flex h-[80vh] items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Streaming data..." /></div>;
  }

  return (
    <div className="pt-24 space-y-12 animate-entrance pb-12 overflow-x-hidden px-4">
      {/* SaaS Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Ledger <span className="text-gradient">Stream</span></h1>
          <p className="text-muted-foreground font-medium text-lg italic tracking-tight">Real-time financial telemetry and history.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="btn-saas-primary" size="lg"><Plus className="mr-2 w-5 h-5" />New Entry</Button>
      </div>

      {/* Stats QuickView */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard title="Inbound Flow" value={stats.income} variant="success" icon={<TrendingUp />} />
        <StatsCard title="Outbound Flow" value={stats.expense} variant="error" icon={<TrendingDown />} />
        <StatsCard title="Differential" value={stats.net} variant="gradient" icon={<Layers />} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <Card variant="glass" className="xl:col-span-1 h-fit sticky top-24">
            <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-black text-sm uppercase tracking-widest">Filter Protocol</h3>
            </div>
            <div className="space-y-6">
                <select className="input-saas w-full" value={filters.walletId} onChange={e => setFilters({...filters, walletId: e.target.value})}>
                    <option value="">All Nodes</option>
                    {wallets.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
                <select className="input-saas w-full" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                    <option value="">All Types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-2">Timeline Start</label>
                    <input type="date" className="input-saas w-full" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-2">Timeline End</label>
                    <input type="date" className="input-saas w-full" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
                </div>
                <Button variant="secondary" className="w-full font-black text-[10px] uppercase tracking-widest" onClick={() => setFilters({ walletId: '', type: '', category: '', startDate: '', endDate: '' })}>Reset Filters</Button>
            </div>
        </Card>

        {/* List Protocol */}
        <div className="xl:col-span-3 space-y-6">
            <Card className="p-0 overflow-hidden saas-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Temporal Data</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source/Category</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</th>
                                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {transactions.map(t => (
                                <tr key={t._id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <Calendar className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{new Date(t.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{t.notes || 'No meta data'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-primary/10 rounded-lg"><CreditCard className="w-3.5 h-3.5 text-primary" /></div>
                                            <span className="text-xs font-bold">{t.walletId?.name || 'Unknown'}</span>
                                            <span className="mx-2 text-muted-foreground/30">•</span>
                                            <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-black uppercase tracking-widest">{t.category || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-black tracking-tighter text-lg ${t.type?.toLowerCase() === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {t.type?.toLowerCase() === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => { setEditingTransaction(t); setIsEditing(true); }}><Edit3 className="w-4 h-4" /></Button>
                                            <Button variant="danger" size="sm" onClick={() => setDeleteDialog({ isOpen: true, transaction: t, isDeleting: false })}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Protocol */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Creation/Edit Protocol Modal */}
      {(isCreating || isEditing) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-2xl w-full animate-entrance" size="xl">
                  <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase tracking-widest">
                      {isEditing ? 'Modify Transaction Sequence' : 'Initialize New Transaction'}
                  </h3>
                  <TransactionForm
                    onSubmit={data => handleAction(data, isEditing)}
                    wallets={wallets}
                    initialData={isEditing ? { ...editingTransaction, description: editingTransaction.notes } : null}
                    isEditing={isEditing}
                  />
                  <Button variant="ghost" className="w-full mt-4 font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => { setIsEditing(false); setIsCreating(false); setEditingTransaction(null); }}>Abort Sequence</Button>
              </Card>
          </div>
      )}

      {/* Delete Protocol Modal */}
      {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="lg">
                  <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Purge Link?</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 italic">Deleting this node will recalculate your entire financial telemetry. Proceed with caution.</p>
                  <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" onClick={() => setDeleteDialog({ isOpen: false, transaction: null, isDeleting: false })}>Retain</Button>
                      <Button 
                        variant="danger" 
                        loading={deleteDialog.isDeleting}
                        onClick={confirmDelete}
                      > Purge Entry </Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

export default Transactions;
