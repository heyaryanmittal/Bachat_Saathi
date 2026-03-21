import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Target, Zap, 
  ShieldCheck, Info, Sparkles, Trophy,
  Wallet, Landmark, Receipt, Calendar,
  TrendingUp, AlertTriangle, ShieldAlert,
  ChevronRight, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, Button, LoadingSpinner, StatsCard } from '../components/ui';
import { motion } from 'framer-motion';

function PointsInfoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [usageStats, setUsageStats] = useState({
        totalTransactions: 0,
        totalBudgets: 0,
        totalDebts: 0,
        totalGoals: 0,
        totalWallets: 0,
        daysActive: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsageStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/users/usage-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.status === 'success') {
                    setUsageStats(response.data.data);
                }
            } catch (error) { /* silent */ }
            finally { setLoading(false); }
        };
        if (user) fetchUsageStats();
    }, [user]);

    if (loading) return <div className="fixed inset-0 z-[10000] bg-background flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading stats..." /></div>;

    const containers = {
        animate: { transition: { staggerChildren: 0.1 } }
    };

    const item = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    };

    return (
        <div className="fixed inset-0 z-[10000] overflow-y-auto bg-background/95 backdrop-blur-xl py-6 px-4 selection:bg-primary selection:text-white">
            <div className="max-w-5xl mx-auto space-y-6 animate-entrance pb-24">
                {/* Metrics Grid */}
                <motion.div variants={containers} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <motion.div variants={item}><StatsCard title="Days Active" value={usageStats.daysActive} variant="primary" prefix={null} /></motion.div>
                    <motion.div variants={item}><StatsCard title="Transactions" value={usageStats.totalTransactions} variant="success" prefix={null} /></motion.div>
                    <motion.div variants={item}><StatsCard title="Budgets" value={usageStats.totalBudgets} variant="gradient" prefix={null} /></motion.div>
                    <motion.div variants={item}><StatsCard title="Debts Paid" value={usageStats.totalDebts} variant="error" prefix={null} /></motion.div>
                    <motion.div variants={item}><StatsCard title="Goals" value={usageStats.totalGoals} variant="secondary" prefix={null} /></motion.div>
                    <motion.div variants={item}><StatsCard title="Wallets" value={usageStats.totalWallets} variant="primary" prefix={null} /></motion.div>
                </motion.div>

                {/* Navigation (Back Button) */}
                <button onClick={() => navigate(-1)} className="group flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Dashboard
                </button>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Efficiency Tips */}
                    <Card variant="glass" className="saas-card p-8 lg:col-span-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Best Practices</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Consistency', desc: 'Log in daily to earn bonus points.' },
                                { title: 'Financial Accuracy', desc: 'Log every transaction to keep your balance accurate.' },
                                { title: 'Budget Tracking', desc: 'Review your spending against your budget weekly.' },
                                { title: 'Goal Progress', desc: 'Update your goals regularly to earn more points.' },
                                { title: 'Leaderboard', desc: 'Check the leaderboard to see how you compare.' },
                                { title: 'Wallet Management', desc: 'Use multiple wallets to organize your money.' },
                            ].map((tip, i) => (
                                <div key={i} className="group p-4 bg-muted/20 rounded-2xl border border-border/50 hover:bg-muted/30 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">0{i+1}</div>
                                        <h4 className="font-black text-[11px] uppercase tracking-tighter">{tip.title}</h4>
                                    </div>
                                    <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Reward Multipliers */}
                    <Card variant="glass" className="saas-card p-8 bg-primary/5 border-primary/20">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8 flex items-center"><Zap className="w-4 h-4 mr-2" /> Earning Points</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Create Wallet', val: '+100 PT', icon: <Activity className="w-4 h-4" /> },
                                { label: 'First Transaction', val: '+50 PT', icon: <Receipt className="w-4 h-4" /> },
                                { label: '7-Day Streak', val: '+100 PT', icon: <Calendar className="w-4 h-4" /> },
                                { label: 'Paid Off Debt', val: '+150 PT', icon: <Landmark className="w-4 h-4" /> },
                                { label: 'Achieved Goal', val: '+300 PT', icon: <Target className="w-4 h-4" /> },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="text-primary">{row.icon}</div>
                                        <span className="font-black text-[10px] uppercase tracking-tighter">{row.label}</span>
                                    </div>
                                    <span className="font-black text-xs text-primary">{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Tiers */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center"><Trophy className="w-4 h-4 mr-2" /> Badge Tiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { name: 'Bronze', pts: '0 - 999', color: 'from-amber-600/20' },
                            { name: 'Silver', pts: '1,000 - 4,999', color: 'from-slate-400/20' },
                            { name: 'Gold', pts: '5,000 - 9,999', color: 'from-yellow-500/20' },
                            { name: 'Platinum', pts: '10,000+', color: 'from-cyan-400/20' },
                        ].map((t, i) => (
                            <div key={i} className={`bg-gradient-to-br ${t.color} to-transparent p-6 rounded-3xl border border-border/50 text-center group hover:scale-105 transition-transform`}>
                                <h4 className="font-black text-xl tracking-tighter uppercase mb-1">{t.name}</h4>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">{t.pts} PTS</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card variant="glass" className="saas-card p-8 border-amber-500/20 bg-amber-500/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Debt Management Rules</h3>
                        <ul className="space-y-4">
                            {[
                                'Debts are archived 30 days after they are paid off.',
                                'Active transactions cannot be bulk deleted.',
                                'Archived data is still reflected in your total history.',
                                'Points earned are permanent.',
                            ].map((rule, i) => (
                                <li key={i} className="flex items-start gap-3 text-[11px] font-black text-amber-500/80 uppercase tracking-tighter italic">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card variant="glass" className="saas-card p-8 border-rose-500/20 bg-rose-500/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-6 flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> Wallet Deletion Rules</h3>
                        <ul className="space-y-4">
                            {[
                                'Wallets must have zero balance to be deleted.',
                                'Deleting a wallet removes its transaction history.',
                                'Associated goals and budgets may be affected.',
                                'Main wallets cannot be deleted if they are set as primary.',
                            ].map((rule, i) => (
                                <li key={i} className="flex items-start gap-3 text-[11px] font-black text-rose-500/80 uppercase tracking-tighter italic">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Contact/Support CTA */}
                <div className="text-center pt-8">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 italic">Have questions about how it works?</p>
                    <Button variant="secondary" size="xl" className="font-black uppercase text-[10px] tracking-widest">Contact Support</Button>
                </div>
            </div>
        </div>
    );
}

export default PointsInfoPage;
