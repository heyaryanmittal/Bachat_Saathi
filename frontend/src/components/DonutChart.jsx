import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
];

function DonutChart({ data }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const hasData = Array.isArray(data) && data.length > 0 && data.some(d => d.value > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl transform scale-105 transition-all duration-200 z-[9999] relative">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{payload[0].name}</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            ₹{payload[0].value.toLocaleString()}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(payload[0].value / Math.max(...data.map(d => d.value))) * 100}%` }}
            ></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleMouseEnter = (data, index) => {
    setHoveredSegment(index);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <div className="h-80 w-full flex items-center justify-center relative">
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${index % COLORS.length})`}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                    style={{
                      filter: hoveredSegment === index ? 'brightness(1.1)' : 'brightness(1)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Enhanced Center Text with fade effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-center transition-all duration-300 ${
              hoveredSegment !== null
                ? 'opacity-30 scale-95 transform'
                : 'opacity-100 scale-100 transform'
            }`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Expenses</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Enhanced tooltip positioning when hovering */}
          {hoveredSegment !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl transform scale-110 transition-all duration-200">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {data[hoveredSegment]?.name}
                </p>
                <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                  ₹{data[hoveredSegment]?.value.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expense data</h3>
          <p className="text-gray-500 dark:text-gray-400">Start adding transactions to see your expense breakdown</p>
        </div>
      )}
    </div>
  );
}

export default DonutChart;
