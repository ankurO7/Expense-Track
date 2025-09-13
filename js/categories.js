// categories.js - Smart AI-like categorization system (Fixed Version)

const CATEGORY_KEYWORDS = {
    food: [
        'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee',
        'pizza', 'burger', 'sandwich', 'groceries', 'supermarket', 'starbucks',
        'mcdonalds', 'kfc', 'subway', 'dominos', 'meal', 'snack', 'drink',
        'market', 'deli', 'bakery', 'kitchen', 'dining', 'eat', 'hungry',
        'taco', 'sushi', 'chinese', 'italian', 'mexican', 'thai', 'indian'
    ],
    transport: [
        'gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'subway',
        'parking', 'toll', 'car', 'bike', 'flight', 'airline', 'airport',
        'metro', 'transportation', 'commute', 'travel', 'vehicle', 'auto',
        'garage', 'mechanic', 'oil change', 'tire', 'repair'
    ],
    shopping: [
        'amazon', 'shop', 'store', 'mall', 'purchase', 'buy', 'clothes',
        'clothing', 'shoes', 'electronics', 'gadget', 'phone', 'laptop',
        'computer', 'target', 'walmart', 'costco', 'online', 'delivery',
        'order', 'fashion', 'accessories', 'jewelry', 'watch', 'bag'
    ],
    entertainment: [
        'movie', 'cinema', 'theater', 'netflix', 'spotify', 'game', 'gaming',
        'concert', 'show', 'ticket', 'event', 'party', 'bar', 'pub',
        'club', 'entertainment', 'fun', 'hobby', 'book', 'magazine',
        'subscription', 'youtube', 'streaming', 'music', 'video'
    ],
    bills: [
        'electric', 'electricity', 'water', 'gas', 'internet', 'phone',
        'mobile', 'bill', 'utility', 'rent', 'mortgage', 'insurance',
        'cable', 'wifi', 'heating', 'cooling', 'power', 'energy',
        'subscription', 'service', 'monthly', 'payment', 'due'
    ],
    health: [
        'doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health',
        'dental', 'dentist', 'checkup', 'appointment', 'prescription',
        'clinic', 'therapy', 'treatment', 'surgery', 'medication',
        'vitamins', 'supplements', 'fitness', 'gym', 'wellness'
    ],
    education: [
        'school', 'college', 'university', 'tuition', 'books', 'course',
        'class', 'education', 'learning', 'student', 'study', 'training',
        'workshop', 'seminar', 'certification', 'exam', 'fee', 'academic'
    ],
    travel: [
        'hotel', 'flight', 'vacation', 'trip', 'travel', 'booking',
        'airbnb', 'resort', 'cruise', 'tour', 'sightseeing', 'luggage',
        'passport', 'visa', 'tourism', 'adventure', 'holiday', 'journey'
    ]
};

const CATEGORY_ICONS = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎬',
    bills: '💡',
    health: '🏥',
    education: '📚',
    travel: '✈️',
    other: '📦'
};

const CATEGORY_NAMES = {
    food: 'Food & Dining',
    transport: 'Transportation',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills & Utilities',
    health: 'Healthcare',
    education: 'Education',
    travel: 'Travel',
    other: 'Other'
};

// Smart categorization function - Reduced cognitive complexity
function categorizeExpense(description) {
    if (!description) return 'other';
    
    const desc = description.toLowerCase();
    let bestMatch = 'other';
    let highestScore = 0;
    
    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const score = calculateCategoryScore(desc, keywords);
        
        if (score > highestScore) {
            highestScore = score;
            bestMatch = category;
        }
    }
    
    return bestMatch;
}

// Helper function to calculate category score
function calculateCategoryScore(description, keywords) {
    let score = 0;
    
    for (const keyword of keywords) {
        if (description.includes(keyword)) {
            score += keyword.length;
            
            // Exact matches get bonus points
            if (description === keyword) {
                score += 10;
            }
            
            // Word boundary matches get bonus points
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(description)) {
                score += 5;
            }
        }
    }
    
    return score;
}

// Generate AI suggestion message
function generateAISuggestion(description, suggestedCategory) {
    const messages = [
        `🤖 AI suggests "${CATEGORY_NAMES[suggestedCategory]}" category`,
        `💡 Smart categorization: ${CATEGORY_ICONS[suggestedCategory]} ${CATEGORY_NAMES[suggestedCategory]}`,
        `🎯 AI detected: ${CATEGORY_NAMES[suggestedCategory]} expense`,
        `⚡ Auto-categorized as ${CATEGORY_NAMES[suggestedCategory]}`,
        `🔍 AI analysis: Best fit is ${CATEGORY_NAMES[suggestedCategory]}`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// Validate expense amount
function validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get category color for charts
function getCategoryColor(category) {
    const colors = {
        food: '#FF6384',
        transport: '#36A2EB',
        shopping: '#FFCE56',
        entertainment: '#4BC0C0',
        bills: '#9966FF',
        health: '#FF9F40',
        education: '#FF6384',
        travel: '#C9CBCF',
        other: '#4BC0C0'
    };
    
    return colors[category] || colors.other;
}