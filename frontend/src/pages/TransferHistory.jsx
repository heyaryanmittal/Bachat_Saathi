import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Card, Button, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  ArrowRightLeft, Calendar, Wallet, 
  ArrowRight, History, Info, Clock,
  ArrowUpRight, ArrowDownLeft, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const TransferHistory = () => {
    const [transfers, setTransfers] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [wRes, tRes] = await Promise.all([
                    api.getWallets(),
                    api.getTransactions({ type: 'Transfer', limit: 1000 })
                ]);
                setWallets(wRes.data.data.wallets || []);
                setTransfers(tRes.data.data.transactions || []);
            } catch (e) { /* silent */ }
            finally { setIsLoading(false); }
        };
        fetchAll();
    }, []);

    const getWalletName = (id) => wallets.find(w => w._id === id)?.name || id;

    if (isLoading && !transfers.length) {
        return <div className="h-[80vh] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Deciphering transfer matrix..." /></div>;
    }

    return (
        <div className="pt-24 space-y-12 animate-entrance pb-12 overflow-x-hidden px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Transfer <span className="text-gradient">Ledger</span></h1>
                    <p className="text-muted-foreground font-medium text-lg italic tracking-tight">Internal capital relocation streams between secured nodes.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="lg"><Calendar className="w-4 h-4 mr-2" />Temporal Filter</Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-4">
                <StatsCard title="Total Relocations" value={transfers.length} variant="primary" icon={<ArrowRightLeft />} />
                <StatsCard title="Gross Volume" value={transfers.reduce((acc, t) => acc + t.amount, 0)} variant="gradient" icon={<History />} />
                <StatsCard title="Active Channels" value={wallets.length} variant="secondary" icon={<Wallet />} />
            </div>

            {/* Table */}
            <div className="px-4">
                <Card variant="glass" className="saas-card overflow-hidden">
                    <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center"><History className="w-4 h-4 mr-2" /> Stream History</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                                <input type="text" placeholder="Search streams..." className="input-saas pl-10 h-10 w-64 text-[11px] uppercase tracking-tighter font-black border-border/50 bg-background/50" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Temporal Logic</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Relocation Volume</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Channel Egress</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Channel Ingress</th>
                                    <th className="px-8 py-4 text-left font-black text-[10px] uppercase tracking-widest text-muted-foreground">Meta Data</th>
                                    <th className="px-8 py-4 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {transfers.length === 0 ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-muted-foreground font-black italic uppercase text-xs tracking-widest">No transfer patterns detected</td></tr>
                                ) : (
                                    transfers.map(t => (
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
                                            <td className="px-8 py-6 text-muted-foreground font-medium lowercase normal-case tracking-normal max-w-[200px] truncate group-hover:normal-case">{t.notes || 'No meta sequence defined.'}</td>
                                            <td className="px-8 py-6">
                                                <div className="mx-auto w-fit px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">Stream Logic: Valid</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Protocol Notice */}
            <div className="px-4">
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-center gap-4 text-primary max-w-2xl mx-auto">
                    <Info className="w-8 h-8 opacity-50 flex-shrink-0" />
                    <p className="text-sm font-black italic tracking-tight uppercase">Security Protocol: Internal transfers reflect relocations between your secured wallet nodes. These operations do not affect gross net-worth metrics.</p>
                </div>
            </div>
        </div>
    );
};

export default TransferHistory;
