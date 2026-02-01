export const expenseCategories = [
  { name: 'Food & Dining', icon: '🍔' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Bills & Utilities', icon: '💡' },
  { name: 'Housing', icon: '🏠' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '📚' },
  { name: 'Personal Care', icon: '💇' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Gifts & Donations', icon: '🎁' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Subscriptions', icon: '📱' },
  { name: 'Others', icon: '📊' }
];

export const incomeCategories = [
  { name: 'Salary', icon: '💰' },
  { name: 'Freelance', icon: '💼' },
  { name: 'Investments', icon: '📈' },
  { name: 'Gifts', icon: '🎁' },
  { name: 'Rental Income', icon: '🏠' },
  { name: 'Business', icon: '💼' },
  { name: 'Side Hustle', icon: '💡' },
  { name: 'Other Income', icon: '💵' }
];

// Combined categories for budgets (includes both expense and income categories)
export const allCategories = [
  ...expenseCategories.map(cat => ({ ...cat, type: 'expense' })),
  ...incomeCategories.map(cat => ({ ...cat, type: 'income' }))
];
