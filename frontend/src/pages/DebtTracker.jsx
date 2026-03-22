import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  TrendingDown, AlertCircle, CheckCircle2, 
  Trash2, Plus, DollarSign, Calendar, 
  ArrowRight, Landmark, CreditCard, ShoppingBag, 
  Briefcase, GraduationCap, Car, ShieldAlert,
  Percent, History, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { numberToWords } from '../utils/numberToWords';
import { format } from 'date-fns';
const DebtTracker = () => {
    const [debts, setDebts] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [paymentModal, setPaymentModal] = useState({ show: false, debt: null, amount: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, debt: null });
    const [newDebt, setNewDebt] = useState({ type: 'personal', title: '', amount: '', interestRate: '', dueDate: '', description: '' });
    useEffect(() => { fetchAll(); }, []);
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
    const confirmDelete = async () => {
        try {
            await api.deleteDebt(deleteModal.debt._id);
            toast.success('Debt deleted.');
            setDeleteModal({ show: false, debt: null });
            fetchAll();
        } catch (e) { toast.error('Failed to delete.'); }
    };
    const handleInterest = async (debt) => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.remainingAmount * monthlyRate;
        try {
            await api.updateDebtInterest(debt._id, { monthlyInterest: interest, newRemainingAmount: debt.remainingAmount + interest });
            toast.success(`Accrued ₹${interest.toFixed(2)} interest.`);
            fetchAll();
        } catch (e) { toast.error('Accrual error.'); }
    };
    const getTypeIcon = (type) => {
        const map = { personal: DollarSign, creditCard: CreditCard, loan: Landmark, business: Briefcase, education: GraduationCap, vehicle: Car, other: ShoppingBag };
        const Icon = map[type] || ShoppingBag;
        return <Icon className="w-5 h-5" />;
    };
    const getStatusConfig = (debt) => {
        if (debt.status === 'closed') return { label: 'Paid Off', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
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
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatsCard title="Total Debt" value={stats.totalAmount || 0} variant="primary" icon={<DollarSign />} />
                <StatsCard title="Remaining Balance" value={stats.totalRemaining || 0} variant="error" icon={<TrendingDown />} />
                <StatsCard title="Active Debts" value={stats.activeDebts || 0} variant="secondary" icon={<History />} />
                <StatsCard title="Paid Off" value={stats.totalDebts - stats.activeDebts || 0} variant="success" icon={<CheckCircle2 />} />
            </div>
            {}
            <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-2">
                <Button onClick={() => setIsCreating(true)} className="btn-saas-primary" size="lg"><Plus className="mr-2 w-5 h-5" />Add Debt</Button>
            </div>
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-center gap-4 text-primary max-w-2xl mx-auto">
                <Info className="w-8 h-8 opacity-50 flex-shrink-0" />
                <p className="text-sm font-black italic tracking-tight">Note: Only fully paid debts can be deleted from your records. Active debts must be paid off first.</p>
            </div>
            {}
            <Card variant="glass" className="saas-card overflow-hidden">
                <div className="p-8 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center"><Landmark className="w-4 h-4 mr-2" /> Active Debts</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Source</th>
                                <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Principal</th>
                                <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Remaining</th>
                                <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Interest</th>
                                <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Due Date</th>
                                <th className="px-8 py-4 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-8 py-4 text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {debts.length === 0 ? (
                                <tr><td colSpan="7" className="px-8 py-20 text-center text-muted-foreground font-black italic tracking-widest uppercase text-xs">No debts found</td></tr>
                            ) : (
                                debts.map(d => {
                                    const { label, color, icon: StatusIcon } = getStatusConfig(d);
                                    return (
                                        <tr key={d._id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary border border-border/50 group-hover:scale-110 transition-transform">
                                                        {getTypeIcon(d.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tighter uppercase">{d.title}</p>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70">{d.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-sm tracking-tighter italic">₹{d.amount.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-black text-sm tracking-tighter text-rose-500 italic">₹{d.remainingAmount.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-black text-sm tracking-tighter italic flex items-center gap-2">
                                                <Percent className="w-3 h-3 text-muted-foreground" />
                                                {d.interestRate}%
                                            </td>
                                            <td className="px-8 py-6 text-[11px] font-black uppercase text-muted-foreground italic flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(d.dueDate), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`mx-auto w-fit px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {d.status !== 'closed' && (
                                                        <>
                                                            <Button variant="secondary" size="sm" onClick={() => setPaymentModal({ show: true, debt: d, amount: '' })} className="text-[9px] font-black">Make Payment</Button>
                                                            {d.interestRate > 0 && (
                                                                <Button variant="secondary" size="sm" onClick={() => handleInterest(d)} className="text-[9px] font-black"><TrendingDown className="w-3 h-3 mr-1" /> Add Interest</Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {d.status === 'closed' && (
                                                        <Button variant="secondary" size="sm" onClick={() => setDeleteModal({ show: true, debt: d })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            {}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-2xl w-full animate-entrance" size="xl">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase tracking-widest">Add New Debt</h3>
                                <p className="text-xs text-muted-foreground font-medium">Add a new financial commitment to track.</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="Debt Title" value={newDebt.title} onChange={e => setNewDebt({...newDebt, title: e.target.value})} placeholder="e.g. HDFC Home Loan" required />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Type</label>
                                    <select value={newDebt.type} onChange={e => setNewDebt({...newDebt, type: e.target.value})} className="input-saas w-full">
                                        <option value="personal">Personal Loan</option>
                                        <option value="creditCard">Credit Card</option>
                                        <option value="loan">Mortgage</option>
                                        <option value="business">Business Loan</option>
                                        <option value="education">Education Loan</option>
                                        <option value="vehicle">Car Loan</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Input label="Principal Amount (₹)" type="number" value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} placeholder="0.00" required />
                                    {Number(newDebt.amount) > 0 && (
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1 text-left">
                                            {numberToWords(Number(newDebt.amount))}
                                        </p>
                                    )}
                                </div>
                                <Input label="Interest Rate (%)" type="number" step="0.01" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} placeholder="0.00" />
                                <div className="md:col-span-2">
                                    <Input label="Due Date" type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Notes</label>
                                <textarea className="input-saas w-full min-h-[100px] resize-none" value={newDebt.description} onChange={e => setNewDebt({...newDebt, description: e.target.value})} placeholder="Additional details..."/>
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" size="xl" className="flex-1 btn-saas-primary">Add Debt</Button>
                                <Button variant="secondary" size="xl" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {}
            {paymentModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <DollarSign className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Make Payment</h3>
                        <p className="text-sm text-muted-foreground mb-8">Recording a payment for <span className="text-foreground font-black">{paymentModal.debt?.title}</span>.</p>
                        <form onSubmit={handlePayment}>
                            <div className="space-y-1 text-left">
                                <Input label="Amount (₹)" type="number" step="0.01" value={paymentModal.amount} onChange={e => setPaymentModal({...paymentModal, amount: e.target.value})} placeholder="0.00" required autoFocus />
                                {Number(paymentModal.amount) > 0 && (
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1">
                                        {numberToWords(Number(paymentModal.amount))}
                                    </p>
                                )}
                            </div>
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Record Payment</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setPaymentModal({ show: false, debt: null, amount: '' })}>Cancel</Button>
                        </form>
                    </Card>
                </div>
            )}
            {}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance text-center" size="xl">
                        <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Delete Record?</h3>
                        <p className="text-sm text-muted-foreground mb-8 font-medium">Removing <span className="text-foreground font-black">{deleteModal.debt?.title}</span> from your records. This action is permanent.</p>
                        <div className="flex gap-4">
                            <Button variant="danger" size="xl" className="flex-1" onClick={confirmDelete}>Delete</Button>
                            <Button variant="secondary" size="xl" className="flex-1" onClick={() => setDeleteModal({ show: false, debt: null })}>Keep</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default DebtTracker;
