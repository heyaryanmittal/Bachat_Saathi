import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, subMonths, isBefore, isAfter } from 'date-fns';
import api from '../services/api';
import { Card, Button, Alert, ProgressBar } from '../components/ui';
import { RefreshCw, BarChart2, TrendingUp, PieChart, Calendar, Download } from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Chart Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Report types
const REPORT_TYPES = {
  SPENDING: 'spending',
  INCOME: 'income',
  BUDGET: 'budget',
};

// Date range options
const DATE_RANGES = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'Last 3 months' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(REPORT_TYPES.SPENDING);
  const [dateRange, setDateRange] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    spending: null,
    income: null,
    budget: null
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);

  // Get date range parameters based on selection
  const getDateRangeParams = () => {
    const now = new Date();

    switch (dateRange) {
      case 'week':
        return {
          startDate: format(subDays(now, 7), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        };
      case 'month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'quarter':
        return {
          startDate: format(subMonths(now, 3), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        };
      case 'year':
        return {
          startDate: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'),
          endDate: format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd')
        };
      case 'custom':
        return {
          startDate: format(customDateRange.start, 'yyyy-MM-dd'),
          endDate: format(customDateRange.end, 'yyyy-MM-dd')
        };
      default:
        return {};
    }
  };

  // Fetch report data based on active tab
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateParams = getDateRangeParams();

      if (activeTab === REPORT_TYPES.SPENDING) {
        try {
          const res = await api.get('/reports/spending-analysis', { params: dateParams });
          const data = res.data?.data || res.data;
          setReportData(prev => ({
            ...prev,
            spending: {
              categories: (data.categories || []).map(cat => ({
                _id: cat._id || cat.category,
                total: cat.total || 0,
                count: cat.count || 0,
                percentage: cat.percentage || 0
              })),
              totalSpending: data.totalSpending || 0,
              period: data.period || { start: dateParams.startDate, end: dateParams.endDate }
            }
          }));
        } catch (err) {
          throw new Error(`Spending report failed: ${err.response?.data?.message || err.message}`);
        }
      }
      else if (activeTab === REPORT_TYPES.INCOME) {
        try {
          const res = await api.get('/reports/income', { params: dateParams });
          const data = res.data?.data || res.data;
          setReportData(prev => ({
            ...prev,
            income: {
              sources: (data.sources || []).map(src => ({
                _id: src._id || src.source,
                total: src.total || 0,
                count: src.count || 0,
                percentage: src.percentage || 0
              })),
              totalIncome: data.totalIncome || 0,
              period: data.period || { start: dateParams.startDate, end: dateParams.endDate }
            }
          }));
        } catch (err) {
          throw new Error(`Income report failed: ${err.response?.data?.message || err.message}`);
        }
      }
      else if (activeTab === REPORT_TYPES.BUDGET) {
        try {
          const res = await api.get('/reports/budget', { params: dateParams });
          const data = res.data?.data || res.data;

          // Handle both 'budgets' and 'categories' field names from backend
          const budgetList = data.budgets || data.categories || [];

          setReportData(prev => ({
            ...prev,
            budget: {
              categories: budgetList.map(cat => ({
                _id: cat.category || cat._id,
                budget: cat.budget || cat.amount || 0,
                spent: cat.spent || 0,
                remaining: cat.remaining || (cat.budget - cat.spent) || 0,
                percentage: cat.percentage || 0,
                isOverBudget: cat.isOverBudget || false
              })),
              totalBudget: data.totalBudget || 0,
              totalSpent: data.totalSpent || 0,
              period: data.period || { start: dateParams.startDate, end: dateParams.endDate }
            }
          }));
        } catch (err) {
          throw new Error(`Budget report failed: ${err.response?.data?.message || err.message}`);
        }
      }

    } catch (err) {
      console.error('Error in fetchReportData:', err);

      // Handle authentication errors
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to load report data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch data when tab or date range changes
  useEffect(() => {
    // Only fetch if activeTab changes after initial mount
    fetchReportData();
  }, [activeTab, dateRange, customDateRange]);

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value !== 'custom') {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  // Handle custom date range change
  const handleCustomDateChange = (field, value) => {
    const newDate = new Date(value);
    setCustomDateRange(prev => {
      const newRange = {
        ...prev,
        [field]: newDate
      };

      // Ensure start date is before end date
      if (field === 'start' && isAfter(newDate, new Date(prev.end))) {
        newRange.end = newDate;
      } else if (field === 'end' && isBefore(newDate, new Date(prev.start))) {
        newRange.start = newDate;
      }

      return newRange;
    });
  };

  // Handle export functionality
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      const dateParams = getDateRangeParams();
      const token = localStorage.getItem('token');
      if (format === 'csv') {
        // Generate CSV client-side from reportData
        const csv = generateCsvForActiveTab();
        const filename = `bachatsaathi-${activeTab}-${dateParams.startDate}_to_${dateParams.endDate}.csv`;
        downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
      } else if (format === 'pdf') {
        // Generate printable HTML and trigger browser print (user can Save as PDF)
        const html = generateHtmlForActiveTab();
        downloadPdfViaPrint(html);
      }

    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to generate export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper: create CSV string for current active tab
  const generateCsvForActiveTab = () => {
    const dateParams = getDateRangeParams();
    let rows = [];
    if (activeTab === REPORT_TYPES.SPENDING) {
      const d = reportData.spending || {};
      rows.push(["Category", "Total", "Count", "Percentage"]);
      (d.categories || []).forEach(c => rows.push([c._id || '', c.total || 0, c.count || 0, (c.percentage || 0).toFixed(2)]));
    } else if (activeTab === REPORT_TYPES.INCOME) {
      const d = reportData.income || {};
      rows.push(["Source", "Total", "Count", "Percentage"]);
      (d.sources || []).forEach(s => rows.push([s._id || '', s.total || 0, s.count || 0, (s.percentage || 0).toFixed(2)]));
    } else if (activeTab === REPORT_TYPES.BUDGET) {
      const d = reportData.budget || {};
      rows.push(["Category", "Budget", "Spent", "Remaining", "% Used"]);
      (d.categories || []).forEach(c => rows.push([c._id || '', c.budget || 0, c.spent || 0, c.remaining || 0, (c.percentage || 0).toFixed(2)]));
    }

    // Convert to CSV string
    return rows.map(r => r.map(cell => {
      if (cell === null || cell === undefined) return '';
      const s = String(cell).replace(/"/g, '""');
      return `"${s}"`;
    }).join(',')).join('\n');
  };

  // Helper: download a blob
  const downloadBlob = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  // Helper: generate printable HTML for current active tab
  const generateHtmlForActiveTab = () => {
    const dateParams = getDateRangeParams();
    let title = '';
    let rows = [];

    if (activeTab === REPORT_TYPES.SPENDING) {
      title = `Spending Report (${dateParams.startDate} to ${dateParams.endDate})`;
      const d = reportData.spending || {};
      rows = (d.categories || []).map(c => ({ label: c._id || '', value: `₹${(c.total || 0).toLocaleString()}`, meta: `${(c.percentage || 0).toFixed(2)}%` }));
    } else if (activeTab === REPORT_TYPES.INCOME) {
      title = `Income Report (${dateParams.startDate} to ${dateParams.endDate})`;
      const d = reportData.income || {};
      rows = (d.sources || []).map(s => ({ label: s._id || '', value: `₹${(s.total || 0).toLocaleString()}`, meta: `${(s.percentage || 0).toFixed(2)}%` }));
    } else if (activeTab === REPORT_TYPES.BUDGET) {
      title = `Budget Report (${dateParams.startDate} to ${dateParams.endDate})`;
      const d = reportData.budget || {};
      rows = (d.categories || []).map(c => ({ label: c._id || '', value: `Budget: ₹${(c.budget || 0).toLocaleString()} • Spent: ₹${(c.spent || 0).toLocaleString()}`, meta: `${(c.percentage || 0).toFixed(2)}%` }));
    }

    const header = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
        <h1 style="margin-bottom:4px">${title}</h1>
        <p style="color:#666; margin-top:0">Generated by BachatSaathi</p>
        <table style="width:100%; border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr>
              <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd">Item</th>
              <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd">Value</th>
              <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd">Meta</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="padding:8px; border-bottom:1px solid #f0f0f0">${r.label}</td>
                <td style="padding:8px; border-bottom:1px solid #f0f0f0">${r.value}</td>
                <td style="padding:8px; border-bottom:1px solid #f0f0f0">${r.meta}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${header}</body></html>`;
  };

  // Helper: open printable window and trigger print (user can Save as PDF)
  const downloadPdfViaPrint = (html) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      setError('Unable to open print window. Please allow popups for this site.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Give the window a moment to render
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        // Do not automatically close so user can save if needed
      } catch (err) {
        console.error('Print error:', err);
        setError('Print failed. Please try saving as PDF from the print dialog.');
      }
    }, 500);
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-gray-600 dark:text-gray-300">Loading {activeTab === REPORT_TYPES.SPENDING ? 'spending' : activeTab === REPORT_TYPES.INCOME ? 'income' : 'budget'} report...</span>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Error Loading Report</h3>
        <p className="text-sm mb-3">{error}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <details className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
        <pre className="overflow-auto">
          Tab: {activeTab}
          Date Range: {dateRange}
          Loading: {isLoading ? 'true' : 'false'}

          Check your browser console for more details.
        </pre>
      </details>
    </div>
  );

  // Render no data state
  const renderNoData = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400">No data available for the selected period.</p>
    </div>
  );

  // Render spending analysis tab
  const renderSpendingAnalysis = () => {
    const { categories = [], totalSpending = 0, period = {} } = reportData.spending || {};

    if (!categories.length) {
      return renderNoData();
    }

    // Prepare data for Recharts
    const chartData = categories.map(cat => ({
      name: cat._id || 'Unknown',
      value: cat.total
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spending</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalSpending.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {period.start} to {period.end}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{Math.round(totalSpending / 30).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Recharts Pie Chart */}
        <Card className="p-6 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 w-full text-left">Spending Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h3>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-gray-900 dark:text-gray-100">
            {categories && categories.length > 0 ? (
              categories.map((category) => {
                const total = category.total || 0;
                const percentage = totalSpending > 0 ? (total / totalSpending) * 100 : 0;
                return (
                  <div key={category._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category._id || 'Unknown'}</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      className="h-2"
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No spending data available</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render income report tab
  const renderIncomeReport = () => {
    const { sources = [], totalIncome = 0, period = {} } = reportData.income || {};

    if (!sources.length) {
      return renderNoData();
    }

    // Prepare data for Recharts
    const chartData = sources.map(src => ({
      name: src._id || 'Unknown',
      value: src.total
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{totalIncome.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {period.start} to {period.end}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Income Sources</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sources.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{Math.round(totalIncome / 30).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Recharts Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income Sources</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide={true} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Income Details</h3>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-gray-900 dark:text-gray-100">
            {sources && sources.length > 0 ? (
              sources.map((source) => {
                const total = source.total || 0;
                const percentage = totalIncome > 0 ? (total / totalIncome) * 100 : 0;
                return (
                  <div key={source._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{source._id || 'Unknown'}</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      className="h-2 bg-green-100 dark:bg-green-900/50"
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No income data available</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render budget report tab
  const renderBudgetReport = () => {
    const {
      categories = [],
      totalBudget = 0,
      totalSpent = 0,
    } = reportData.budget || {};

    if (!categories.length) {
      return renderNoData();
    }

    const remainingBudget = totalBudget - totalSpent;
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = remainingBudget < 0;

    // Prepare data for Recharts
    const chartData = categories.slice(0, 10).map(cat => ({
      name: cat._id || 'Unknown',
      Budget: cat.budget,
      Spent: cat.spent
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalBudget.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h3>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{totalSpent.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {isOverBudget ? 'Overspent' : 'Remaining'}
            </h3>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
              ₹{Math.abs(remainingBudget).toLocaleString()}
              {isOverBudget && ' over'}
            </p>
          </Card>
        </div>

        {/* Recharts Bar Chart - Budget vs Spent */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget vs Actuals (Top Categories)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="#8884d8" name="Budgeted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#82ca9d" name="Spent" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Budget Overview</h3>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="h-9 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1 text-gray-900 dark:text-gray-100">
              <span>Overall Budget Usage</span>
              <span>{Math.round(percentageUsed)}%</span>
            </div>
            <ProgressBar
              value={Math.min(percentageUsed, 100)}
              className="h-3"
              indicatorClassName={percentageUsed > 100 ? 'bg-red-500' : 'bg-blue-500'}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>₹0</span>
              <span>₹{totalBudget.toLocaleString()}</span>
            </div>
          </div>

          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">By Category</h4>
          <div className="space-y-4 text-gray-900 dark:text-gray-100">
            {categories && categories.length > 0 ? (
              categories.map((category) => {
                const spent = category.spent || 0;
                const budget = category.budget || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const isCategoryOverBudget = spent > budget;

                return (
                  <div key={category._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category._id || 'Unknown'}</span>
                      <span className={isCategoryOverBudget ? 'text-red-600 dark:text-red-400' : ''}>
                        ₹{spent.toLocaleString()} of ₹{budget.toLocaleString()}
                        {isCategoryOverBudget && ' (Over)'}
                      </span>
                    </div>
                    <ProgressBar
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      indicatorClassName={
                        percentage > 100
                          ? 'bg-red-500'
                          : percentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-purple-500'
                      }
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No budget categories available</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render the appropriate content based on the active tab
  const renderReportContent = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();

    switch (activeTab) {
      case REPORT_TYPES.SPENDING:
        return renderSpendingAnalysis();
      case REPORT_TYPES.INCOME:
        return renderIncomeReport();
      case REPORT_TYPES.BUDGET:
        return renderBudgetReport();
      default:
        return renderSpendingAnalysis();
    }
  };

  // Render the tab navigation
  const renderTabs = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card
        className={`p-4 cursor-pointer transition-all ${activeTab === REPORT_TYPES.SPENDING
          ? 'ring-2 ring-blue-500 dark:ring-blue-600 shadow-lg transform -translate-y-1'
          : 'hover:shadow-md'
          }`}
        onClick={() => setActiveTab(REPORT_TYPES.SPENDING)}
      >
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Spending Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track expenses by category</p>
          </div>
        </div>
      </Card>

      <Card
        className={`p-4 cursor-pointer transition-all ${activeTab === REPORT_TYPES.INCOME
          ? 'ring-2 ring-green-500 dark:ring-green-600 shadow-lg transform -translate-y-1'
          : 'hover:shadow-md'
          }`}
        onClick={() => setActiveTab(REPORT_TYPES.INCOME)}
      >
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Income Report</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyze income sources</p>
          </div>
        </div>
      </Card>

      <Card
        className={`p-4 cursor-pointer transition-all ${activeTab === REPORT_TYPES.BUDGET
          ? 'ring-2 ring-purple-500 dark:ring-purple-600 shadow-lg transform -translate-y-1'
          : 'hover:shadow-md'
          }`}
        onClick={() => setActiveTab(REPORT_TYPES.BUDGET)}
      >
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Budget Report</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor budget performance</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render date range selector
  const renderDateRangeSelector = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="mb-4 sm:mb-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analyze your financial data and track your spending patterns
        </p>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-56">
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full h-10 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {range.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {showCustomDatePicker && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <input
              type="date"
              value={format(customDateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="h-10 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              placeholder="Start date"
            />
            <span className="flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold">→</span>
            <input
              type="date"
              value={format(customDateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="h-10 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              placeholder="End date"
            />
          </div>
        )}

        <Button
          onClick={fetchReportData}
          disabled={isLoading}
          className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {renderDateRangeSelector()}
      {renderTabs()}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
