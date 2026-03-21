import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { format } from 'date-fns';
import { Card, Button, Input, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  Target, CheckCircle, TrendingUp, AlertTriangle, 
  Trash2, Plus, Plane, Car, Home, GraduationCap, 
  DollarSign, Briefcase, Zap, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        } catch (e) { toast.error('Sync failed.'); }
        finally { setIsLoading(false); }
    };

    const fetchGoalStats = async () => {
        try {
            const res = await api.getGoalStats();
            setStats(res.data.data);
        } catch (e) { /* silent */ }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createGoal(newGoal);
            toast.success('Objective initialized.');
            setShowCreateModal(false);
            setNewGoal({ title: '', description: '', targetAmount: '', deadline: '', category: 'other' });
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Allocation error.'); }
    };

    const handleSavings = async (e) => {
        e.preventDefault();
        try {
            await api.addSavingsToGoal(selectedGoal._id, { amount: Number(savingsAmount) });
            toast.success('Teleporting assets...');
            setShowSavingsModal(false);
            setSavingsAmount('');
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Transmission failed.'); }
    };

    const confirmDelete = async () => {
        try {
            setDeleteDialog(p => ({ ...p, isDeleting: true }));
            await api.deleteGoal(deleteDialog.id);
            toast.success('Asset purged.');
            setDeleteDialog({ isOpen: false, id: null, isDeleting: false });
            fetchGoals(); fetchGoalStats();
        } catch (e) { toast.error('Purge failure.'); }
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
        return <div className="flex h-[80vh] items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Visualizing objectives..." /></div>;
    }

    return (
        <div className="pt-24 space-y-12 animate-entrance pb-12 overflow-x-hidden px-4">
            {/* SaaS Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Target <span className="text-gradient">Nodes</span></h1>
                    <p className="text-muted-foreground font-medium text-lg italic tracking-tight">Defining your future financial end-states.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="btn-saas-primary" size="lg"><Plus className="mr-2 w-5 h-5" />New Objective</Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatsCard title="Total Objectives" value={stats.totalGoals || 0} variant="primary" icon={<Target />} />
                <StatsCard title="Nodes Reached" value={stats.completedGoals || 0} variant="success" icon={<CheckCircle />} />
                <StatsCard title="Total Reserves" value={stats.totalSavedAmount || 0} variant="gradient" icon={<Briefcase />} />
                <StatsCard title="Asset Velocity" value={(stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0) + '%'} variant="secondary" icon={<TrendingUp />} />
            </div>

            {/* Main Tabs */}
            <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 max-w-md">
                {['all', 'in-progress', 'completed'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-background shadow-lg text-primary border border-border/50' : 'text-muted-foreground'}`}>{t.replace('-', ' ')}</button>
                ))}
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-card border-dashed p-10 border-2">
                        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                        <p className="text-xl font-bold text-muted-foreground">Zero Objective Density</p>
                        <p className="text-sm text-muted-foreground italic mb-8 mt-2">Initialize your first financial target to see telemetry.</p>
                        <Button onClick={() => setShowCreateModal(true)} variant="secondary">Start Mission</Button>
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

                            <p className="text-sm text-muted-foreground mb-8 flex-grow italic line-clamp-2">{g.description || 'No meta data defined for this objective.'}</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-muted-foreground">Target Velocity</span>
                                    <span className={g.status === 'completed' ? 'text-emerald-500' : 'text-primary'}>{Math.round(g.progress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ease-out rounded-full ${g.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${g.progress}%` }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-muted-foreground">Staged</p>
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
                                    <Button size="sm" onClick={() => { setSelectedGoal(g); setShowSavingsModal(true); }} className="btn-saas-primary font-black text-[10px] tracking-widest uppercase"><Plus className="w-3 h-3 mr-1" />Inject Assets</Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-md w-full animate-entrance" size="xl">
                        <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase tracking-widest">Construct New Node</h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <Input label="Protocol Title" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="Emergency Fund..." required />
                            <Input label="Meta Sequence" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="Allocated reserves for..." />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Target Value (₹)" type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} required />
                                <Input label="Spatial Deadline" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Node Category</label>
                                <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} className="input-saas w-full">
                                    <option value="emergency">Emergency</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="car">Vehicle</option>
                                    <option value="house">Real Estate</option>
                                    <option value="education">Academics</option>
                                    <option value="investment">Assets</option>
                                    <option value="other">Miscellaneous</option>
                                </select>
                            </div>
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-4">Initialize Assignment</Button>
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setShowCreateModal(false)}>Abort Construction</Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Savings Modal */}
            {showSavingsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <DollarSign className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Inject Capital</h3>
                        <p className="text-sm text-muted-foreground mb-8 italic">Transmitting assets to <span className="text-foreground font-black">{selectedGoal.title}</span> node.</p>
                        <form onSubmit={handleSavings}>
                            <Input label="Capital Volume (₹)" type="number" value={savingsAmount} onChange={e => setSavingsAmount(e.target.value)} placeholder="0.00" required autoFocus />
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8">Execute Injection</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setShowSavingsModal(false)}>Cancel Stream</Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Modal */}
            {deleteDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="lg">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Purge Goal?</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-8">This will irreversibly disconnect this financial node. Progress data will be lost.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" onClick={() => setDeleteDialog({ isOpen: false, id: null, isDeleting: false })}>Retain</Button>
                            <Button variant="danger" loading={deleteDialog.isDeleting} onClick={confirmDelete}> Purge </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Goals;
