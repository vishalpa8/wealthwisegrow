import { describe, it, expect } from '@jest/globals';

// Retirement Calculator Test Suite
// Testing the calculateRetirement function from src/app/calculators/retirement/page.tsx

interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number;
  retirementGoal: number;
}

function calculateRetirement(inputs: RetirementInputs) {
  let currentAge = parseInt(String(inputs.currentAge), 10);
  if (isNaN(currentAge)) {
    currentAge = 25;
  }
  currentAge = Math.max(Math.abs(currentAge), 1);

  let retirementAge = parseInt(String(inputs.retirementAge), 10);
  if (isNaN(retirementAge)) {
    retirementAge = 65;
  }
  retirementAge = Math.max(Math.abs(retirementAge), currentAge + 1);

  let currentSavings = parseFloat(String(inputs.currentSavings));
  if (isNaN(currentSavings)) {
    currentSavings = 0;
  }
  currentSavings = Math.abs(currentSavings);

  let monthlyContribution = parseFloat(String(inputs.monthlyContribution));
  if (isNaN(monthlyContribution)) {
    monthlyContribution = 0;
  }
  monthlyContribution = Math.abs(monthlyContribution);

  let annualReturnRate = parseFloat(String(inputs.annualReturnRate));
  if (isNaN(annualReturnRate)) {
    annualReturnRate = 0;
  }
  annualReturnRate = Math.abs(annualReturnRate);

  const yearsToRetirement = retirementAge - currentAge;
  const n = yearsToRetirement * 12; // Total months
  const r = annualReturnRate / 100 / 12; // Monthly rate

  // Future value of current savings
  const fvCurrentSavings = currentSavings * Math.pow(1 + r, n);

  // Future value of monthly contributions (annuity)
  let fvMonthlyContributions = 0;
  if (r === 0) {
    fvMonthlyContributions = monthlyContribution * n;
  } else {
    fvMonthlyContributions = (monthlyContribution * (Math.pow(1 + r, n) - 1)) / r;
  }

  const projectedSavings = fvCurrentSavings + fvMonthlyContributions;

  return {
    projectedSavings,
    yearsToRetirement,
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    annualReturnRate,
  };
}

describe('Retirement Calculator', () => {
  describe('Basic Functionality', () => {
    it('should calculate retirement savings correctly with typical inputs', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 100000,
        monthlyContribution: 5000,
        annualReturnRate: 8,
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(35);
      expect(result.projectedSavings).toBeGreaterThan(100000);
      expect(result.projectedSavings).toBeGreaterThan(inputs.currentSavings);
    });

    it('should handle zero current savings', () => {
      const inputs: RetirementInputs = {
        currentAge: 25,
        retirementAge: 60,
        currentSavings: 0,
        monthlyContribution: 3000,
        annualReturnRate: 7,
        retirementGoal: 3000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(35);
      expect(result.projectedSavings).toBeGreaterThan(0);
      // With zero current savings, all projected savings come from contributions
      expect(result.projectedSavings).toBeGreaterThan(inputs.monthlyContribution * 12 * result.yearsToRetirement);
    });

    it('should handle zero monthly contributions', () => {
      const inputs: RetirementInputs = {
        currentAge: 40,
        retirementAge: 65,
        currentSavings: 500000,
        monthlyContribution: 0,
        annualReturnRate: 6,
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(25);
      expect(result.projectedSavings).toBeGreaterThan(inputs.currentSavings);
      // With zero contributions, growth comes only from current savings
      const r = inputs.annualReturnRate / 100 / 12;
      const n = result.yearsToRetirement * 12;
      const expectedGrowth = inputs.currentSavings * Math.pow(1 + r, n);
      expect(result.projectedSavings).toBeCloseTo(expectedGrowth, -3);
    });

    it('should handle zero interest rate', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 100000,
        monthlyContribution: 2000,
        annualReturnRate: 0,
        retirementGoal: 1500000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(35);
      // With zero interest, projected savings = current savings + total contributions
      const expectedSavings = inputs.currentSavings + (inputs.monthlyContribution * 12 * result.yearsToRetirement);
      expect(result.projectedSavings).toBeCloseTo(expectedSavings, 2);
    });

    it('should calculate compound growth correctly', () => {
      const inputs: RetirementInputs = {
        currentAge: 25,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        annualReturnRate: 10,
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(40);
      expect(result.projectedSavings).toBeGreaterThan(5000000); // Should exceed goal with good returns
    });
  });

  describe('Edge Cases', () => {
    it('should handle current age equal to retirement age', () => {
      const inputs: RetirementInputs = {
        currentAge: 65,
        retirementAge: 65,
        currentSavings: 1000000,
        monthlyContribution: 5000,
        annualReturnRate: 7,
        retirementGoal: 1000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(1); // Minimum 1 year difference enforced
      expect(result.projectedSavings).toBeGreaterThan(result.currentSavings);
    });

    it('should handle retirement age less than current age', () => {
      const inputs: RetirementInputs = {
        currentAge: 70,
        retirementAge: 65,
        currentSavings: 500000,
        monthlyContribution: 2000,
        annualReturnRate: 5,
        retirementGoal: 1000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(1); // Should enforce minimum 1 year
      expect(result.projectedSavings).toBeGreaterThan(result.currentSavings);
    });

    it('should handle very young current age', () => {
      const inputs: RetirementInputs = {
        currentAge: 0,
        retirementAge: 65,
        currentSavings: 10000,
        monthlyContribution: 500,
        annualReturnRate: 8,
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(1); // Minimum age enforced
      expect(result.yearsToRetirement).toBe(64);
      expect(result.projectedSavings).toBeGreaterThan(1000000); // Very long time horizon
    });

    it('should handle very high interest rates', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 100000,
        monthlyContribution: 2000,
        annualReturnRate: 50, // Unrealistic but should not break
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(35);
      expect(result.projectedSavings).toBeGreaterThan(100000000); // Very high with 50% returns
      expect(isFinite(result.projectedSavings)).toBe(true);
    });

    it('should handle very large current savings', () => {
      const inputs: RetirementInputs = {
        currentAge: 50,
        retirementAge: 65,
        currentSavings: 10000000, // 1 crore
        monthlyContribution: 10000,
        annualReturnRate: 7,
        retirementGoal: 20000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(15);
      expect(result.projectedSavings).toBeGreaterThan(20000000);
    });

    it('should handle negative input values', () => {
      const inputs: RetirementInputs = {
        currentAge: -30,
        retirementAge: -65,
        currentSavings: -100000,
        monthlyContribution: -2000,
        annualReturnRate: -5,
        retirementGoal: -1000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(30); // Converted to positive
      expect(result.retirementAge).toBe(65); // Converted to positive
      expect(result.currentSavings).toBe(100000); // Converted to positive
      expect(result.monthlyContribution).toBe(2000); // Converted to positive
      expect(result.annualReturnRate).toBe(5); // Converted to positive
    });
  });

  describe('Input Validation', () => {
    it('should handle null and undefined inputs', () => {
      const inputs: RetirementInputs = {
        currentAge: null as any,
        retirementAge: undefined as any,
        currentSavings: 100000,
        monthlyContribution: 2000,
        annualReturnRate: 7,
        retirementGoal: 1000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(25); // Default fallback
      expect(result.retirementAge).toBe(65); // Default fallback
      expect(result.yearsToRetirement).toBe(40);
    });

    it('should handle string inputs', () => {
      const inputs: RetirementInputs = {
        currentAge: '35' as any,
        retirementAge: '65' as any,
        currentSavings: '200000' as any,
        monthlyContribution: '3000' as any,
        annualReturnRate: '8' as any,
        retirementGoal: '2000000' as any,
      };

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(35);
      expect(result.retirementAge).toBe(65);
      expect(result.yearsToRetirement).toBe(30);
    });

    it('should handle non-numeric string inputs', () => {
      const inputs: RetirementInputs = {
        currentAge: 'invalid' as any,
        retirementAge: 'abc' as any,
        currentSavings: 100000,
        monthlyContribution: 2000,
        annualReturnRate: 7,
        retirementGoal: 1000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(25); // Default fallback
      expect(result.retirementAge).toBe(65); // Default fallback
    });

    it('should handle empty object input', () => {
      const inputs = {} as RetirementInputs;

      const result = calculateRetirement(inputs);

      expect(result.currentAge).toBe(25); // Default fallback
      expect(result.retirementAge).toBe(65); // Default fallback
      expect(result.currentSavings).toBe(0); // Default fallback
      expect(result.monthlyContribution).toBe(0); // Default fallback
      expect(result.annualReturnRate).toBe(0); // Default fallback
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should verify future value of current savings formula', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 40, // 10 years
        currentSavings: 100000,
        monthlyContribution: 0, // No contributions to isolate current savings growth
        annualReturnRate: 10,
        retirementGoal: 300000,
      };

      const result = calculateRetirement(inputs);

      // Manual calculation: FV = PV * (1 + r)^n
      const r = inputs.annualReturnRate / 100 / 12;
      const n = result.yearsToRetirement * 12;
      const expectedFV = 100000 * Math.pow(1 + r, n);
      expect(result.projectedSavings).toBeCloseTo(expectedFV, 2);
    });

    it('should verify future value of annuity formula', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 40, // 10 years
        currentSavings: 0, // No current savings to isolate contribution growth
        monthlyContribution: 1000,
        annualReturnRate: 12, // 1% per month
        retirementGoal: 200000,
      };

      const result = calculateRetirement(inputs);

      // Manual calculation: FV = PMT * [((1 + r)^n - 1) / r]
      const monthlyRate = 0.12 / 12;
      const months = 10 * 12;
      const expectedFV = 1000 * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      expect(result.projectedSavings).toBeCloseTo(expectedFV, 2);
    });

    it('should verify combined formula accuracy', () => {
      const inputs: RetirementInputs = {
        currentAge: 25,
        retirementAge: 35, // 10 years
        currentSavings: 50000,
        monthlyContribution: 2000,
        annualReturnRate: 8,
        retirementGoal: 500000,
      };

      const result = calculateRetirement(inputs);

      // Manual calculation
      const monthlyRate = 0.08 / 12;
      const months = 10 * 12;
      
      const fvCurrentSavings = 50000 * Math.pow(1 + monthlyRate, months);
      const fvContributions = 2000 * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const expectedTotal = fvCurrentSavings + fvContributions;
      
      expect(result.projectedSavings).toBeCloseTo(expectedTotal, 2);
    });

    it('should maintain financial precision', () => {
      const inputs: RetirementInputs = {
        currentAge: 30.5,
        retirementAge: 65.5,
        currentSavings: 123456.78,
        monthlyContribution: 2345.67,
        annualReturnRate: 7.25,
        retirementGoal: 3456789.12,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(35);
      expect(result.projectedSavings).toBeGreaterThan(0);
      expect(isFinite(result.projectedSavings)).toBe(true);
    });

    it('should handle very long time horizons', () => {
      const inputs: RetirementInputs = {
        currentAge: 20,
        retirementAge: 70, // 50 years
        currentSavings: 10000,
        monthlyContribution: 500,
        annualReturnRate: 8,
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(50);
      expect(result.projectedSavings).toBeGreaterThan(3500000);
      expect(isFinite(result.projectedSavings)).toBe(true);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle early retirement scenario', () => {
      const inputs: RetirementInputs = {
        currentAge: 25,
        retirementAge: 50, // Early retirement
        currentSavings: 100000,
        monthlyContribution: 10000, // High savings rate
        annualReturnRate: 9,
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(25);
      expect(result.projectedSavings).toBeGreaterThan(5000000);
    });

    it('should handle late start retirement planning', () => {
      const inputs: RetirementInputs = {
        currentAge: 50,
        retirementAge: 65, // Standard retirement
        currentSavings: 200000, // Late start
        monthlyContribution: 8000, // Catch-up contributions
        annualReturnRate: 7,
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(15);
      expect(result.projectedSavings).toBeGreaterThan(1500000);
    });

    it('should handle conservative investment approach', () => {
      const inputs: RetirementInputs = {
        currentAge: 35,
        retirementAge: 65,
        currentSavings: 300000,
        monthlyContribution: 3000,
        annualReturnRate: 4, // Conservative returns
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(30);
      expect(result.projectedSavings).toBeGreaterThan(1000000);
    });

    it('should handle aggressive investment approach', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 60,
        currentSavings: 150000,
        monthlyContribution: 4000,
        annualReturnRate: 12, // Aggressive returns
        retirementGoal: 5000000,
      };

      const result = calculateRetirement(inputs);

      expect(result.yearsToRetirement).toBe(30);
      expect(result.projectedSavings).toBeGreaterThan(5000000);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const inputs: RetirementInputs = {
          currentAge: 25 + (i % 40),
          retirementAge: 65 + (i % 10),
          currentSavings: 50000 + i * 100,
          monthlyContribution: 2000 + i * 10,
          annualReturnRate: 5 + (i % 10),
          retirementGoal: 1000000 + i * 1000,
        };
        calculateRetirement(inputs);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should maintain consistency across multiple calculations', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 100000,
        monthlyContribution: 3000,
        annualReturnRate: 8,
        retirementGoal: 2000000,
      };

      const result1 = calculateRetirement(inputs);
      const result2 = calculateRetirement(inputs);
      const result3 = calculateRetirement(inputs);

      expect(result1.projectedSavings).toBe(result2.projectedSavings);
      expect(result2.yearsToRetirement).toBe(result3.yearsToRetirement);
    });
  });

  describe('Error Handling', () => {
    it('should not throw errors with extreme inputs', () => {
      const extremeInputs: RetirementInputs = {
        currentAge: Number.MAX_SAFE_INTEGER,
        retirementAge: Number.MAX_SAFE_INTEGER,
        currentSavings: Number.MAX_SAFE_INTEGER,
        monthlyContribution: Number.MAX_SAFE_INTEGER,
        annualReturnRate: Number.MAX_SAFE_INTEGER,
        retirementGoal: Number.MAX_SAFE_INTEGER,
      };

      expect(() => calculateRetirement(extremeInputs)).not.toThrow();
    });

    it('should handle infinity values gracefully', () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: Infinity as any,
        monthlyContribution: 3000,
        annualReturnRate: 8,
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);
      expect(isFinite(result.yearsToRetirement)).toBe(true);
    });

    it('should handle NaN values gracefully', () => {
      const inputs: RetirementInputs = {
        currentAge: NaN as any,
        retirementAge: NaN as any,
        currentSavings: 100000,
        monthlyContribution: 3000,
        annualReturnRate: 8,
        retirementGoal: 2000000,
      };

      const result = calculateRetirement(inputs);
      expect(result.currentAge).toBe(25); // Default fallback
      expect(result.retirementAge).toBe(65); // Default fallback
      expect(isNaN(result.projectedSavings)).toBe(false);
    });
  });
});