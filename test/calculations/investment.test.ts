/**
 * Comprehensive Test Suite for Investment Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: HIGH - Critical financial calculations
 */

import { calculateInvestment } from '../../src/lib/calculations/investment';
import type { InvestmentInputs } from '../../src/lib/validations/calculator';
import type { InvestmentResults } from '../../src/lib/calculations/investment';

describe('Investment Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create investment inputs
  const createInvestmentInputs = (overrides: Partial<InvestmentInputs> = {}): InvestmentInputs => ({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 10,
    compoundingFrequency: 'monthly',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate basic investment with monthly contributions', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        years: 10,
        compoundingFrequency: 'monthly',
      });

      const result = calculateInvestment(inputs);

      // Expected values for this scenario
      expect(result.finalAmount).toBeGreaterThan(70000);
      expect(result.totalContributions).toBe(70000); // 10000 + (500 * 12 * 10)
      expect(result.totalGrowth).toBeGreaterThan(20000);
      expect(result.annualizedReturn).toBeGreaterThan(0);
      expect(result.yearlyBreakdown).toHaveLength(10);
    });

    test('should calculate investment with only initial amount (no monthly contributions)', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 8,
        years: 5,
        compoundingFrequency: 'annually',
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(10000);
      expect(result.finalAmount).toBeGreaterThan(10000);
      expect(result.totalGrowth).toBeGreaterThan(0);
      expectCloseTo(result.finalAmount, 14693.28, 0); // Compound interest formula
    });

    test('should calculate investment with only monthly contributions (no initial amount)', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 0,
        monthlyContribution: 1000,
        annualReturn: 6,
        years: 5,
        compoundingFrequency: 'monthly',
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(60000); // 1000 * 12 * 5
      expect(result.finalAmount).toBeGreaterThan(60000);
      expect(result.totalGrowth).toBeGreaterThan(0);
    });

    test('should calculate investment with different annual returns', () => {
      const testCases = [
        { annualReturn: 3, expectedGrowthRange: [10000, 20000] }, // More realistic expectations
        { annualReturn: 7, expectedGrowthRange: [25000, 40000] }, // Adjusted for realistic growth
        { annualReturn: 12, expectedGrowthRange: [40000, 80000] }, // Adjusted for realistic high growth
      ];

      testCases.forEach(({ annualReturn, expectedGrowthRange }) => {
        const inputs = createInvestmentInputs({ 
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn,
          years: 10 
        });
        const result = calculateInvestment(inputs);
        
        expect(result.totalGrowth).toBeGreaterThanOrEqual(expectedGrowthRange[0]);
        expect(result.totalGrowth).toBeLessThanOrEqual(expectedGrowthRange[1]);
      });
    });

    test('should calculate investment with different time periods', () => {
      const testCases = [
        { years: 1, expectedFinalAmount: [16000, 17000] },
        { years: 5, expectedFinalAmount: [45000, 55000] },
        { years: 20, expectedFinalAmount: [250000, 350000] },
        { years: 30, expectedFinalAmount: [600000, 900000] },
      ];

      testCases.forEach(({ years, expectedFinalAmount }) => {
        const inputs = createInvestmentInputs({ 
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn: 7,
          years 
        });
        const result = calculateInvestment(inputs);
        
        expect(result.finalAmount).toBeGreaterThanOrEqual(expectedFinalAmount[0]);
        expect(result.finalAmount).toBeLessThanOrEqual(expectedFinalAmount[1]);
      });
    });
  });

  describe('🔄 Compounding Frequency Tests', () => {
    
    test('should handle different compounding frequencies', () => {
      const baseInputs = {
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 8,
        years: 5,
      };

      const frequencies: InvestmentInputs['compoundingFrequency'][] = [
        'annually', 'semiannually', 'quarterly', 'monthly', 'daily'
      ];

      const results = frequencies.map(frequency => ({
        frequency,
        result: calculateInvestment({ ...baseInputs, compoundingFrequency: frequency })
      }));

      // More frequent compounding should yield higher returns
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.finalAmount).toBeGreaterThanOrEqual(
          results[i - 1].result.finalAmount
        );
      }

      // Daily compounding should be highest
      const dailyResult = results.find(r => r.frequency === 'daily')!.result;
      expect(dailyResult.finalAmount).toBeGreaterThan(14800);
    });

    test('should calculate annually compounded investment correctly', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 10,
        years: 3,
        compoundingFrequency: 'annually',
      });

      const result = calculateInvestment(inputs);

      // Manual calculation: 10000 * (1.10)^3 = 13,310
      expectCloseTo(result.finalAmount, 13310, 0);
      expect(result.totalContributions).toBe(10000);
      expectCloseTo(result.totalGrowth, 3310, 0);
    });

    test('should calculate quarterly compounded investment correctly', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 8,
        years: 2,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateInvestment(inputs);

      // Quarterly compounding: 10000 * (1.02)^8 ≈ 11,716.59
      expectCloseTo(result.finalAmount, 11716.59, 0);
    });

    test('should calculate daily compounded investment correctly', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 5000,
        monthlyContribution: 0,
        annualReturn: 6,
        years: 1,
        compoundingFrequency: 'daily',
      });

      const result = calculateInvestment(inputs);

      // Daily compounding should be close to continuous compounding
      expect(result.finalAmount).toBeGreaterThan(5300);
      expect(result.finalAmount).toBeLessThan(5320);
    });
  });

  describe('📊 Yearly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate yearly breakdown', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 1000,
        annualReturn: 8,
        years: 3,
        compoundingFrequency: 'monthly',
      });

      const result = calculateInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(3);

      // Check first year
      const year1 = result.yearlyBreakdown[0];
      expect(year1.year).toBe(1);
      expect(year1.startingBalance).toBe(10000);
      expect(year1.contributions).toBe(12000); // 1000 * 12
      expect(year1.growth).toBeGreaterThan(0);
      expect(year1.endingBalance).toBeGreaterThan(22000);
      expect(year1.cumulativeContributions).toBe(22000); // 10000 + 12000

      // Check that ending balance of year N equals starting balance of year N+1
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expectCloseTo(
          result.yearlyBreakdown[i].startingBalance,
          result.yearlyBreakdown[i - 1].endingBalance,
          2
        );
      }

      // Final year ending balance should equal final amount
      const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(finalYear.endingBalance, result.finalAmount, 2);
    });

    test('should calculate cumulative values correctly', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 5000,
        monthlyContribution: 500,
        annualReturn: 7,
        years: 5,
      });

      const result = calculateInvestment(inputs);

      result.yearlyBreakdown.forEach((year, index) => {
        // Cumulative contributions should increase by yearly contributions each year
        const expectedCumulative = 5000 + (6000 * (index + 1)); // 5000 + (500 * 12 * year)
        expect(year.cumulativeContributions).toBe(expectedCumulative);

        // Cumulative growth should equal ending balance minus cumulative contributions
        expectCloseTo(
          year.cumulativeGrowth,
          year.endingBalance - year.cumulativeContributions,
          2
        );
      });
    });

    test('should handle zero monthly contributions in yearly breakdown', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 6,
        years: 3,
      });

      const result = calculateInvestment(inputs);

      result.yearlyBreakdown.forEach(year => {
        expect(year.contributions).toBe(0);
        expect(year.growth).toBeGreaterThan(0);
        expect(year.endingBalance).toBeGreaterThan(year.startingBalance);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero initial amount', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 0,
        monthlyContribution: 1000,
        annualReturn: 8,
        years: 5,
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(60000);
      expect(result.finalAmount).toBeGreaterThan(60000);
      expect(result.totalGrowth).toBeGreaterThan(0);
      
      // First year should start with 0
      expect(result.yearlyBreakdown[0].startingBalance).toBe(0);
    });

    test('should handle zero monthly contributions', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 7,
        years: 10,
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(10000);
      expect(result.finalAmount).toBeGreaterThan(10000);
      
      // All yearly contributions should be 0
      result.yearlyBreakdown.forEach(year => {
        expect(year.contributions).toBe(0);
      });
    });

    test('should handle zero interest rate', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 0,
        years: 5,
      });

      const result = calculateInvestment(inputs);

      // With 0% return, final amount should equal total contributions
      expect(result.totalContributions).toBe(40000); // 10000 + (500 * 12 * 5)
      expectCloseTo(result.finalAmount, 40000, 2);
      expectCloseTo(result.totalGrowth, 0, 2);
    });

    test('should handle very high interest rates', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 50, // 50% annual return
        years: 5,
      });

      const result = calculateInvestment(inputs);

      expect(result.finalAmount).toBeGreaterThan(30000); // More realistic expectation
      expect(result.totalGrowth).toBeGreaterThan(result.totalContributions);
    });

    test('should handle very short investment periods', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 1000,
        annualReturn: 8,
        years: 1,
      });

      const result = calculateInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(1);
      expect(result.totalContributions).toBe(22000); // 10000 + (1000 * 12)
      expect(result.finalAmount).toBeGreaterThan(22000);
    });

    test('should handle very long investment periods', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        years: 50,
      });

      const result = calculateInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(50);
      expect(result.totalContributions).toBe(310000); // 10000 + (500 * 12 * 50)
      expect(result.finalAmount).toBeGreaterThan(1000000); // Should be over $1M
    });

    test('should handle very small amounts', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 1,
        monthlyContribution: 1,
        annualReturn: 5,
        years: 1,
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(13); // 1 + (1 * 12)
      expect(result.finalAmount).toBeGreaterThan(13);
      expect(result.totalGrowth).toBeGreaterThan(0);
    });

    test('should handle very large amounts', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 8,
        years: 10,
      });

      const result = calculateInvestment(inputs);

      expect(result.totalContributions).toBe(2200000); // 1M + (10K * 12 * 10)
      expect(result.finalAmount).toBeGreaterThan(3000000);
    });

    test('should handle fractional years', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 6,
        years: 2.5,
      });

      const result = calculateInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(2); // Should round down to 2 full years
      expect(result.totalContributions).toBe(25000); // 10000 + (500 * 12 * 2.5)
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid initial amount inputs', () => {
      const testCases = [
        { initialAmount: null },
        { initialAmount: undefined },
        { initialAmount: '' },
        { initialAmount: 'invalid' },
        { initialAmount: -10000 }, // Negative amount
      ];

      testCases.forEach(({ initialAmount }) => {
        const inputs = createInvestmentInputs({ initialAmount: initialAmount as any });
        const result = calculateInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.finalAmount).toBe('number');
        expect(isFinite(result.finalAmount)).toBe(true);
      });
    });

    test('should handle invalid monthly contribution inputs', () => {
      const testCases = [
        { monthlyContribution: null },
        { monthlyContribution: undefined },
        { monthlyContribution: '' },
        { monthlyContribution: 'invalid' },
        { monthlyContribution: -500 }, // Negative contribution
      ];

      testCases.forEach(({ monthlyContribution }) => {
        const inputs = createInvestmentInputs({ monthlyContribution: monthlyContribution as any });
        const result = calculateInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.finalAmount).toBe('number');
        expect(isFinite(result.finalAmount)).toBe(true);
      });
    });

    test('should handle invalid annual return inputs', () => {
      const testCases = [
        { annualReturn: null },
        { annualReturn: undefined },
        { annualReturn: '' },
        { annualReturn: 'invalid' },
        { annualReturn: -10 }, // Negative return
      ];

      testCases.forEach(({ annualReturn }) => {
        const inputs = createInvestmentInputs({ annualReturn: annualReturn as any });
        const result = calculateInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.finalAmount).toBe('number');
        expect(isFinite(result.finalAmount)).toBe(true);
      });
    });

    test('should handle string inputs with symbols', () => {
      const inputs = createInvestmentInputs({
        initialAmount: '$10,000' as any,
        monthlyContribution: '$500' as any,
        annualReturn: '7%' as any,
        years: '10 years' as any,
      });

      const result = calculateInvestment(inputs);

      expect(result).toBeDefined();
      expect(result.finalAmount).toBeGreaterThan(70000);
      expect(result.totalContributions).toBe(70000);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000.123456789,
        monthlyContribution: 500.987654321,
        annualReturn: 7.123456789,
        years: 10.123456789,
      });

      const result = calculateInvestment(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.finalAmount)).toBe(true);
      expect(Number.isFinite(result.totalContributions)).toBe(true);
      expect(Number.isFinite(result.totalGrowth)).toBe(true);
    });

    test('should handle invalid compounding frequency', () => {
      const inputs = createInvestmentInputs({
        compoundingFrequency: 'invalid' as any,
      });

      const result = calculateInvestment(inputs);

      expect(result).toBeDefined();
      expect(result.finalAmount).toBeGreaterThan(0);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify compound interest formula accuracy', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 8,
        years: 5,
        compoundingFrequency: 'annually',
      });

      const result = calculateInvestment(inputs);

      // Manual calculation: P(1 + r)^t = 10000 * (1.08)^5 = 14,693.28
      expectCloseTo(result.finalAmount, 14693.28, 0);
      expectCloseTo(result.totalGrowth, 4693.28, 0);
    });

    test('should verify monthly contribution calculations', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 0,
        monthlyContribution: 1000,
        annualReturn: 12,
        years: 1,
        compoundingFrequency: 'monthly',
      });

      const result = calculateInvestment(inputs);

      // With monthly contributions and monthly compounding
      expect(result.totalContributions).toBe(12000);
      expect(result.finalAmount).toBeGreaterThan(12000);
      expect(result.totalGrowth).toBeGreaterThan(600); // Should earn some interest
    });

    test('should verify annualized return calculation', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 0,
        annualReturn: 10,
        years: 5,
      });

      const result = calculateInvestment(inputs);

      // Annualized return should be close to the input return rate
      expect(result.annualizedReturn).toBeGreaterThan(9);
      expect(result.annualizedReturn).toBeLessThan(11);
    });

    test('should verify total calculations consistency', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 5000,
        monthlyContribution: 300,
        annualReturn: 6,
        years: 8,
      });

      const result = calculateInvestment(inputs);

      // Total contributions = initial + (monthly * 12 * years)
      const expectedContributions = 5000 + (300 * 12 * 8);
      expect(result.totalContributions).toBe(expectedContributions);

      // Total growth = final amount - total contributions
      expectCloseTo(result.totalGrowth, result.finalAmount - result.totalContributions, 2);

      // Final amount should equal last year's ending balance
      const lastYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(result.finalAmount, lastYear.endingBalance, 2);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long investment periods efficiently', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        years: 100, // 100 years
      });

      const startTime = Date.now();
      const result = calculateInvestment(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.yearlyBreakdown).toHaveLength(100);
      expect(result.finalAmount).toBeGreaterThan(1000000);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        initialAmount: 1000 + i * 100,
        monthlyContribution: 100 + i * 10,
        annualReturn: 3 + i * 0.1,
        years: 5 + i * 0.1,
        compoundingFrequency: ['monthly', 'quarterly', 'annually'][i % 3] as InvestmentInputs['compoundingFrequency'],
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateInvestment(inputs);
        expect(result).toBeDefined();
        expect(result.finalAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createInvestmentInputs({
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 8,
        years: 15,
        compoundingFrequency: 'monthly',
      });

      const result = calculateInvestment(inputs);

      // These values should remain consistent across code changes
      expect(result.totalContributions).toBe(205000); // 25000 + (1000 * 12 * 15)
      expect(result.finalAmount).toBeGreaterThan(400000);
      expect(result.finalAmount).toBeLessThan(500000);
      expect(result.totalGrowth).toBeGreaterThan(200000);
      expect(result.yearlyBreakdown).toHaveLength(15);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { initialAmount: 0, monthlyContribution: 1, annualReturn: 0.01, years: 1 },
        { initialAmount: 1000000, monthlyContribution: 0, annualReturn: 50, years: 50 },
        { initialAmount: 10000, monthlyContribution: 500, annualReturn: 0, years: 10 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.finalAmount).toBe('number');
        expect(typeof result.totalContributions).toBe('number');
        expect(typeof result.totalGrowth).toBe('number');
        expect(typeof result.annualizedReturn).toBe('number');
        expect(Array.isArray(result.yearlyBreakdown)).toBe(true);
        
        expect(isFinite(result.finalAmount)).toBe(true);
        expect(isFinite(result.totalContributions)).toBe(true);
        expect(isFinite(result.totalGrowth)).toBe(true);
        expect(isFinite(result.annualizedReturn)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createInvestmentInputs({
        initialAmount: 15000,
        monthlyContribution: 750,
        annualReturn: 9,
        years: 12,
      });

      const result = calculateInvestment(inputs);

      // Mathematical relationships that should always hold
      expect(result.finalAmount).toBeGreaterThan(result.totalContributions);
      expectCloseTo(result.totalGrowth, result.finalAmount - result.totalContributions, 2); // Use precision comparison
      expect(result.totalContributions).toBe(inputs.initialAmount + (inputs.monthlyContribution * 12 * inputs.years));
      
      // Yearly breakdown should sum correctly
      const totalYearlyContributions = result.yearlyBreakdown.reduce((sum, year) => sum + year.contributions, 0);
      expect(totalYearlyContributions).toBe(inputs.monthlyContribution * 12 * inputs.years);
      
      const totalYearlyGrowth = result.yearlyBreakdown.reduce((sum, year) => sum + year.growth, 0);
      expectCloseTo(totalYearlyGrowth, result.totalGrowth, 1);
    });
  });
});