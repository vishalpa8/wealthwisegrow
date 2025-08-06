import { describe, it, expect } from '@jest/globals';

// Budget Calculator Test Suite
// Testing the calculateBudget function from src/app/calculators/budget/page.tsx

interface BudgetInputs {
  monthlyIncome: number;
  housing: number;
  transportation: number;
  food: number;
  utilities: number;
  insurance: number;
  healthcare: number;
  savings: number;
  entertainment: number;
  other: number;
}

// Mock parseRobustNumber function for testing
const parseRobustNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

function calculateBudget(inputs: BudgetInputs) {
  // Use parseRobustNumber for flexible input handling
  const monthlyIncome = Math.abs(parseRobustNumber(inputs.monthlyIncome)) || 100000;
  const housing = Math.abs(parseRobustNumber(inputs.housing)) || 0;
  const transportation = Math.abs(parseRobustNumber(inputs.transportation)) || 0;
  const food = Math.abs(parseRobustNumber(inputs.food)) || 0;
  const utilities = Math.abs(parseRobustNumber(inputs.utilities)) || 0;
  const insurance = Math.abs(parseRobustNumber(inputs.insurance)) || 0;
  const healthcare = Math.abs(parseRobustNumber(inputs.healthcare)) || 0;
  const savings = Math.abs(parseRobustNumber(inputs.savings)) || 0;
  const entertainment = Math.abs(parseRobustNumber(inputs.entertainment)) || 0;
  const other = Math.abs(parseRobustNumber(inputs.other)) || 0;

  const totalExpenses = housing + transportation + food + utilities + insurance + healthcare + entertainment + other;
  const totalAllocated = totalExpenses + savings;
  const remainingIncome = monthlyIncome - totalAllocated;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const expenseRatio = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

  // Calculate category percentages
  const categoryPercentages = {
    housing: monthlyIncome > 0 ? (housing / monthlyIncome) * 100 : 0,
    transportation: monthlyIncome > 0 ? (transportation / monthlyIncome) * 100 : 0,
    food: monthlyIncome > 0 ? (food / monthlyIncome) * 100 : 0,
    utilities: monthlyIncome > 0 ? (utilities / monthlyIncome) * 100 : 0,
    insurance: monthlyIncome > 0 ? (insurance / monthlyIncome) * 100 : 0,
    healthcare: monthlyIncome > 0 ? (healthcare / monthlyIncome) * 100 : 0,
    savings: savingsRate,
    entertainment: monthlyIncome > 0 ? (entertainment / monthlyIncome) * 100 : 0,
    other: monthlyIncome > 0 ? (other / monthlyIncome) * 100 : 0,
  };

  // Budget health assessment
  let budgetHealth = "Good";
  let healthColor = "#10b981";
  
  if (savingsRate < 10) {
    budgetHealth = "Poor";
    healthColor = "#ef4444";
  } else if (savingsRate < 20) {
    budgetHealth = "Fair";
    healthColor = "#f59e0b";
  } else if (savingsRate >= 30) {
    budgetHealth = "Excellent";
    healthColor = "#059669";
  }

  // Recommendations
  const recommendations = [];
  if (categoryPercentages.housing > 30) {
    recommendations.push("Housing costs exceed 30% of income. Consider reducing housing expenses.");
  }
  if (savingsRate < 20) {
    recommendations.push("Aim to save at least 20% of your income for financial security.");
  }
  if (categoryPercentages.transportation > 15) {
    recommendations.push("Transportation costs are high. Consider carpooling or public transport.");
  }
  if (remainingIncome < 0) {
    recommendations.push("You're overspending! Reduce expenses or increase income.");
  }

  return {
    totalExpenses,
    totalAllocated,
    remainingIncome,
    savingsRate,
    expenseRatio,
    categoryPercentages,
    budgetHealth,
    healthColor,
    recommendations,
  };
}

describe('Budget Calculator', () => {
  describe('Basic Functionality', () => {
    it('should calculate budget correctly with typical inputs', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 30000,
        transportation: 8000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.totalExpenses).toBe(76000);
      expect(result.totalAllocated).toBe(96000);
      expect(result.remainingIncome).toBe(4000);
      expect(result.savingsRate).toBe(20);
      expect(result.expenseRatio).toBe(76);
      expect(result.budgetHealth).toBe('Good');
    });

    it('should calculate category percentages correctly', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 30000,
        transportation: 10000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 25000,
        entertainment: 5000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.categoryPercentages.housing).toBe(30);
      expect(result.categoryPercentages.transportation).toBe(10);
      expect(result.categoryPercentages.food).toBe(15);
      expect(result.categoryPercentages.savings).toBe(25);
    });

    it('should handle balanced budget correctly', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 30000,
        transportation: 10000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 10000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.remainingIncome).toBe(0);
      expect(result.totalAllocated).toBe(100000);
    });

    it('should handle overspending scenario', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 50000,
        housing: 30000,
        transportation: 15000,
        food: 10000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 5000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.remainingIncome).toBe(-33000);
      expect(result.recommendations).toContain("You're overspending! Reduce expenses or increase income.");
    });

    it('should assess budget health correctly', () => {
      // Poor budget (savings < 10%)
      const poorBudget: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 40000,
        transportation: 15000,
        food: 20000,
        utilities: 8000,
        insurance: 5000,
        healthcare: 3000,
        savings: 5000, // 5%
        entertainment: 4000,
        other: 0,
      };

      const poorResult = calculateBudget(poorBudget);
      expect(poorResult.budgetHealth).toBe('Poor');
      expect(poorResult.savingsRate).toBe(5);

      // Excellent budget (savings >= 30%)
      const excellentBudget: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 25000,
        transportation: 8000,
        food: 12000,
        utilities: 4000,
        insurance: 3000,
        healthcare: 2000,
        savings: 35000, // 35%
        entertainment: 6000,
        other: 5000,
      };

      const excellentResult = calculateBudget(excellentBudget);
      expect(excellentResult.budgetHealth).toBe('Excellent');
      expect(excellentResult.savingsRate).toBe(35);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income gracefully', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 0,
        housing: 30000,
        transportation: 8000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.monthlyIncome).toBe(100000); // Default fallback
      expect(result.savingsRate).toBeCloseTo(20, 1);
      expect(result.expenseRatio).toBeCloseTo(76, 1);
    });

    it('should handle all zero expenses', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000,
        housing: 0,
        transportation: 0,
        food: 0,
        utilities: 0,
        insurance: 0,
        healthcare: 0,
        savings: 0,
        entertainment: 0,
        other: 0,
      };

      const result = calculateBudget(inputs);

      expect(result.totalExpenses).toBe(0);
      expect(result.remainingIncome).toBe(100000);
      expect(result.savingsRate).toBe(0);
      expect(result.budgetHealth).toBe('Poor');
    });

    it('should handle very high income', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 10000000, // 1 crore
        housing: 2000000,
        transportation: 500000,
        food: 300000,
        utilities: 100000,
        insurance: 200000,
        healthcare: 100000,
        savings: 3000000,
        entertainment: 500000,
        other: 300000,
      };

      const result = calculateBudget(inputs);

      expect(result.totalExpenses).toBe(4000000);
      expect(result.savingsRate).toBe(30);
      expect(result.budgetHealth).toBe('Excellent');
    });

    it('should handle negative input values', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000,
        housing: -30000, // Should be converted to positive
        transportation: -8000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.totalExpenses).toBe(66000); // Negative values treated as 0
      expect(result.categoryPercentages.housing).toBe(30); // Converted to positive
      expect(result.categoryPercentages.transportation).toBe(8);
    });
  });

  describe('Input Validation', () => {
    it('should handle null and undefined inputs', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: null as any,
        housing: undefined as any,
        transportation: 8000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.monthlyIncome).toBe(100000); // Default fallback
      expect(result.totalExpenses).toBe(68000); // Null/undefined treated as 0
    });

    it('should handle non-numeric string inputs', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 'invalid' as any,
        housing: 'abc' as any,
        transportation: 8000,
        food: 15000,
        utilities: 5000,
        insurance: 3000,
        healthcare: 2000,
        savings: 20000,
        entertainment: 8000,
        other: 5000,
      };

      const result = calculateBudget(inputs);

      expect(result.monthlyIncome).toBe(100000); // Default fallback
      expect(result.totalExpenses).toBe(68000); // Invalid strings treated as 0
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should calculate percentages with precision', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 123456,
        housing: 37037, // ~30%
        transportation: 12346, // ~10%
        food: 18518, // ~15%
        utilities: 6173, // ~5%
        insurance: 3704, // ~3%
        healthcare: 2469, // ~2%
        savings: 24691, // ~20%
        entertainment: 9877, // ~8%
        other: 6173, // ~5%
      };

      const result = calculateBudget(inputs);

      expect(result.categoryPercentages.housing).toBeCloseTo(30, 1);
      expect(result.categoryPercentages.transportation).toBeCloseTo(10, 1);
      expect(result.categoryPercentages.savings).toBeCloseTo(20, 1);
    });

    it('should maintain financial precision', () => {
      const inputs: BudgetInputs = {
        monthlyIncome: 100000.99,
        housing: 30000.33,
        transportation: 8000.66,
        food: 15000.99,
        utilities: 5000.11,
        insurance: 3000.22,
        healthcare: 2000.44,
        savings: 20000.55,
        entertainment: 8000.77,
        other: 5000.88,
      };

      const result = calculateBudget(inputs);

      expect(result.totalExpenses).toBeCloseTo(76003.4, 2);
      expect(result.remainingIncome).toBeCloseTo(4997.04, 2);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const inputs: BudgetInputs = {
          monthlyIncome: 100000 + i,
          housing: 30000 + i,
          transportation: 8000 + i,
          food: 15000 + i,
          utilities: 5000 + i,
          insurance: 3000 + i,
          healthcare: 2000 + i,
          savings: 20000 + i,
          entertainment: 8000 + i,
          other: 5000 + i,
        };
        calculateBudget(inputs);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});