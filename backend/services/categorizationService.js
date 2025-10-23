/**
 * Expense categories with keyword rules
 */
const categoryRules = {
  'Food & Dining': {
    keywords: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'diner', 'bistro', 'grill', 'bar', 'pub', 'mcdonald', 'subway', 'starbucks', 'dunkin', 'kitchen', 'buffet', 'bakery', 'doordash', 'ubereats', 'grubhub'],
    weight: 1
  },
  'Groceries': {
    keywords: ['grocery', 'supermarket', 'market', 'walmart', 'target', 'costco', 'trader joe', 'whole foods', 'kroger', 'safeway', 'publix', 'aldi', 'food lion', 'wegmans'],
    weight: 1
  },
  'Transportation': {
    keywords: ['uber', 'lyft', 'taxi', 'cab', 'gas', 'fuel', 'parking', 'metro', 'subway', 'train', 'bus', 'transit', 'shell', 'exxon', 'chevron', 'bp', 'mobil'],
    weight: 1
  },
  'Shopping': {
    keywords: ['amazon', 'ebay', 'shop', 'store', 'mall', 'retail', 'best buy', 'apple store', 'nike', 'outlet', 'boutique', 'department'],
    weight: 1
  },
  'Entertainment': {
    keywords: ['cinema', 'movie', 'theater', 'theatre', 'netflix', 'spotify', 'hulu', 'disney', 'concert', 'ticket', 'amusement', 'museum', 'gaming', 'steam'],
    weight: 1
  },
  'Healthcare': {
    keywords: ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'health', 'cvs', 'walgreens', 'rite aid', 'dental', 'vision', 'urgent care'],
    weight: 1
  },
  'Utilities': {
    keywords: ['electric', 'electricity', 'water', 'gas utility', 'internet', 'phone', 'mobile', 'verizon', 'at&t', 'comcast', 'spectrum', 'utility'],
    weight: 1
  },
  'Travel': {
    keywords: ['hotel', 'motel', 'airbnb', 'airline', 'flight', 'airport', 'travel', 'booking', 'expedia', 'marriott', 'hilton', 'resort'],
    weight: 1
  },
  'Education': {
    keywords: ['university', 'college', 'school', 'tuition', 'course', 'book', 'bookstore', 'education', 'academy', 'learning'],
    weight: 1
  },
  'Personal Care': {
    keywords: ['salon', 'spa', 'barber', 'beauty', 'gym', 'fitness', 'yoga', 'massage', 'nail', 'hair'],
    weight: 1
  },
  'Insurance': {
    keywords: ['insurance', 'policy', 'premium', 'geico', 'state farm', 'allstate', 'progressive'],
    weight: 1
  },
  'Other': {
    keywords: [],
    weight: 0
  }
};

/**
 * Categorize an expense based on merchant name and other text
 * @param {string} merchant - Merchant name
 * @param {string} rawText - Raw OCR text
 * @returns {Object} Category and confidence score
 */
export const categorizeExpense = (merchant, rawText = '') => {
  const searchText = `${merchant || ''} ${rawText}`.toLowerCase();
  
  let bestMatch = {
    category: 'Other',
    confidence: 0,
    matchedKeywords: []
  };

  // Check each category's keywords
  for (const [category, rules] of Object.entries(categoryRules)) {
    if (category === 'Other') continue;

    let matchCount = 0;
    const matchedKeywords = [];

    for (const keyword of rules.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on number of matches and keyword weight
      const confidence = Math.min(95, 60 + (matchCount * 15));
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence,
          matchedKeywords
        };
      }
    }
  }

  // If no match found, default to 'Other' with low confidence
  if (bestMatch.confidence === 0) {
    bestMatch = {
      category: 'Other',
      confidence: 30,
      matchedKeywords: []
    };
  }

  return bestMatch;
};

/**
 * Get all available categories
 * @returns {Array<string>} List of category names
 */
export const getCategories = () => {
  return Object.keys(categoryRules);
};

/**
 * Manually recategorize an expense
 * @param {string} newCategory - New category name
 * @returns {Object} Category with full confidence
 */
export const manualCategorize = (newCategory) => {
  if (!categoryRules[newCategory]) {
    throw new Error('Invalid category');
  }

  return {
    category: newCategory,
    confidence: 100,
    matchedKeywords: ['manual']
  };
};
