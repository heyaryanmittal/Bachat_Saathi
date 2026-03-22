import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
function BarChartComponent({ data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const budgetValue = payload.find(p => p.dataKey === 'budget')?.value || 0;
      const spentValue = payload.find(p => p.dataKey === 'spent')?.value || 0;
      const remaining = Math.max(0, budgetValue - spentValue);
      const percentageSpent = budgetValue > 0 ? (spentValue / budgetValue) * 100 : 0;
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl z-[9999] relative">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Budget:</span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400">₹{budgetValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Spent:</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-400">₹{spentValue.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Usage:</span>
                <span className={`font-bold ${percentageSpent > 100 ? 'text-red-600' : percentageSpent > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {Math.round(percentageSpent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentageSpent > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    percentageSpent > 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  const chartData = data.map(item => ({
    ...item,
    budget: Number(item.budget) || 0,
    spent: Number(item.spent) || 0
  }));

  return (
    <div className="h-80 w-full flex flex-col items-center justify-center">
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20
              }}
              barGap={4}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(156, 163, 175, 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Categories', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: '#94A3B8', textAnchor: 'middle' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }}/>
              <Bar 
                dataKey="budget" 
                name="Limit" 
                fill="url(#budgetGradient)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar 
                dataKey="spent" 
                name="Used" 
                fill="url(#spentGradient)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 p-3 bg-muted/30 rounded-xl border border-border/50 w-full">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">Budget Cap</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">Actual Spent</span>
             </div>
             <p className="ml-auto text-[9px] font-black italic text-primary uppercase">Comparing planned vs reality</p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budget data</h3>
          <p className="text-gray-500 dark:text-gray-400">Create budgets to track your spending goals</p>
        </div>
      )}
    </div>
  );
}
export default BarChartComponent;
