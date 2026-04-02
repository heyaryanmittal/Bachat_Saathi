import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Card, Button, LoadingSpinner, StatsCard } from '../components/ui';
import {
  Trophy, Medal, TrendingUp, Star, Crown, 
  Users, Zap, Target, Flame, Award, 
  TrendingDown, ArrowUp, ChevronRight, Globe,
  ShieldCheck, Activity, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const Leaderboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('monthly');
    const [monthlyLeaderboard, setMonthlyLeaderboard] = useState([]);
    const [lifetimeLeaderboard, setLifetimeLeaderboard] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [mRes, lRes, sRes, mCtx, lCtx] = await Promise.all([
                    api.get('/leaderboard/monthly?limit=10'),
                    api.get('/leaderboard/lifetime?limit=10'),
                    api.get('/leaderboard/user/stats'),
                    api.get('/leaderboard/user/context?type=monthly&range=2'),
                    api.get('/leaderboard/user/context?type=lifetime&range=2')
                ]);
                setMonthlyLeaderboard(mRes.data.data);
                setLifetimeLeaderboard(lRes.data.data);
                setUserStats({
                    ...sRes.data.data,
                    monthlyContext: mCtx.data.data.context,
                    lifetimeContext: lCtx.data.data.context
                });
            } catch (e) {  }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);
    const getBadgeIcon = (badge) => {
        if (badge?.includes('king')) return '👑';
        if (badge?.includes('top')) return '⭐';
        if (badge?.includes('smart')) return '✨';
        return '🏆';
    };
    const currentLeaderboard = activeTab === 'monthly' ? monthlyLeaderboard : lifetimeLeaderboard;
    if (loading) return <div className="h-[80vh] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading leaderboard..." /></div>;
    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {}
            {currentLeaderboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
                    {}
                    {currentLeaderboard[1] && (
                        <Card variant="glass" className="saas-card p-8 h-fit order-2 md:order-1 border-slate-400/30 bg-slate-400/5 group hover:scale-105 transition-transform duration-500">
                             <div className="flex flex-col items-center text-center">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🥈</div>
                                <h3 className="font-black text-xl tracking-tighter uppercase mb-1">{currentLeaderboard[1].username}</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-6 tracking-widest">Rank #2</p>
                                <div className="text-3xl font-black text-primary tracking-tighter mb-1">
                                    {Number((activeTab === 'monthly' ? currentLeaderboard[1].monthlyPoints : currentLeaderboard[1].lifetimePoints) || 0).toLocaleString()}
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
                             </div>
                        </Card>
                    )}
                    {}
                    {currentLeaderboard[0] && (
                        <Card variant="glass" className="saas-card p-12 order-1 md:order-2 border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden group hover:scale-110 transition-transform duration-500">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <Crown className="w-24 h-24" />
                             </div>
                             <div className="flex flex-col items-center text-center relative z-10">
                                <div className="text-6xl mb-6 animate-float">🥇</div>
                                <h3 className="font-black text-3xl tracking-tighter uppercase mb-1">{currentLeaderboard[0].username}</h3>
                                <p className="text-[11px] font-black text-yellow-500/70 uppercase mb-8 tracking-widest">Saving Champion</p>
                                <div className="text-5xl font-black text-primary tracking-tighter mb-2">
                                    {Number((activeTab === 'monthly' ? currentLeaderboard[0].monthlyPoints : currentLeaderboard[0].lifetimePoints) || 0).toLocaleString()}
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
                             </div>
                        </Card>
                    )}
                    {}
                    {currentLeaderboard[2] && (
                        <Card variant="glass" className="saas-card p-8 h-fit order-3 border-amber-600/30 bg-amber-600/5 group hover:scale-105 transition-transform duration-500">
                             <div className="flex flex-col items-center text-center">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🥉</div>
                                <h3 className="font-black text-xl tracking-tighter uppercase mb-1">{currentLeaderboard[2].username}</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-6 tracking-widest">Rank #3</p>
                                <div className="text-3xl font-black text-primary tracking-tighter mb-1">
                                    {Number((activeTab === 'monthly' ? currentLeaderboard[2].monthlyPoints : currentLeaderboard[2].lifetimePoints) || 0).toLocaleString()}
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
                             </div>
                        </Card>
                    )}
                </div>
            )}
            {}
            <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-4">
                <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 w-full md:w-auto shadow-sm">
                    {['monthly', 'lifetime'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 md:px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-background shadow-lg text-primary border border-border/50' : 'text-muted-foreground'}`}>{t === 'monthly' ? 'This Month' : 'All Time'}</button>
                    ))}
                </div>
            </div>
            {}
            {userStats && (
                <div className="px-4">
                    <Card variant="glass" className="saas-card p-8 bg-primary/5 border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 p-8 opacity-5">
                            <Activity className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8 flex items-center"><Target className="w-4 h-4 mr-2" /> Your Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Rank</p>
                                    <p className="text-3xl font-black tracking-tighter">#{userStats.monthlyRank || '--'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Points</p>
                                    <p className="text-3xl font-black tracking-tighter text-primary">{Number(userStats.monthlyPoints || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Lifetime Rank</p>
                                    <p className="text-3xl font-black tracking-tighter">#{userStats.lifetimeRank || '--'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Points</p>
                                    <p className="text-3xl font-black tracking-tighter text-primary">{Number(userStats.lifetimePoints || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            {}
            <div className="space-y-4 px-4">
                <AnimatePresence mode="wait">
                    {(() => {
                        const topList = currentLeaderboard;
                        const userRank = activeTab === 'monthly' ? userStats?.monthlyRank : userStats?.lifetimeRank;
                        const contextList = activeTab === 'monthly' ? userStats?.monthlyContext : userStats?.lifetimeContext;
                        
                        const isUserInTopList = topList.some(e => e.username === user?.name);
                        
                        return (
                            <>
                                {topList.map((entry, idx) => {
                                    const rank = idx + 1;
                                    const points = activeTab === 'monthly' ? entry.monthlyPoints : entry.lifetimePoints;
                                    const isUser = entry.username === user?.name;
                                    return (
                                        <motion.div key={`${entry.username}-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 group ${isUser ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-muted/20 border-border/50 hover:bg-muted/30'}`}>
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${isUser ? 'bg-white/20' : 'bg-background border border-border/50'}`}>
                                                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-lg tracking-tighter uppercase">{entry.username}</p>
                                                        <span className="text-xl">{getBadgeIcon(entry.badges?.[0])}</span>
                                                    </div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>{rank <= 3 ? 'Top Saver' : 'Member'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black tracking-tighter ${isUser ? 'text-white' : 'text-primary'}`}>{Number(points || 0).toLocaleString()}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>Points</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {!isUserInTopList && contextList && contextList.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-center py-4">
                                            <div className="h-px bg-border/50 flex-1"></div>
                                            <div className="px-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">Your Position</div>
                                            <div className="h-px bg-border/50 flex-1"></div>
                                        </div>
                                        {contextList.map((entry, idx) => {
                                            const rank = activeTab === 'monthly' ? entry.monthlyRank : entry.lifetimeRank;
                                            const points = activeTab === 'monthly' ? entry.monthlyPoints : entry.lifetimePoints;
                                            const isUser = entry.username === user?.name;
                                            return (
                                                <motion.div key={`${entry.username}-ctx-${idx}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 group ${isUser ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-muted/20 border-border/50 hover:bg-muted/30'}`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${isUser ? 'bg-white/20' : 'bg-background border border-border/50'}`}>
                                                            #{rank}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-black text-lg tracking-tighter uppercase">{entry.username}</p>
                                                                <span className="text-xl">{getBadgeIcon(entry.badges?.[0])}</span>
                                                            </div>
                                                            <p className={`text-[9px] font-black uppercase tracking-widest ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>Your Neighbors</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-black tracking-tighter ${isUser ? 'text-white' : 'text-primary'}`}>{Number(points || 0).toLocaleString()}</p>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>Points</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </>
                                )}
                            </>
                        );
                    })()}
                </AnimatePresence>
            </div>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                <Card variant="glass" className="saas-card p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center"><Zap className="w-4 h-4 mr-2" /> How to Earn Points</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Staying on Budget', value: '+50 PT', icon: <Target className="w-4 h-4" /> },
                            { label: 'Completing Goals', value: '+100 PT', icon: <Trophy className="w-4 h-4" /> },
                            { label: 'Monthly Savings (per ₹1k)', value: '+5 PT', icon: <TrendingUp className="w-4 h-4" /> },
                            { label: 'Paying off Debt (per ₹1k)', value: '+10 PT', icon: <Activity className="w-4 h-4" /> },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50 group hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="text-primary">{item.icon}</div>
                                    <span className="font-black text-[11px] uppercase tracking-tighter">{item.label}</span>
                                </div>
                                <span className="font-black text-xs text-primary">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card variant="glass" className="saas-card p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center"><Award className="w-4 h-4 mr-2" /> Special Badges</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Saving Champion', desc: 'Rank #1 Overall', emoji: '👑' },
                            { label: 'Silver Medalist', desc: 'Top 3 Distribution', emoji: '⭐' },
                            { label: 'Rising Star', desc: 'Top 10 Savers', emoji: '✨' },
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border/50 group hover:bg-muted/30 transition-colors">
                                <div className="text-3xl">{badge.emoji}</div>
                                <div>
                                    <p className="font-black text-[11px] uppercase tracking-tighter">{badge.label}</p>
                                    <p className="text-[9px] font-medium text-muted-foreground italic">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
export default Leaderboard;
