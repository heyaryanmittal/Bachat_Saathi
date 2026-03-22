import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { UISelect, Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';

import { 
  ArrowRightLeft, Calendar, Wallet, 
  ArrowRight, History, Info, Clock,
  ArrowUpRight, ArrowDownLeft, Search, Filter, Plus, X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { numberToWords } from '../utils/numberToWords';

const TransferHistory = () => {
    const [transfers, setTransfers] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', walletId: '' });
    const [search, setSearch] = useState('');
    
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferData, setTransferData] = useState({ from: '', to: '', amount: '', notes: '' });
    const [isTransferring, setIsTransferring] = useState(false);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [wRes, tRes] = await Promise.all([
                api.getWallets(),
                api.getTransactions({ 
                    type: 'Transfer', 
                    limit: 1000,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    walletId: filters.walletId
                })
            ]);
            setWallets(wRes.data.data.wallets || []);
            setTransfers(tRes.data.data.transactions || []);
        } catch (e) { toast.error('Failed to sync history.'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchAll();
    }, [filters]);

    const getWalletName = (wallet) => {
        if (!wallet) return 'Unknown';
        const id = typeof wallet === 'object' ? wallet?._id : wallet;
        const name = typeof wallet === 'object' ? wallet?.name : null;
        if (name) return name;
        return wallets.find(w => w._id === id)?.name || 'Direct Entry';
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!transferData.from || !transferData.to || !transferData.amount) {
            toast.error('Complete all transfer fields');
            return;
        }
        if (transferData.from === transferData.to) {
            toast.error('Source and target wallets must be different');
            return;
        }

        setIsTransferring(true);
        try {
            await api.createTransaction({
                type: 'Transfer',
                amount: Number(transferData.amount),
                walletId: transferData.from,
                toWallet: transferData.to,
                notes: transferData.notes,
                date: new Date()
            });
            await fetchAll();
            setShowTransferModal(false);
            setTransferData({ from: '', to: '', amount: '', notes: '' });
            toast.success('Funds moved successfully!');
        } catch (e) {
            toast.error('Transfer failed.');
        } finally {
            setIsTransferring(false);
        }
    };

    const filteredTransfers = transfers.filter(t => {
        const fromName = getWalletName(t.walletId) || '';
        const toName = getWalletName(t.toWallet) || '';
        const notes = t.notes || '';
        const searchLower = search.toLowerCase();
        
        return (
            fromName.toLowerCase().includes(searchLower) ||
            toName.toLowerCase().includes(searchLower) ||
            notes.toLowerCase().includes(searchLower)
        );
    });


    if (isLoading && !transfers.length) {
        return <div className="h-[80vh] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Syncing transfer matrix..." /></div>;
    }

    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-4">
                <StatsCard title="Transfer Volume" value={transfers.length} variant="secondary" icon={<ArrowRightLeft />} />
                <StatsCard title="Capital Shifted" value={transfers.reduce((acc, t) => acc + t.amount, 0)} variant="gradient" icon={<History />} prefix="₹" />
                <StatsCard title="Active Nodes" value={wallets.length} variant="primary" icon={<Wallet />} />
            </div>
            {}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/40 dark:bg-white/5 p-4 rounded-3xl border border-border/50">
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Timeline Start</label>
                        <Input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="h-10 text-xs" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Timeline End</label>
                        <Input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="h-10 text-xs" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Node Filter</label>
                        <UISelect 
                            value={filters.walletId} 
                            onChange={e => setFilters({...filters, walletId: e.target.value})} 
                            options={wallets.map(w => ({ value: w._id, label: w.name }))}
                            placeholder="All Nodes"
                            className="h-10 text-xs py-2"
                        />
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <Button 
                        onClick={() => setShowTransferModal(true)} 
                        className="btn-saas-primary w-full lg:w-auto h-14 rounded-2xl shadow-xl shadow-primary/20" 
                        size="lg"
                    >
                        <ArrowRightLeft className="w-5 h-5 mr-3" /> Execute New Transfer
                    </Button>
                </div>
            </div>

            {}
            <div className="px-4">
                <Card variant="glass" className="saas-card overflow-hidden">
                    <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center"><History className="w-4 h-4 mr-2" /> Recent Transfers</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Input 
                                    id="search-transfers"
                                    name="search"
                                    type="text" 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search transfers..." 
                                    className="pl-10 h-10 w-full sm:w-64 text-[11px] uppercase tracking-tighter font-black" 

                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50 z-10" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Date & Time</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Amount</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">From Wallet</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">To Wallet</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Notes</th>
                                    <th className="px-8 py-4 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredTransfers.length === 0 ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-muted-foreground font-black uppercase text-xs tracking-widest">No matching transfers found</td></tr>
                                ) : (
                                    filteredTransfers.map(t => (

                                        <tr key={t._id} className="hover:bg-muted/20 transition-colors group text-[11px] font-black italic uppercase tracking-tighter">
                                            <td className="px-8 py-6 flex items-center gap-3">
                                                <div className="p-2 bg-muted/50 rounded-lg"><Clock className="w-3.5 h-3.5 opacity-50"/></div>
                                                <div>
                                                    <p className="text-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                                                    <p className="text-[9px] opacity-50 text-muted-foreground">{format(new Date(t.date), 'HH:mm:ss')}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm tracking-tighter text-blue-500">₹{t.amount.toLocaleString()}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <ArrowDownLeft className="w-3 h-3"/>
                                                    {getWalletName(t.walletId)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-emerald-500">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpRight className="w-3 h-3"/>
                                                    {getWalletName(t.toWallet)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-muted-foreground font-medium lowercase normal-case tracking-normal max-w-[200px] truncate group-hover:normal-case">{t.notes || 'No notes provided.'}</td>
                                            <td className="px-8 py-6">
                                                <div className="mx-auto w-fit px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">Completed</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {}
            {}
            {showTransferModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance border-2 border-primary/20 shadow-2xl" size="xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center">
                                <ArrowRightLeft className="w-6 h-6 mr-3 text-primary" /> Transfer Funds
                            </h3>
                            <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleTransfer} className="space-y-6">
                            <UISelect 
                                label="Source Node"
                                id="transfer-from"
                                value={transferData.from}
                                onChange={e => setTransferData({...transferData, from: e.target.value})}
                                options={wallets.map(w => ({ value: w._id, label: `${w.name} (₹${w.currentBalance})` }))}
                                required
                                placeholder="From Wallet..."
                            />
                            <UISelect 
                                label="Destination Node"
                                id="transfer-to"
                                value={transferData.to}
                                onChange={e => setTransferData({...transferData, to: e.target.value})}
                                options={wallets.filter(w => w._id !== transferData.from).map(w => ({ value: w._id, label: `${w.name} (₹${w.currentBalance})` }))}
                                required
                                placeholder="To Wallet..."
                            />
                            <div className="space-y-2">
                                <Input
                                    label="Magnitude (₹)"
                                    type="number"
                                    value={transferData.amount}
                                    onChange={e => setTransferData({...transferData, amount: e.target.value})}
                                    placeholder="0.00"
                                    required
                                />
                                {Number(transferData.amount) > 0 && (
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1">
                                        {numberToWords(Number(transferData.amount))}
                                    </p>
                                )}
                            </div>
                            <Input
                                label="Meta Description"
                                value={transferData.notes}
                                onChange={e => setTransferData({...transferData, notes: e.target.value})}
                                placeholder="Purpose of capital shift..."
                            />
                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <Button type="button" variant="secondary" onClick={() => setShowTransferModal(false)} className="w-full h-12 rounded-xl">Hold Action</Button>
                                <Button type="submit" className="w-full btn-saas-primary h-12 rounded-xl" loading={isTransferring}>Confirm Shift</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default TransferHistory;

