import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, subMonths, isBefore, isAfter } from 'date-fns';
import api from '../services/api';
import { Card, Button, LoadingSpinner, StatsCard } from '../components/ui';
import { 
  BarChart2, TrendingUp, PieChart, Calendar, Download, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, 
  Filter, Layers, RefreshCw
} from 'lucide-react';
import {
  PieChart as RePie, Pie, Cell,
  BarChart as ReBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const DATE_RANGES = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Annual View' },
];
const Reports = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('spending');
    const [dateRange, setDateRange] = useState('month');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState({ spending: null, income: null, budget: null });
    const getDateParams = useMemo(() => {
        const now = new Date();
        switch (dateRange) {
            case 'week': return { startDate: format(subDays(now, 7), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
            case 'month': return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') };
            case 'quarter': return { startDate: format(subMonths(now, 3), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
            case 'year': return { startDate: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'), endDate: format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd') };
            default: return {};
        }
    }, [dateRange]);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = getDateParams;
            const endpoints = {
                spending: '/reports/spending-analysis',
                income: '/reports/income',
                budget: '/reports/budget'
            };
            const res = await api.get(endpoints[activeTab], { params });
            const data = res.data?.data || res.data;
            setReportData(prev => ({ ...prev, [activeTab]: data }));
        } catch (e) { toast.error('Telemetry timeout.'); }
        finally { setIsLoading(false); }
    };
    useEffect(() => { fetchData(); }, [activeTab, dateRange]);
    const renderHeader = () => (
        <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-2">
            <div className="flex items-center space-x-3 bg-muted/30 p-2 rounded-2xl border border-border/50">
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="input-saas border-none bg-transparent font-black uppercase text-[10px] tracking-widest px-4">
                    {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <Button variant="secondary" onClick={() => toast.success('Exporting report...')}><Download className="w-4 h-4 mr-2" />Download</Button>
            </div>
        </div>
    );
    const renderTabs = () => (
        <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 max-w-md">
            {['spending', 'income', 'budget'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-background shadow-lg text-primary border border-border/50' : 'text-muted-foreground'}`}>{t}</button>
            ))}
        </div>
    );
    const SpendingView = () => {
        const d = reportData.spending || { categories: [] };
        const chartData = (d.categories || []).map(c => ({ name: c._id, value: c.total }));
        return (
            <div className="space-y-8 animate-entrance">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatsCard title="Total Spending" value={d.totalSpending || 0} variant="error" icon={<ArrowDownRight />} />
                    <StatsCard title="Categories" value={d.categories?.length || 0} variant="primary" icon={<Layers />} />
                    <StatsCard title="Daily Avg" value={(d.totalSpending || 0) / 30} variant="secondary" icon={<Activity />} />
                </div>
                {renderHeader()}
                {renderTabs()}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card variant="glass" className="p-8 saas-card min-h-[400px]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center"><PieChart className="w-4 h-4 mr-2" /> Spending Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RePie>
                                <Pie data={chartData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                                <Legend />
                            </RePie>
                        </ResponsiveContainer>
                    </Card>
                    <Card variant="glass" className="p-8 saas-card overflow-y-auto max-h-[400px]">
                         <h3 className="text-xs font-black uppercase tracking-widest mb-8">Category Breakdown</h3>
                         <div className="space-y-6">
                            {(d.categories || []).map((c, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-black">
                                        <span className="uppercase tracking-widest">{c._id}</span>
                                        <span className="text-primary tracking-tighter">₹{c.total.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(c.total / d.totalSpending) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>
            </div>
        );
    };
    const IncomeView = () => {
        const d = reportData.income || { sources: [] };
        const chartData = (d.sources || []).map(s => ({ name: s._id, value: s.total }));
        return (
            <div className="space-y-8 animate-entrance">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatsCard title="Total Income" value={d.totalIncome || 0} variant="success" icon={<ArrowUpRight />} />
                    <StatsCard title="Sources" value={d.sources?.length || 0} variant="primary" icon={<Layers />} />
                    <StatsCard title="Daily Average" value={(d.totalIncome || 0) / 30} variant="secondary" icon={<TrendingUp />} />
                </div>
                {renderHeader()}
                {renderTabs()}
                <Card variant="glass" className="p-8 saas-card h-[400px]">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center"><BarChart2 className="w-4 h-4 mr-2" /> Income Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ReBar data={chartData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" fontSize={10} fontWeight={900} textAnchor="start" dx={-40} />
                            <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </ReBar>
                    </ResponsiveContainer>
                </Card>
            </div>
        );
    };
    const BudgetView = () => {
        const d = reportData.budget || { budgets: [], categories: [] };
        const list = d.budgets || d.categories || [];
        return (
            <div className="space-y-8 animate-entrance">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatsCard title="Total Budget" value={d.totalBudget || 0} variant="primary" icon={<Layers />} />
                    <StatsCard title="Total Spent" value={d.totalSpent || 0} variant="error" icon={<ArrowDownRight />} />
                    <StatsCard title="Remaining" value={(d.totalBudget || 0) - (d.totalSpent || 0)} variant="success" icon={<ArrowUpRight />} />
                </div>
                {renderHeader()}
                {renderTabs()}
                <div className="grid grid-cols-1 gap-6">
                    {list.map((c, i) => {
                        const prog = Math.min((c.spent / (c.budget || c.amount || 1)) * 100, 100);
                        return (
                            <Card key={i} variant="glass" className="saas-card p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex justify-between items-center font-black text-[10px] uppercase tracking-widest mb-1">
                                        <span>{c.category || c._id}</span>
                                        <span className={prog >= 90 ? 'text-rose-500' : 'text-primary'}>{prog.toFixed(1)}% Consumption</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${prog >= 90 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${prog}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black italic text-muted-foreground">
                                        <span>Spent: ₹{c.spent?.toLocaleString()}</span>
                                        <span className="text-foreground">Limit: ₹{(c.budget || c.amount)?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-border hidden md:block opacity-30"></div>
                                <div className="text-right min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Available</p>
                                    <p className={`text-xl font-black tracking-tighter ${(c.budget || c.amount) - c.spent < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{((c.budget || c.amount) - c.spent).toLocaleString()}</p>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        );
    };
    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {isLoading ? (
                <div className="h-[400px] flex items-center justify-center"><LoadingSpinner size="xl" variant="primary" text="Loading reports..." /></div>
            ) : (
                <div className="space-y-8">
                    {activeTab === 'spending' && <SpendingView />}
                    {activeTab === 'income' && <IncomeView />}
                    {activeTab === 'budget' && <BudgetView />}
                </div>
            )}
        </div>
    );
};
export default Reports;
