import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  Trophy, Star, Target, Zap, 
  Crown, ShieldCheck, Sparkles, 
  History, ChevronRight, Lock, 
  CheckCircle2, Flame, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Achievements = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [pointsHistory, setPointsHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    const [selectedBadge, setSelectedBadge] = useState(null);
    const badgeTiers = [
        { name: 'Bronze Saver', points: 1000, icon: <Award className="w-8 h-8"/>, color: 'from-amber-600 to-amber-400', desc: 'Congratulations on getting started!' },
        { name: 'Silver Saver', points: 5000, icon: <ShieldCheck className="w-8 h-8"/>, color: 'from-slate-400 to-slate-200', desc: 'You are building a solid financial base.' },
        { name: 'Gold Saver', points: 10000, icon: <Crown className="w-8 h-8"/>, color: 'from-yellow-500 to-yellow-200', desc: 'Expert at managing your expenses.' },
        { name: 'Platinum Saver', points: 25000, icon: <Zap className="w-8 h-8"/>, color: 'from-cyan-400 to-indigo-500', desc: 'Master of personal financial planning.' },
    ];
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [aRes, pRes, hRes] = await Promise.all([
                    api.getUserAchievements(),
                    api.getUserPoints(),
                    api.getPointsHistory({ limit: 15 })
                ]);
                const map = aRes.data.data || {};
                setAchievements([
                    { id: 'budgetMaster', name: 'Budget Master', desc: 'Stayed on budget for 3 consecutive months.', icon: <Target/>, earned: map.budgetMaster?.earned, pts: 50 },
                    { id: 'goalCrusher', name: 'Goal Crusher', desc: 'Completed 5 financial goals.', icon: <Trophy/>, earned: map.goalCrusher?.earned, pts: 100 },
                    { id: 'consistentSaver', name: 'Saving Streak', desc: 'Maintained a 6 month saving streak.', icon: <Flame/>, earned: map.consistentSaver?.earned, pts: 100 },
                ]);
                setUserPoints(pRes.data?.data?.points || 0);
                setPointsHistory(hRes.data.data || []);
            } catch (e) { toast.error('Rewards matrix desync.'); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [user]);
    const getCurrentTier = () => {
        if (userPoints >= 25000) return badgeTiers[3];
        if (userPoints >= 10000) return badgeTiers[2];
        if (userPoints >= 5000) return badgeTiers[1];
        if (userPoints >= 1000) return badgeTiers[0];
        return { name: 'Recruit', color: 'from-muted to-muted', desc: 'Initialize financial protocols.' };
    };
    if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading achievements..." /></div>;
    const currentTier = getCurrentTier();
    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {}
            <Card variant="glass" className="saas-card p-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-10 blur-3xl -mr-32 -mt-32 group-hover:opacity-20 transition-opacity"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentTier.color} flex items-center justify-center text-white shadow-2xl shadow-primary/20 animate-float`}>
                        {currentTier.icon || <Award className="w-12 h-12" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">{currentTier.name}</h2>
                        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest italic mb-6">{currentTier.desc}</p>
                        <div className="space-y-2 max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-[10px] font-black uppercase opacity-70">
                                <span>Progress to Next Tier</span>
                                <span>{Math.min(Math.round((userPoints / 25000) * 100), 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(userPoints / 25000) * 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-primary"></motion.div>
                            </div>
                        </div>
                    </div>
                    <Button variant="secondary" size="lg" className="hidden lg:flex" onClick={() => navigate('/leaderboard')}>View Leaderboard <ChevronRight className="ml-2 w-4 h-4"/></Button>
                </div>
            </Card>
            {}
            <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-2">
                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
                   <div className="px-6 py-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Current Points</p>
                        <p className="text-3xl font-black tracking-tighter text-primary">{userPoints.toLocaleString()}</p>
                   </div>
                </div>
            </div>
            {}
            <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 max-w-md">
                {['inventory', 'history'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-background shadow-lg text-primary border border-border/50' : 'text-muted-foreground'}`}>{t}</button>
                ))}
            </div>
            {}
            <AnimatePresence mode="wait">
                {activeTab === 'inventory' ? (
                    <motion.div key="inv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {badgeTiers.map((b, i) => {
                                const locked = userPoints < b.points;
                                return (
                                    <Card key={i} variant="glass" className={`saas-card p-6 flex flex-col items-center text-center group cursor-pointer ${locked ? 'opacity-50 grayscale' : ''}`} onClick={() => !locked && setSelectedBadge(b)}>
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white mb-6 shadow-xl relative group-hover:scale-110 transition-transform duration-500`}>
                                            {b.icon}
                                            {locked && <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-lg"><Lock className="w-4 h-4" /></div>}
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest mb-2">{b.name}</h4>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 mb-4">{locked ? `Unlocks at ${b.points.toLocaleString()} Points` : 'Earned'}</p>
                                        {!locked && <div className="mt-auto px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">Mastered</div>}
                                    </Card>
                                )
                            })}
                        </div>
                        {}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary" /> Unlocked Achievements</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {achievements.map((a, i) => (
                                    <Card key={i} variant="glass" className={`saas-card p-6 flex items-start gap-4 ${!a.earned ? 'opacity-40' : 'border-primary/30'}`}>
                                        <div className={`p-4 rounded-xl ${a.earned ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                            {a.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-sm uppercase tracking-tighter">{a.name}</h4>
                                                {a.earned && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground italic font-medium">{a.desc}</p>
                                            <div className="pt-2 flex items-center gap-2">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">+{a.pts} Points</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="hist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <Card variant="glass" className="saas-card overflow-hidden">
                            <div className="p-8 border-b border-border/50 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center"><History className="w-4 h-4 mr-2" /> Points History</h3>
                            </div>
                            <div className="divide-y divide-border/50">
                                {pointsHistory.length === 0 ? (
                                    <div className="p-20 text-center text-muted-foreground font-black italic uppercase text-xs">No energy fluctuations recorded</div>
                                ) : (
                                    pointsHistory.map((h, i) => (
                                        <div key={i} className="px-8 py-6 hover:bg-muted/20 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${h.points > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                                    {h.points > 0 ? <Zap className="w-5 h-5"/> : <Target className="w-5 h-5"/>}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tighter">{h.description || h.reason?.replace(/_/g, ' ')}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase italic">{format(new Date(h.createdAt), 'MMM dd, HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div className={`text-xl font-black tracking-tighter ${h.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {h.points > 0 ? '+' : ''}{h.points}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            {}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl" onClick={() => setSelectedBadge(null)}>
                        <motion.div initial={{ scale: 0.8, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} exit={{ scale: 0.8, rotateY: -90 }} transition={{ type: "spring", damping: 15 }} className="w-full max-w-sm pointer-events-auto" onClick={e => e.stopPropagation()}>
                            <Card variant="glass" className={`p-12 text-center bg-gradient-to-br ${selectedBadge.color} border-white/20 shadow-2xl relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none"></div>
                                <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white mb-8 shadow-inner animate-float">
                                    {selectedBadge.icon}
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">{selectedBadge.name}</h3>
                                <p className="text-white/80 font-black text-[10px] uppercase tracking-widest italic mb-8">{selectedBadge.desc}</p>
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Points Goal</p>
                                    <p className="text-2xl font-black text-white">{selectedBadge.points.toLocaleString()} PTS</p>
                                </div>
                                <Button variant="secondary" className="mt-8 w-full bg-white/20 hover:bg-white/30 border-white/20 text-white font-black uppercase text-[10px] tracking-widest" onClick={() => setSelectedBadge(null)}>Close</Button>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Achievements;