import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
function LineChartComponent({ data }) {
  const hasData = Array.isArray(data) && data.length > 0 && data.some(d => d.income > 0 || d.expense > 0);
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeValue = payload.find(p => p.dataKey === 'income')?.value || 0;
      const expenseValue = payload.find(p => p.dataKey === 'expense')?.value || 0;
      const netFlow = incomeValue - expenseValue;
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl z-[9999] relative">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            {new Date(label).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Income:</span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">₹{incomeValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Expense:</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-400">₹{expenseValue.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Net Flow:</span>
                <span className={`font-bold ${netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {netFlow >= 0 ? '+' : ''}₹{netFlow.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  return (
    <div className="h-80 w-full flex flex-col items-center justify-center">
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20
              }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(156, 163, 175, 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Timeline', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: '#94A3B8', textAnchor: 'middle' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Currency', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                name="Inflow"
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={3}
                name="Outflow"
                dot={{ fill: '#EF4444', r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 p-3 bg-muted/30 rounded-xl border border-border/50 w-full">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">Cash Inflow</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">Cash Outflow</span>
             </div>
             <p className="ml-auto text-[9px] font-black italic text-primary uppercase">Tracking daily velocity</p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transaction data</h3>
          <p className="text-gray-500 dark:text-gray-400">Add income and expense transactions to see trends</p>
        </div>
      )}
    </div>
  );
}
export default LineChartComponent;
