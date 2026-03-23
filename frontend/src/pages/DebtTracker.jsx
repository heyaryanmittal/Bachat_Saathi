import React, { useState, useEffect } from 'react';
import { Card, Button, Input, LoadingSpinner, StatsCard, UISelect } from '../components/ui';
import { 
  TrendingDown, AlertCircle, CheckCircle2, 
  Trash2, Plus, DollarSign, Calendar, 
  ArrowRight, Landmark, CreditCard, ShoppingBag, 
  Briefcase, GraduationCap, Car, ShieldAlert,
  Percent, History, Info, MoreVertical, RotateCcw,
  Edit, Trash, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';
import { toast } from 'react-hot-toast';
import { numberToWords } from '../utils/numberToWords';
import { format } from 'date-fns';

const DebtTracker = () => {
    const [debts, setDebts] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ show: false, debt: null, amount: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, debt: null });
    const [markPaidModal, setMarkPaidModal] = useState({ show: false, debt: null });
    const [rateModal, setRateModal] = useState({ show: false, debt: null, rate: '' });
    const [dateModal, setDateModal] = useState({ show: false, debt: null, date: '' });
    const [actionsModal, setActionsModal] = useState({ show: false, debt: null });
    const [newDebt, setNewDebt] = useState({ type: 'personal', title: '', amount: '', interestRate: '', dueDate: '', description: '' });

    useEffect(() => { 
        fetchAll(); 
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [dRes, sRes] = await Promise.all([api.getDebts(), api.getDebtStats()]);
            setDebts(dRes.data.data);
            setStats(sRes.data.data);
        } catch (e) { toast.error('Debt sync failed.'); }
        finally { setIsLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createDebt(newDebt);
            toast.success('Debt added.');
            setIsCreating(false);
            setNewDebt({ type: 'personal', title: '', amount: '', interestRate: '', dueDate: '', description: '' });
            fetchAll();
        } catch (e) { toast.error('Failed to add debt.'); }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await api.updateDebtPayment(paymentModal.debt._id, { paymentAmount: parseFloat(paymentModal.amount) });
            toast.success('Payment recorded.');
            setPaymentModal({ show: false, debt: null, amount: '' });
            fetchAll();
        } catch (e) { toast.error('Payment failed.'); }
    };

    const handleRateChange = async (e) => {
        e.preventDefault();
        try {
            await api.updateDebt(rateModal.debt._id, { interestRate: parseFloat(rateModal.rate) });
            toast.success('Interest rate updated.');
            setRateModal({ show: false, debt: null, rate: '' });
            fetchAll();
        } catch (e) { toast.error('Update failed.'); }
    };

    const handleDateChange = async (e) => {
        e.preventDefault();
        try {
            await api.updateDebt(dateModal.debt._id, { dueDate: new Date(dateModal.date) });
            toast.success('EMI date updated.');
            setDateModal({ show: false, debt: null, date: '' });
            fetchAll();
        } catch (e) { toast.error('Update failed.'); }
    };

    const confirmDelete = async () => {
        try {
            await api.deleteDebt(deleteModal.debt._id);
            toast.success('Debt deleted.');
            setDeleteModal({ show: false, debt: null });
            fetchAll();
        } catch (e) { toast.error('Failed to delete.'); }
    };

    const handleAddInterest = async (debt) => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.remainingAmount * monthlyRate;
        try {
            await api.updateDebtInterest(debt._id, { monthlyInterest: interest, newRemainingAmount: debt.remainingAmount + interest });
            toast.success(`Accrued ₹${interest.toFixed(2)} interest.`);
            fetchAll();
        } catch (e) { toast.error('Accrual error.'); }
    };

    const handleRemoveLastInterest = async (debt) => {
        try {
            await api.removeDebtInterest(debt._id);
            toast.success('Last interest entry removed.');
            fetchAll();
        } catch (e) { toast.error('Removal error.'); }
    };

    const handleResetInterest = async (debt) => {
        if (!window.confirm('Are you sure you want to clear ALL accumulated interest?')) return;
        try {
            await api.resetDebtInterest(debt._id);
            toast.success('Interest history cleared.');
            fetchAll();
        } catch (e) { toast.error('Reset error.'); }
    };

    const handleMarkPaid = async () => {
        try {
            await api.closeDebt(markPaidModal.debt._id);
            toast.success('Debt marked as paid off!');
            setMarkPaidModal({ show: false, debt: null });
            fetchAll();
        } catch (e) { toast.error('Action failed.'); }
    };

    const getTypeIcon = (type) => {
        const map = { personal: DollarSign, creditCard: CreditCard, loan: Landmark, business: Briefcase, education: GraduationCap, vehicle: Car, other: ShoppingBag };
        const Icon = map[type] || ShoppingBag;
        return <Icon className="w-5 h-5" />;
    };

    const getStatusConfig = (debt) => {
        if (debt.status === 'closed') return { label: 'Settled', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
        const due = new Date(debt.dueDate);
        const diff = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { label: 'Overdue', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: ShieldAlert };
        if (diff <= 3) return { label: 'Due Soon', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: AlertCircle };
        return { label: 'Active', color: 'bg-primary/10 text-primary border-primary/20', icon: History };
    };

    if (isLoading && !debts.length) {
        return <div className="h-[80vh] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading debts..." /></div>;
    }

    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatsCard title="Total Debt" value={stats.totalAmount || 0} variant="primary" icon={<DollarSign />} prefix="₹" />
                <StatsCard title="Remaining Balance" value={stats.totalRemaining || 0} variant="error" icon={<TrendingDown />} prefix="₹" />
                <StatsCard title="Active Debts" value={stats.activeDebts || 0} variant="secondary" icon={<History />} />
                <StatsCard title="Settled History" value={stats.totalDebts - stats.activeDebts || 0} variant="success" icon={<CheckCircle2 />} />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                <div className="bg-primary/5 border border-primary/10 py-2.5 px-5 rounded-2xl flex items-center gap-3 text-primary w-fit">
                    <Info className="w-4 h-4 opacity-70 flex-shrink-0" />
                    <p className="text-sm font-black italic tracking-tight uppercase">Advanced Debt Shield: Active</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="btn-saas-primary" size="lg"><Plus className="mr-2 w-5 h-5" />New Debt Record</Button>
            </div>

            <Card variant="glass" className="saas-card overflow-visible">
                <div className="p-8 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center"><Landmark className="w-4 h-4 mr-2" /> Financial Obligations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Source</th>
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Original</th>
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Remaining</th>
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Interest %</th>
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Interest Amt</th>
                                <th className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Due Date</th>
                                <th className="px-6 py-4 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {debts.length === 0 ? (
                                <tr><td colSpan="8" className="px-8 py-20 text-center text-muted-foreground font-black italic tracking-widest uppercase text-xs">Clear of all debts</td></tr>
                            ) : (
                                debts.map((d) => {
                                    const statusConfig = getStatusConfig(d);
                                    const { label, color: statusColor, icon: StatusIcon } = statusConfig;
                                    const accumulatedInterest = d.interestHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
                                    
                                    return (
                                        <tr key={d._id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-primary border border-border/50 group-hover:bg-primary/10 transition-colors">
                                                        {getTypeIcon(d.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tighter uppercase leading-tight">{d.title}</p>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70 italic">{d.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-xs">₹{d.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 font-black text-xs text-rose-500">₹{d.remainingAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-black text-xs">
                                                    <Percent className="w-3 h-3 text-muted-foreground" />
                                                    {d.interestRate}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-xs text-orange-500">
                                                ₹{accumulatedInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground/80">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {format(new Date(d.dueDate), 'MMM dd, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`mx-auto w-fit px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${statusColor}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActionsModal({ show: true, debt: d }); }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 hover:border-primary group shadow-sm active:scale-95"
                                                >
                                                    <MoreVertical className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest hidden md:inline">Manage</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-2xl w-full animate-entrance" size="xl">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase tracking-widest">New Financial Obligation</h3>
                                <p className="text-xs text-muted-foreground font-medium">Record a new commitment to your tracking matrix.</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="Source / Title" id="debt-title" name="title" value={newDebt.title} onChange={e => setNewDebt({...newDebt, title: e.target.value})} placeholder="e.g. ICICI Bank Loan" required />
                                <UISelect label="Liability Type" id="debt-type" name="type" value={newDebt.type} onChange={e => setNewDebt({...newDebt, type: e.target.value})} options={[
                                    { value: 'loan', label: 'Mortgage / Home Loan' }, { value: 'creditCard', label: 'Credit Card Debt' }, { value: 'personal', label: 'Personal Loan' }, { value: 'education', label: 'Education Loan' }, { value: 'vehicle', label: 'Vehicle Loan' }, { value: 'business', label: 'Business Credit' }, { value: 'other', label: 'Other Debt' }
                                ]}/>
                                <div className="space-y-1">
                                    <Input label="Principal Amount (₹)" id="debt-amount" name="amount" type="number" value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} placeholder="0.00" required />
                                    {Number(newDebt.amount) > 0 && <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 italic">{numberToWords(Number(newDebt.amount))}</p>}
                                </div>
                                <Input label="Interest Rate (Annual %)" id="debt-interest" name="interestRate" type="number" step="0.01" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} placeholder="0.00" />
                                <div className="md:col-span-2">
                                    <Input label="Due Date" id="debt-due-date" name="dueDate" type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Contextual Notes</label>
                                <textarea className="input-saas w-full min-h-[100px] resize-none" value={newDebt.description} onChange={e => setNewDebt({...newDebt, description: e.target.value})} placeholder="Specific terms, account numbers, etc."/>
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" size="xl" className="flex-1 btn-saas-primary">Secure Record</Button>
                                <Button variant="secondary" size="xl" className="flex-1 font-black uppercase text-[10px] tracking-widest" onClick={() => setIsCreating(false)}>Dismiss</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {paymentModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 font-black text-2xl text-primary italic">
                            %
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Partial Settlement</h3>
                        <p className="text-sm text-muted-foreground mb-8">Settling a segment of <span className="text-foreground font-black">{paymentModal.debt?.title}</span>.</p>
                        <form onSubmit={handlePayment}>
                            <div className="space-y-1 text-left">
                                <Input label="Settlement Amount (₹)" id="payment-amount" name="amount" type="number" step="0.01" value={paymentModal.amount} onChange={e => setPaymentModal({...paymentModal, amount: e.target.value})} placeholder="0.00" required autoFocus />
                                {Number(paymentModal.amount) > 0 && <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 italic mt-1">{numberToWords(Number(paymentModal.amount))}</p>}
                            </div>
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Confirm Settlement</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setPaymentModal({ show: false, debt: null, amount: '' })}>Close</Button>
                        </form>
                    </Card>
                </div>
            )}

            {rateModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <Percent className="w-12 h-12 text-primary mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Update Rate</h3>
                        <p className="text-sm text-muted-foreground mb-8 text-[10px] font-black uppercase tracking-widest italic opacity-70">Updating Interest Policy</p>
                        <form onSubmit={handleRateChange}>
                            <Input label="New Annual Rate (%)" id="new-rate" name="rate" type="number" step="0.01" value={rateModal.rate} onChange={e => setRateModal({...rateModal, rate: e.target.value})} required autoFocus />
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Apply Change</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setRateModal({ show: false, debt: null, rate: '' })}>Dismiss</Button>
                        </form>
                    </Card>
                </div>
            )}

            {dateModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <Calendar className="w-12 h-12 text-primary mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">emi date</h3>
                        <p className="text-sm text-muted-foreground mb-8 text-[10px] font-black uppercase tracking-widest italic opacity-70">Rescheduling EMI Cycle</p>
                        <form onSubmit={handleDateChange}>
                            <Input label="New EMI Date" id="new-date" name="date" type="date" value={dateModal.date} onChange={e => setDateModal({...dateModal, date: e.target.value})} required autoFocus />
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Update Cycle</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setDateModal({ show: false, debt: null, date: '' })}>Dismiss</Button>
                        </form>
                    </Card>
                </div>
            )}

            {markPaidModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance text-center" size="xl">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Full Settlement</h3>
                        <p className="text-sm text-muted-foreground mb-8 font-medium">Confirm you have fully settled <span className="text-foreground font-black">{markPaidModal.debt?.title}</span>. This will zero the balance and archive the record.</p>
                        <div className="flex gap-4">
                            <Button variant="success" size="xl" className="flex-1 bg-emerald-500" onClick={handleMarkPaid}>Confirm Settlement</Button>
                            <Button variant="secondary" size="xl" className="flex-1" onClick={() => setMarkPaidModal({ show: false, debt: null })}>Review</Button>
                        </div>
                    </Card>
                </div>
            )}

            {actionsModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10" size="xl">
                        <div className="p-8 border-b border-border/50 bg-muted/20 relative">
                            <button onClick={() => setActionsModal({ show: false, debt: null })} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl ring-4 ring-primary/5">
                                    {getTypeIcon(actionsModal.debt?.type)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-widest leading-none mb-1">{actionsModal.debt?.title}</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-tighter italic">Liability Shield Control Panel</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-4">
                            {actionsModal.debt?.status !== 'closed' ? (
                                <>
                                    <button 
                                        onClick={() => { setDateModal({ show: true, debt: actionsModal.debt, date: format(new Date(actionsModal.debt.dueDate), 'yyyy-MM-dd') }); setActionsModal({ show: false, debt: null }); }} 
                                        className="btn-saas-secondary py-5 flex flex-col items-center gap-3 group bg-primary/5 border-primary/10"
                                    >
                                        <Calendar className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">EMI Date</span>
                                    </button>

                                    <button 
                                        onClick={() => { setRateModal({ show: true, debt: actionsModal.debt, rate: actionsModal.debt.interestRate }); setActionsModal({ show: false, debt: null }); }} 
                                        className="btn-saas-secondary py-5 flex flex-col items-center gap-3 group bg-primary/5 border-primary/10"
                                    >
                                        <Percent className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Change Rate</span>
                                    </button>

                                    <button 
                                        onClick={() => { handleAddInterest(actionsModal.debt); setActionsModal({ show: false, debt: null }); }} 
                                        className="btn-saas-secondary py-5 flex flex-col items-center gap-3 group bg-orange-500/5 border-orange-500/10 text-orange-500"
                                    >
                                        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Interest</span>
                                    </button>

                                    <button 
                                        onClick={() => { handleRemoveLastInterest(actionsModal.debt); setActionsModal({ show: false, debt: null }); }} 
                                        className="btn-saas-secondary py-5 flex flex-col items-center gap-3 group bg-muted/50 border-border"
                                    >
                                        <RotateCcw className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Undo Interest</span>
                                    </button>

                                    <button 
                                        onClick={() => { setPaymentModal({ show: true, debt: actionsModal.debt, amount: '' }); setActionsModal({ show: false, debt: null }); }}
                                        className="col-span-2 py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all mt-2"
                                    >
                                        <Landmark className="w-4 h-4" /> Partial Payment Settlement
                                    </button>

                                    <button 
                                        onClick={() => { setMarkPaidModal({ show: true, debt: actionsModal.debt }); setActionsModal({ show: false, debt: null }); }} 
                                        className="col-span-2 py-4 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Paid Off / Settle Full
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => { setDeleteModal({ show: true, debt: actionsModal.debt }); setActionsModal({ show: false, debt: null }); }} 
                                    className="col-span-2 py-8 bg-rose-500/10 text-rose-500 border-2 border-rose-500/50 rounded-2xl flex flex-col items-center justify-center gap-4 font-black uppercase text-xs tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/10"
                                >
                                    <Trash2 className="w-10 h-10 mb-2" />
                                    Delete Archive Record
                                </button>
                            )}
                        </div>

                        <div className="p-4 bg-muted/10 text-center text-muted-foreground text-[9px] font-black uppercase tracking-widest border-t border-border/30 italic">
                            Operational Integrity Secured
                        </div>
                    </Card>
                </div>
            )}

            {deleteModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance text-center" size="xl">
                        <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Purge Record?</h3>
                        <p className="text-sm text-muted-foreground mb-8 font-medium">Permanently removing <span className="text-foreground font-black">{deleteModal.debt?.title}</span> from historical archives.</p>
                        <div className="flex gap-4">
                            <Button variant="danger" size="xl" className="flex-1" onClick={confirmDelete}>Terminate</Button>
                            <Button variant="secondary" size="xl" className="flex-1" onClick={() => setDeleteModal({ show: false, debt: null })}>Preserve</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DebtTracker;
