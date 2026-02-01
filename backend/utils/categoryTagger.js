// Predefined categories and their associated keywords
const categoryKeywords = {
  'Groceries': ['supermarket', 'grocery', 'market', 'food', 'vegetables', 'fruits'],
  'Transportation': ['uber', 'ola', 'taxi', 'bus', 'metro', 'train', 'fuel', 'petrol', 'diesel'],
  'Dining': ['restaurant', 'cafe', 'food', 'swiggy', 'zomato', 'hotel'],
  'Shopping': ['mall', 'clothing', 'shoes', 'amazon', 'flipkart', 'myntra'],
  'Entertainment': ['movie', 'theatre', 'netflix', 'amazon prime', 'hotstar'],
  'Bills': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'broadband'],
  'Health': ['hospital', 'doctor', 'medicine', 'medical', 'pharmacy', 'healthcare'],
  'Education': ['school', 'college', 'course', 'tuition', 'books', 'stationery'],
  'Rent': ['rent', 'house rent', 'apartment'],
  'Investment': ['mutual fund', 'stocks', 'shares', 'investment', 'gold'],
  'Salary': ['salary', 'wage', 'income', 'payroll'],
  'Transfer': ['transfer', 'sent', 'received']
};

// Function to auto-categorize transaction based on merchant name and notes
exports.categorizeTransaction = (merchantName = '', notes = '') => {
  const searchText = `${merchantName} ${notes}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return 'Others'; // Default category if no match found
};

// Function to suggest relevant tags based on transaction details
exports.suggestTags = (merchantName = '', notes = '', category = '') => {
  const tags = new Set();
  const searchText = `${merchantName} ${notes} ${category}`.toLowerCase();

  // Add category as a tag
  if (category) tags.add(category.toLowerCase());

  // Add merchant name as a tag if it exists
  if (merchantName) {
    const merchantTag = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (merchantTag) tags.add(merchantTag);
  }

  // Look for common keywords in notes
  const commonKeywords = ['bill', 'monthly', 'shopping', 'food', 'travel', 'emergency', 'gift'];
  commonKeywords.forEach(keyword => {
    if (searchText.includes(keyword)) tags.add(keyword);
  });

  return Array.from(tags);
};
