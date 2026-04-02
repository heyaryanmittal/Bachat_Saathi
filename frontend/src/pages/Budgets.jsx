import React, { useState, useEffect, useMemo } from "react";
import * as api from "../services/api";
import BudgetForm from "../components/BudgetForm";
import { Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  Target, Edit3, FolderOpen, TrendingUp, TrendingDown, 
  Plus, Trash2, Calendar, PieChart, Layers, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, category: '', isDeleting: false });
  useEffect(() => { 
    if (currentMonth && currentMonth.length === 7) {
      fetchBudgets(); 
    }
  }, [currentMonth]);
  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const [year, month] = currentMonth.split("-").map(Number);
      const [budgetsRes, transRes] = await Promise.all([
        api.getBudgets({ month, year }),
        api.getTransactions({ month, year, limit: 1000 })
      ]);
      const bList = budgetsRes.data.data?.budgets || [];
      const tList = transRes.data.data?.transactions || [];
      const sum = bList.map(b => {
        const spent = tList
          .filter(t => t.category === b.category && t.type?.toLowerCase() === 'expense')
          .reduce((s, t) => s + Number(t.amount || 0), 0);
        return { ...b, budgeted: Number(b.amount), spent };
      });
      setBudgets(bList);
      setSummary(sum);
    } catch (e) { toast.error('Sync failed.'); }
    finally { setIsLoading(false); }
  };
  const handleAction = async (data, isEdit) => {
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      if (isEdit) {
        await api.updateBudget(editingBudget._id, { ...data, month, year });
        toast.success('Strategy updated.');
      } else {
        await api.createBudget({ ...data, month, year });
        toast.success('Goal initialized.');
      }
      setIsCreating(false); setIsEditing(false);
      fetchBudgets();
    } catch (e) { toast.error('Command failed.'); }
  };
  const confirmDelete = async () => {
    try {
      setDeleteDialog(p => ({ ...p, isDeleting: true }));
      await api.deleteBudget(deleteDialog.id);
      toast.success('Strategy purged.');
      setDeleteDialog({ isOpen: false, id: null, category: '', isDeleting: false });
      fetchBudgets();
    } catch (e) { toast.error('Purge error.'); }
  };
  const stats = useMemo(() => {
    const budgeted = summary.reduce((s, i) => s + i.budgeted, 0);
    const spent = summary.reduce((s, i) => s + i.spent, 0);
    const utilization = budgeted > 0 ? (spent / budgeted) * 100 : 0;
    return { budgeted, spent, remaining: budgeted - spent, utilization };
  }, [summary]);
  if (isLoading && !budgets.length) {
    return <div className="flex h-[80vh] items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Calculating limits..." /></div>;
  }
  return (
    <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard title="Total Budgeted" value={stats.budgeted} variant="primary" icon={<Target />} prefix="₹" />
        <StatsCard 
          title="Total Spent" 
          value={stats.spent} 
          variant={stats.utilization >= 100 ? "error" : stats.utilization >= 80 ? "warning" : "secondary"} 
          icon={<TrendingDown />} 
          prefix="₹" 
        />
        <StatsCard 
          title="Remaining" 
          value={stats.remaining} 
          variant={stats.remaining < 0 ? "error" : "success"} 
          icon={<Layers />} 
          prefix="₹" 
        />
      </div>
      {}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-border/50 shadow-sm relative w-full md:w-auto">
             <label htmlFor="budget-month-selector" className="sr-only">Select Budget Month</label>
             <input 
                id="budget-month-selector"
                name="month"
                type="month" 
                value={currentMonth} 
                onChange={e => setCurrentMonth(e.target.value)} 
                className="input-saas border-none bg-transparent font-black uppercase text-[10px] tracking-widest px-4 w-full sm:w-auto text-center sm:text-left" 
             />
             <Button onClick={() => setIsCreating(true)} className="btn-saas-primary w-full sm:w-auto" size="md"><Plus className="mr-2 w-4 h-4" />New Budget</Button>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {summary.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card border-dashed p-10 border-2">
             <Info className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
             <p className="text-xl font-bold text-muted-foreground">No Budgets Set</p>
             <p className="text-sm text-muted-foreground italic mb-8 mt-2">Create your first budget to start tracking your spending.</p>
             <Button onClick={() => setIsCreating(true)} variant="secondary">Create Budget</Button>
          </div>
        ) : (
          summary.map(item => {
            const progress = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;
            const isCritical = progress >= 100;
            const isWarning = progress >= 80 && progress < 100;
            return (
              <Card key={item.category} variant="glass" className="saas-card group p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform ${isCritical ? 'bg-rose-500 shadow-rose-500/20' : isWarning ? 'bg-amber-500 shadow-amber-500/20' : 'gradient-primary shadow-primary/20'}`}>
                         <FolderOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight uppercase truncate max-w-[150px]">{item.category}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Limit</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Spent</p>
                      <p className={`text-xl font-black tracking-tighter ${isCritical ? 'text-rose-500' : 'text-foreground'}`}>₹{item.spent.toLocaleString()}</p>
                   </div>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Consumption</span>
                      <span>{progress.toFixed(0)}%</span>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                   </div>
                   <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                      <div>
                         <p className="text-[9px] font-black text-muted-foreground uppercase">Target</p>
                         <p className="text-sm font-black">₹{item.budgeted.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-muted-foreground uppercase">Remaining</p>
                         <p className={`text-sm font-black ${item.budgeted - item.spent < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{(item.budgeted - item.spent).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button variant="secondary" size="sm" onClick={() => { setEditingBudget(item); setIsEditing(true); }} className="font-black text-[10px] tracking-widest uppercase">Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteDialog({ isOpen: true, id: item._id, category: item.category, isDeleting: false })} className="font-black text-[10px] tracking-widest uppercase">Delete</Button>
                </div>
              </Card>
            )
          })
        )}
      </div>
      {}
      {(isCreating || isEditing) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-md w-full animate-entrance" size="xl">
                  <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase tracking-widest">
                      {isEditing ? 'Edit Budget' : 'Create New Budget'}
                  </h3>
                  <BudgetForm 
                    onSubmit={data => handleAction(data, isEditing)} 
                    initialData={isEditing ? { ...editingBudget, amount: editingBudget.budgeted } : null} 
                  />
                  <Button variant="ghost" className="w-full mt-4 font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => { setIsEditing(false); setIsCreating(false); setEditingBudget(null); }}>Cancel</Button>
              </Card>
          </div>
      )}
      {}
      {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="lg">
                  <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Delete Budget?</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8">This will delete the budget limit for <span className="font-black text-foreground">{deleteDialog.category}</span>. Your transactions will not be affected.</p>
                  <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" onClick={() => setDeleteDialog({ isOpen: false, id: null, category: '', isDeleting: false })}>Cancel</Button>
                      <Button 
                        variant="danger" 
                        loading={deleteDialog.isDeleting}
                        onClick={confirmDelete}
                      > Delete </Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};
export default Budgets;
