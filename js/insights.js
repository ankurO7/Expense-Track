// insights.js - Smart AI-like insights generation (Fixed Version)

class SmartInsights {
    constructor(expenses) {
        this.expenses = expenses || [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    // Generate all insights
    generateInsights() {
        if (this.expenses.length === 0) {
            return this.getEmptyStateInsights();
        }

        const insights = [];
        
        // Add various insight types
        insights.push(...this.getSpendingPatternInsights());
        insights.push(...this.getCategoryInsights());
        insights.push(...this.getTrendInsights());
        insights.push(...this.getBudgetInsights());
        insights.push(...this.getPersonalizedTips());

        // Shuffle and return top 5 insights
        return this.shuffleArray(insights).slice(0, 5);
    }

    // Empty state insights
    getEmptyStateInsights() {
        return [
            {
                icon: '🚀',
                title: 'Getting Started',
                content: 'Add some expenses to unlock powerful AI insights about your spending patterns!'
            },
            {
                icon: '📊',
                title: 'Smart Analytics',
                content: 'Our AI will analyze your spending habits and provide personalized recommendations.'
            },
            {
                icon: '💡',
                title: 'Pro Tip',
                content: 'The more expenses you track, the smarter our insights become. Start with your daily purchases!'
            }
        ];
    }

    // Spending pattern insights
    getSpendingPatternInsights() {
        const insights = [];
        const thisMonth = this.getThisMonthExpenses();
        const lastMonth = this.getLastMonthExpenses();
        
        if (thisMonth.length > 0) {
            const avgDaily = this.getAverageDaily(thisMonth);
            const totalThisMonth = this.getTotalAmount(thisMonth);
            
            insights.push({
                icon: '📈',
                title: 'Daily Spending Average',
                content: `You're spending an average of ${formatCurrency(avgDaily)} per day this month.`
            });

            if (totalThisMonth > 1000) {
                insights.push({
                    icon: '💰',
                    title: 'High Spending Alert',
                    content: `You've spent ${formatCurrency(totalThisMonth)} this month. Consider reviewing your largest expenses.`
                });
            }

            if (lastMonth.length > 0) {
                const comparison = this.compareMonthlySpending(thisMonth, lastMonth);
                insights.push({
                    icon: comparison.trend === 'up' ? '📈' : '📉',
                    title: 'Monthly Trend',
                    content: `Your spending is ${comparison.percentage}% ${comparison.trend} compared to last month.`
                });
            }
        }

        return insights;
    }

    // Category-based insights
    getCategoryInsights() {
        const insights = [];
        const categoryTotals = this.getCategoryTotals();
        const topCategory = this.getTopCategory(categoryTotals);
        
        if (topCategory) {
            const percentage = ((categoryTotals[topCategory.name] / this.getTotalAmount(this.expenses)) * 100).toFixed(0);
            
            insights.push({
                icon: CATEGORY_ICONS[topCategory.name],
                title: 'Top Spending Category',
                content: `${CATEGORY_NAMES[topCategory.name]} accounts for ${percentage}% of your total spending.`
            });

            // Category-specific advice
            const advice = this.getCategoryAdvice(topCategory.name);
            if (advice) {
                insights.push(advice);
            }
        }

        // Unused categories
        const unusedCategories = this.getUnusedCategories(categoryTotals);
        if (unusedCategories.length > 0) {
            insights.push({
                icon: '🎯',
                title: 'Expense Tracking Tip',
                content: `You haven't tracked any ${unusedCategories[0]} expenses yet. Don't forget to log all spending!`
            });
        }

        return insights;
    }

    // Trend analysis insights
    getTrendInsights() {
        const insights = [];
        const weekdaySpending = this.getWeekdaySpending();

        // Weekday patterns
        const highestWeekday = this.getHighestSpendingDay(weekdaySpending);
        if (highestWeekday) {
            insights.push({
                icon: '📅',
                title: 'Spending Pattern',
                content: `You tend to spend the most on ${highestWeekday.day}s. Average: ${formatCurrency(highestWeekday.average)}`
            });
        }

        // Recent activity
        const recentExpenses = this.getRecentExpenses(7);
        if (recentExpenses.length > 0) {
            insights.push({
                icon: '⏰',
                title: 'Recent Activity',
                content: `You've logged ${recentExpenses.length} expenses in the last 7 days totaling ${formatCurrency(this.getTotalAmount(recentExpenses))}.`
            });
        }

        return insights;
    }

    // Budget and goal insights
    getBudgetInsights() {
        const insights = [];
        const thisMonth = this.getThisMonthExpenses();
        const totalThisMonth = this.getTotalAmount(thisMonth);
        
        // Estimated monthly spending
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const currentDay = new Date().getDate();
        const projectedMonthly = (totalThisMonth / currentDay) * daysInMonth;
        
        if (currentDay > 7) { // Only show after a week
            insights.push({
                icon: '🎯',
                title: 'Monthly Projection',
                content: `Based on current spending, you're projected to spend ${formatCurrency(projectedMonthly)} this month.`
            });
        }

        // Saving opportunities
        const savingTips = this.getSavingOpportunities();
        insights.push(...savingTips);

        return insights;
    }

    // Personalized tips
    getPersonalizedTips() {
        const tips = [
            {
                icon: '💡',
                title: 'Smart Tip',
                content: 'Track recurring expenses like subscriptions to better understand your fixed costs.'
            },
            {
                icon: '🏆',
                title: 'Achievement Unlocked',
                content: `You've tracked ${this.expenses.length} expenses! Keep building this healthy financial habit.`
            },
            {
                icon: '📱',
                title: 'Mobile Tip',
                content: 'Take photos of receipts right after purchases to never forget an expense!'
            },
            {
                icon: '🔍',
                title: 'Analysis Ready',
                content: 'With more data, our AI can provide even more personalized insights about your spending habits.'
            }
        ];

        return tips;
    }

    // Helper methods
    getThisMonthExpenses() {
        return this.expenses.filter(expense => {
            const date = new Date(expense.date);
            return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
        });
    }

    getLastMonthExpenses() {
        const lastMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        const lastMonthYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        
        return this.expenses.filter(expense => {
            const date = new Date(expense.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
    }

    getAverageDaily(expenses) {
        if (expenses.length === 0) return 0;
        const total = this.getTotalAmount(expenses);
        const days = new Set(expenses.map(e => e.date)).size;
        return total / (days || 1);
    }

    getTotalAmount(expenses) {
        return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }

    getCategoryTotals() {
        const totals = {};
        this.expenses.forEach(expense => {
            totals[expense.category] = (totals[expense.category] || 0) + parseFloat(expense.amount);
        });
        return totals;
    }

    getTopCategory(categoryTotals) {
        let topCategory = null;
        let maxAmount = 0;
        
        for (const [category, amount] of Object.entries(categoryTotals)) {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCategory = { name: category, amount: amount };
            }
        }
        
        return topCategory;
    }

    getCategoryAdvice(category) {
        const advice = {
            food: {
                icon: '🍽️',
                title: 'Food Spending Insight',
                content: 'Consider meal planning and cooking at home more often to reduce dining expenses.'
            },
            transport: {
                icon: '🚗',
                title: 'Transport Optimization',
                content: 'Look into carpooling or public transport options to reduce transportation costs.'
            },
            shopping: {
                icon: '🛒',
                title: 'Shopping Smart',
                content: 'Try creating shopping lists and comparing prices before making purchases.'
            },
            entertainment: {
                icon: '🎭',
                title: 'Entertainment Balance',
                content: 'Look for free or low-cost entertainment options like parks or community events.'
            }
        };
        
        return advice[category] || null;
    }

    getUnusedCategories(categoryTotals) {
        const allCategories = Object.keys(CATEGORY_NAMES);
        return allCategories.filter(cat => !categoryTotals[cat] && cat !== 'other');
    }

    getWeekdaySpending() {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const spending = {};
        
        weekdays.forEach(day => {
            spending[day] = [];
        });
        
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const day = weekdays[date.getDay()];
            spending[day].push(parseFloat(expense.amount));
        });
        
        return spending;
    }

    getHighestSpendingDay(weekdaySpending) {
        let highestDay = null;
        let maxAverage = 0;
        
        for (const [day, amounts] of Object.entries(weekdaySpending)) {
            if (amounts.length > 0) {
                const average = amounts.reduce((a, b) => a + b) / amounts.length;
                if (average > maxAverage) {
                    maxAverage = average;
                    highestDay = { day, average };
                }
            }
        }
        
        return highestDay;
    }

    getRecentExpenses(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.expenses.filter(expense => {
            return new Date(expense.date) >= cutoffDate;
        });
    }

    compareMonthlySpending(thisMonth, lastMonth) {
        const thisTotal = this.getTotalAmount(thisMonth);
        const lastTotal = this.getTotalAmount(lastMonth);
        
        if (lastTotal === 0) return { trend: 'up', percentage: 100 };
        
        const percentage = Math.abs(((thisTotal - lastTotal) / lastTotal) * 100).toFixed(0);
        const trend = thisTotal > lastTotal ? 'up' : 'down';
        
        return { trend, percentage };
    }

    getSavingOpportunities() {
        const opportunities = [];
        const categoryTotals = this.getCategoryTotals();
        
        // High spending categories get saving tips
        const highSpendingTips = this.getHighSpendingTips(categoryTotals);
        opportunities.push(...highSpendingTips);
        
        return opportunities.slice(0, 2); // Limit to 2 opportunities
    }

    getHighSpendingTips(categoryTotals) {
        const tips = [];
        const savingAdvice = {
            food: '🍳 Cook more meals at home to reduce food expenses',
            shopping: '🏷️ Use coupon apps and compare prices before buying',
            entertainment: '📺 Consider sharing streaming subscriptions with family',
            transport: '⛽ Track fuel efficiency and consider carpooling'
        };
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > 500 && savingAdvice[category]) {
                tips.push({
                    icon: '💰',
                    title: 'Saving Opportunity',
                    content: savingAdvice[category]
                });
            }
        });
        
        return tips;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}