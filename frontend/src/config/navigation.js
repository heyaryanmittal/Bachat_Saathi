// Navigation configuration
export const navigationItems = [
  { path: '/dashboard', name: 'Dashboard', icon: 'LayoutDashboard' },
  {
    name: 'Transactions',
    icon: 'CreditCard',
    type: 'dropdown',
    children: [
      { path: '/wallets', name: 'Wallets', icon: 'Wallet' },
      { path: '/transactions', name: 'Transactions', icon: 'ArrowLeftRight' },
      { path: '/transfers', name: 'Transfers', icon: 'ArrowLeftRight' },
      { path: '/budgets', name: 'Budgets', icon: 'TrendingUp' }
    ]
  },
  { path: '/debts', name: 'Debts', icon: 'Calculator' },
  { path: '/reports', name: 'Reports', icon: 'BarChart3' },
  {
    name: 'Achievements',
    icon: 'Trophy',
    type: 'dropdown',
    children: [
      { path: '/goals', name: 'Goals', icon: 'Target' },
      { path: '/achievements', name: 'Achievements', icon: 'Medal' },
      { path: '/leaderboard', name: 'Leaderboard', icon: 'Crown' },
      { path: '/points-info', name: 'Platform Guide', icon: 'Calculator' }
    ]
  }
];

export default navigationItems;
