import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { format } from 'date-fns';
import { Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  Target, CheckCircle, TrendingUp, AlertTriangle, 
  Trash2, Plus, Plane, Car, Home, GraduationCap, 
  DollarSign, Briefcase, Zap, Star, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { numberToWords } from '../utils/numberToWords';
const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [newGoal, setNewGoal] = useState({ title: '', description: '', targetAmount: '', deadline: '', category: 'other' });
    const [savingsAmount, setSavingsAmount] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, isDeleting: false });
    useEffect(() => { fetchGoals(); fetchGoalStats(); }, []);
    const fetchGoals = async () => {
        try {
            setIsLoading(true);
            const response = await api.getGoals({ limit: 100 });
            setGoals(response.data.data.map(g => ({
                ...g,
                progress: Math.min(((g.savedAmount || 0) / (g.targetAmount || 1)) * 100, 100)
            })));
        } catch (e) { toast.error('Failed to load goals.'); }
        finally { setIsLoading(false); }
    };
    const fetchGoalStats = async () => {
        try {
            const res = await api.getGoalStats();
            setStats(res.data.data);
        } catch (e) {  }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createGoal(newGoal);
            toast.success('Goal created.');
            setShowCreateModal(false);
            setNewGoal({ title: '', description: '', targetAmount: '', deadline: '', category: 'other' });
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Failed to create goal.'); }
    };
    const handleSavings = async (e) => {
        e.preventDefault();
        try {
            await api.addSavingsToGoal(selectedGoal._id, { amount: Number(savingsAmount) });
            toast.success('Savings added!');
            setShowSavingsModal(false);
            setSavingsAmount('');
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Failed to add savings.'); }
    };
    const confirmDelete = async () => {
        try {
            setDeleteDialog(p => ({ ...p, isDeleting: true }));
            await api.deleteGoal(deleteDialog.id);
            toast.success('Goal deleted.');
            setDeleteDialog({ isOpen: false, id: null, isDeleting: false });
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Failed to delete.'); }
    };
    const getIcon = (cat) => {
        const map = { emergency: Zap, vacation: Plane, car: Car, house: Home, education: GraduationCap, investment: TrendingUp, other: Star };
        const Icon = map[cat] || Star;
        return <Icon className="w-6 h-6" />;
    };
    const filtered = goals.filter(g => {
        if (activeTab === 'all') return true;
        return g.status === activeTab;
    });
    if (isLoading && !goals.length) {
        return <div className="flex h-[80vh] items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading goals..." /></div>;
    }
    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatsCard title="Total Goals" value={stats.totalGoals || 0} variant="primary" icon={<Target />} />
                <StatsCard title="Completed" value={stats.completedGoals || 0} variant="success" icon={<CheckCircle />} />
                <StatsCard title="Total Saved" value={stats.totalSavedAmount || 0} variant="gradient" icon={<Briefcase />} />
                <StatsCard title="Success Rate" value={(stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0) + '%'} variant="secondary" icon={<TrendingUp />} />
            </div>
            {}
            <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-2">
                <Button onClick={() => setShowCreateModal(true)} className="btn-saas-primary" size="lg"><Plus className="mr-2 w-5 h-5" />New Goal</Button>
            </div>
            {}
            <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 max-w-md">
                {['all', 'in-progress', 'completed'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-background shadow-lg text-primary border border-border/50' : 'text-muted-foreground'}`}>{t.replace('-', ' ')}</button>
                ))}
            </div>
            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-card border-dashed p-10 border-2">
                        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                        <p className="text-xl font-bold text-muted-foreground">No Goals Found</p>
                        <p className="text-sm text-muted-foreground italic mb-8 mt-2">Set your first financial goal to start tracking progress.</p>
                        <Button onClick={() => setShowCreateModal(true)} variant="secondary">Create Goal</Button>
                    </div>
                ) : (
                    filtered.map(g => (
                        <Card key={g._id} variant="glass" className="saas-card group p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform ${g.status === 'completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'gradient-primary shadow-primary/20'}`}>
                                        {getIcon(g.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight uppercase truncate max-w-[150px]">{g.title}</h3>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{g.category}</p>
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => setDeleteDialog({ isOpen: true, id: g._id, isDeleting: false })}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-8 flex-grow italic line-clamp-2">{g.description || 'No description provided.'}</p>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-muted-foreground">Goal Progress</span>
                                    <span className={g.status === 'completed' ? 'text-emerald-500' : 'text-primary'}>{Math.round(g.progress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ease-out rounded-full ${g.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${g.progress}%` }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-muted-foreground">Saved</p>
                                        <p className="text-sm font-black">₹{g.savedAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground">Target</p>
                                        <p className="text-sm font-black">₹{g.targetAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {format(new Date(g.deadline), 'MMM yyyy')}
                                </div>
                                {g.status !== 'completed' && (
                                    <Button size="sm" onClick={() => { setSelectedGoal(g); setShowSavingsModal(true); }} className="btn-saas-primary font-black text-[10px] tracking-widest uppercase"><Plus className="w-3 h-3 mr-1" />Add Savings</Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
            {}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance" size="xl">
                        <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase tracking-widest">Create New Goal</h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <Input label="Goal Name" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="Emergency Fund..." required />
                            <Input label="Description" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="What is this goal for?..." />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Input label="Target Amount (₹)" type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} required />
                                    {Number(newGoal.targetAmount) > 0 && (
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1">
                                            {numberToWords(Number(newGoal.targetAmount))}
                                        </p>
                                    )}
                                </div>
                                <Input label="Target Date" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Category</label>
                                <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} className="input-saas w-full">
                                    <option value="emergency">Emergency</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="car">Vehicle</option>
                                    <option value="house">Real Estate</option>
                                    <option value="education">Education</option>
                                    <option value="investment">Investment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-4">Create Goal</Button>
                            <Button type="button" variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        </form>
                    </Card>
                </div>
            )}
            {}
            {showSavingsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <DollarSign className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Add Savings</h3>
                        <p className="text-sm text-muted-foreground mb-8 italic">Adding savings to <span className="text-foreground font-black">{selectedGoal.title}</span>.</p>
                        <form onSubmit={handleSavings}>
                            <div className="space-y-1 text-left">
                                <Input label="Amount (₹)" type="number" value={savingsAmount} onChange={e => setSavingsAmount(e.target.value)} placeholder="0.00" required autoFocus />
                                {Number(savingsAmount) > 0 && (
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1">
                                        {numberToWords(Number(savingsAmount))}
                                    </p>
                                )}
                            </div>
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Add to Goal</Button>
                            <Button type="button" variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setShowSavingsModal(false)}>Cancel</Button>
                        </form>
                    </Card>
                </div>
            )}
            {}
            {deleteDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="lg">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Delete Goal?</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-8">This action will permanently delete this goal and all its progress. This cannot be undone.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" onClick={() => setDeleteDialog({ isOpen: false, id: null, isDeleting: false })}>Keep</Button>
                            <Button variant="danger" loading={deleteDialog.isDeleting} onClick={confirmDelete}> Delete </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default Goals;
