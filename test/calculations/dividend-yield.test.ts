/**
 * Comprehensive Test Suite for Dividend Yield Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: LOW - Stock dividend yield and income calculations
 */

import { calculateDividendYield } from '../../src/lib/calculations/savings';
import type { DividendYieldInputs, DividendYieldResults } from '../../src/lib/calculations/savings';

describe('Dividend Yield Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create dividend yield inputs
  const createDividendYieldInputs = (overrides: Partial<DividendYieldInputs> = {}): DividendYieldInputs => ({
    stockPrice: 1000,
    annualDividend: 50,
    numberOfShares: 100,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate dividend yield correctly', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 50,
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 5, 2); // (50/1000) * 100 = 5%
      expectCloseTo(result.annualDividendIncome, 5000, 2); // 50 * 100
      expectCloseTo(result.quarterlyDividendIncome, 1250, 2); // 5000/4
      expectCloseTo(result.monthlyDividendIncome, 416.67, 2); // 5000/12
      expectCloseTo(result.totalInvestment, 100000, 2); // 1000 * 100
    });

    test('should calculate dividend yield with different stock prices', () => {
      const testCases = [
        { stockPrice: 500, expectedYield: 10 }, // (50/500) * 100
        { stockPrice: 1000, expectedYield: 5 }, // (50/1000) * 100
        { stockPrice: 2000, expectedYield: 2.5 }, // (50/2000) * 100
        { stockPrice: 2500, expectedYield: 2 }, // (50/2500) * 100
      ];

      testCases.forEach(({ stockPrice, expectedYield }) => {
        const inputs = createDividendYieldInputs({ 
          stockPrice,
          annualDividend: 50,
          numberOfShares: 100 
        });
        const result = calculateDividendYield(inputs);
        
        expectCloseTo(result.dividendYield, expectedYield, 2);
        expect(result.annualDividendIncome).toBe(5000); // Should remain constant
      });
    });

    test('should calculate dividend yield with different annual dividends', () => {
      const testCases = [
        { annualDividend: 25, expectedYield: 2.5, expectedIncome: 2500 },
        { annualDividend: 50, expectedYield: 5, expectedIncome: 5000 },
        { annualDividend: 75, expectedYield: 7.5, expectedIncome: 7500 },
        { annualDividend: 100, expectedYield: 10, expectedIncome: 10000 },
      ];

      testCases.forEach(({ annualDividend, expectedYield, expectedIncome }) => {
        const inputs = createDividendYieldInputs({ 
          stockPrice: 1000,
          annualDividend,
          numberOfShares: 100 
        });
        const result = calculateDividendYield(inputs);
        
        expectCloseTo(result.dividendYield, expectedYield, 2);
        expectCloseTo(result.annualDividendIncome, expectedIncome, 2);
      });
    });

    test('should calculate dividend yield with different number of shares', () => {
      const testCases = [
        { numberOfShares: 50, expectedIncome: 2500, expectedInvestment: 50000 },
        { numberOfShares: 100, expectedIncome: 5000, expectedInvestment: 100000 },
        { numberOfShares: 200, expectedIncome: 10000, expectedInvestment: 200000 },
        { numberOfShares: 500, expectedIncome: 25000, expectedInvestment: 500000 },
      ];

      testCases.forEach(({ numberOfShares, expectedIncome, expectedInvestment }) => {
        const inputs = createDividendYieldInputs({ 
          stockPrice: 1000,
          annualDividend: 50,
          numberOfShares 
        });
        const result = calculateDividendYield(inputs);
        
        expectCloseTo(result.dividendYield, 5, 2); // Should remain constant
        expectCloseTo(result.annualDividendIncome, expectedIncome, 2);
        expectCloseTo(result.totalInvestment, expectedInvestment, 2);
      });
    });
  });

  describe('📊 Income Distribution Tests', () => {
    
    test('should calculate quarterly dividend income correctly', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 800,
        annualDividend: 40,
        numberOfShares: 250,
      });

      const result = calculateDividendYield(inputs);

      const expectedAnnualIncome = 40 * 250; // 10,000
      const expectedQuarterlyIncome = expectedAnnualIncome / 4; // 2,500

      expectCloseTo(result.annualDividendIncome, expectedAnnualIncome, 2);
      expectCloseTo(result.quarterlyDividendIncome, expectedQuarterlyIncome, 2);
    });

    test('should calculate monthly dividend income correctly', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1200,
        annualDividend: 60,
        numberOfShares: 150,
      });

      const result = calculateDividendYield(inputs);

      const expectedAnnualIncome = 60 * 150; // 9,000
      const expectedMonthlyIncome = expectedAnnualIncome / 12; // 750

      expectCloseTo(result.annualDividendIncome, expectedAnnualIncome, 2);
      expectCloseTo(result.monthlyDividendIncome, expectedMonthlyIncome, 2);
    });

    test('should verify income distribution relationships', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1500,
        annualDividend: 75,
        numberOfShares: 200,
      });

      const result = calculateDividendYield(inputs);

      // Verify mathematical relationships
      expectCloseTo(result.quarterlyDividendIncome * 4, result.annualDividendIncome, 2);
      expectCloseTo(result.monthlyDividendIncome * 12, result.annualDividendIncome, 2);
      expectCloseTo(result.quarterlyDividendIncome, result.monthlyDividendIncome * 3, 2);
    });
  });

  describe('💰 Investment and Yield Tests', () => {
    
    test('should calculate total investment correctly', () => {
      const testCases = [
        { stockPrice: 500, numberOfShares: 100, expectedInvestment: 50000 },
        { stockPrice: 1000, numberOfShares: 50, expectedInvestment: 50000 },
        { stockPrice: 2000, numberOfShares: 25, expectedInvestment: 50000 },
        { stockPrice: 250, numberOfShares: 400, expectedInvestment: 100000 },
      ];

      testCases.forEach(({ stockPrice, numberOfShares, expectedInvestment }) => {
        const inputs = createDividendYieldInputs({ 
          stockPrice,
          annualDividend: 50,
          numberOfShares 
        });
        const result = calculateDividendYield(inputs);
        
        expectCloseTo(result.totalInvestment, expectedInvestment, 2);
      });
    });

    test('should calculate high dividend yields correctly', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 100, // Low stock price
        annualDividend: 20, // High dividend
        numberOfShares: 500,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 20, 2); // (20/100) * 100 = 20%
      expectCloseTo(result.annualDividendIncome, 10000, 2); // 20 * 500
      expectCloseTo(result.totalInvestment, 50000, 2); // 100 * 500
    });

    test('should calculate low dividend yields correctly', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 5000, // High stock price
        annualDividend: 25, // Low dividend
        numberOfShares: 20,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 0.5, 2); // (25/5000) * 100 = 0.5%
      expectCloseTo(result.annualDividendIncome, 500, 2); // 25 * 20
      expectCloseTo(result.totalInvestment, 100000, 2); // 5000 * 20
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero stock price', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 0,
        annualDividend: 50,
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      expect(result.dividendYield).toBe(0); // Should handle division by zero
      expectCloseTo(result.annualDividendIncome, 5000, 2);
      expect(result.totalInvestment).toBe(0);
    });

    test('should handle zero annual dividend', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 0,
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      expect(result.dividendYield).toBe(0);
      expect(result.annualDividendIncome).toBe(0);
      expect(result.quarterlyDividendIncome).toBe(0);
      expect(result.monthlyDividendIncome).toBe(0);
      expectCloseTo(result.totalInvestment, 100000, 2);
    });

    test('should handle zero number of shares', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 50,
        numberOfShares: 0,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 5, 2); // Yield calculation independent of shares
      expect(result.annualDividendIncome).toBe(0);
      expect(result.quarterlyDividendIncome).toBe(0);
      expect(result.monthlyDividendIncome).toBe(0);
      expect(result.totalInvestment).toBe(0);
    });

    test('should handle very high stock prices', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 100000, // Very high stock price
        annualDividend: 1000,
        numberOfShares: 10,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 1, 2); // (1000/100000) * 100
      expectCloseTo(result.annualDividendIncome, 10000, 2);
      expectCloseTo(result.totalInvestment, 1000000, 2);
    });

    test('should handle very high dividends', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 500, // Very high dividend (50% yield)
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 50, 2); // (500/1000) * 100
      expectCloseTo(result.annualDividendIncome, 50000, 2);
      expectCloseTo(result.totalInvestment, 100000, 2);
    });

    test('should handle very large number of shares', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 100,
        annualDividend: 5,
        numberOfShares: 100000, // Very large number
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 5, 2);
      expectCloseTo(result.annualDividendIncome, 500000, 2);
      expectCloseTo(result.totalInvestment, 10000000, 2);
    });

    test('should handle fractional stock prices', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1234.56,
        annualDividend: 67.89,
        numberOfShares: 123,
      });

      const result = calculateDividendYield(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.dividendYield)).toBe(true);
      expect(Number.isFinite(result.annualDividendIncome)).toBe(true);
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
    });

    test('should handle fractional dividends', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 37.5, // Fractional dividend
        numberOfShares: 80,
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 3.75, 2); // (37.5/1000) * 100
      expectCloseTo(result.annualDividendIncome, 3000, 2); // 37.5 * 80
    });

    test('should handle fractional number of shares', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 50,
        numberOfShares: 150.5, // Fractional shares
      });

      const result = calculateDividendYield(inputs);

      expectCloseTo(result.dividendYield, 5, 2);
      expectCloseTo(result.annualDividendIncome, 7525, 2); // 50 * 150.5
      expectCloseTo(result.totalInvestment, 150500, 2); // 1000 * 150.5
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid stock price inputs', () => {
      const testCases = [
        { stockPrice: null },
        { stockPrice: undefined },
        { stockPrice: '' },
        { stockPrice: 'invalid' },
        { stockPrice: -1000 }, // Negative price
      ];

      testCases.forEach(({ stockPrice }) => {
        const inputs = createDividendYieldInputs({ stockPrice: stockPrice as any });
        const result = calculateDividendYield(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.dividendYield).toBe('number');
        expect(typeof result.totalInvestment).toBe('number');
        expect(isFinite(result.dividendYield)).toBe(true);
        expect(isFinite(result.totalInvestment)).toBe(true);
      });
    });

    test('should handle invalid annual dividend inputs', () => {
      const testCases = [
        { annualDividend: null },
        { annualDividend: undefined },
        { annualDividend: '' },
        { annualDividend: 'invalid' },
        { annualDividend: -50 }, // Negative dividend
      ];

      testCases.forEach(({ annualDividend }) => {
        const inputs = createDividendYieldInputs({ annualDividend: annualDividend as any });
        const result = calculateDividendYield(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.annualDividendIncome).toBe('number');
        expect(isFinite(result.annualDividendIncome)).toBe(true);
      });
    });

    test('should handle invalid number of shares inputs', () => {
      const testCases = [
        { numberOfShares: null },
        { numberOfShares: undefined },
        { numberOfShares: '' },
        { numberOfShares: 'invalid' },
        { numberOfShares: -100 }, // Negative shares
      ];

      testCases.forEach(({ numberOfShares }) => {
        const inputs = createDividendYieldInputs({ numberOfShares: numberOfShares as any });
        const result = calculateDividendYield(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.annualDividendIncome).toBe('number');
        expect(isFinite(result.annualDividendIncome)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: '₹1,000' as any,
        annualDividend: '₹50' as any,
        numberOfShares: '100 shares' as any,
      });

      const result = calculateDividendYield(inputs);

      expect(result).toBeDefined();
      expect(result.dividendYield).toBeGreaterThan(0);
      expect(result.annualDividendIncome).toBeGreaterThan(0);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1000.123456789,
        annualDividend: 50.987654321,
        numberOfShares: 100.555555555,
      });

      const result = calculateDividendYield(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.dividendYield)).toBe(true);
      expect(Number.isFinite(result.annualDividendIncome)).toBe(true);
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1e6, // Very large stock price
        annualDividend: 1e4,
        numberOfShares: 1e6,
      });

      const result = calculateDividendYield(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.dividendYield)).toBe(true);
      expect(isFinite(result.annualDividendIncome)).toBe(true);
      expect(isFinite(result.totalInvestment)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify dividend yield formula accuracy', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 2000,
        annualDividend: 80,
        numberOfShares: 50,
      });

      const result = calculateDividendYield(inputs);

      // Manual calculation: (dividend / price) * 100
      const expectedYield = (80 / 2000) * 100; // 4%
      expectCloseTo(result.dividendYield, expectedYield, 2);
    });

    test('should verify annual dividend income calculation', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1500,
        annualDividend: 75,
        numberOfShares: 200,
      });

      const result = calculateDividendYield(inputs);

      // Manual calculation: dividend per share * number of shares
      const expectedIncome = 75 * 200; // 15,000
      expectCloseTo(result.annualDividendIncome, expectedIncome, 2);
    });

    test('should verify total investment calculation', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 800,
        annualDividend: 40,
        numberOfShares: 125,
      });

      const result = calculateDividendYield(inputs);

      // Manual calculation: stock price * number of shares
      const expectedInvestment = 800 * 125; // 100,000
      expectCloseTo(result.totalInvestment, expectedInvestment, 2);
    });

    test('should verify quarterly and monthly income calculations', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1200,
        annualDividend: 60,
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      const expectedAnnualIncome = 60 * 100; // 6,000
      const expectedQuarterlyIncome = expectedAnnualIncome / 4; // 1,500
      const expectedMonthlyIncome = expectedAnnualIncome / 12; // 500

      expectCloseTo(result.annualDividendIncome, expectedAnnualIncome, 2);
      expectCloseTo(result.quarterlyDividendIncome, expectedQuarterlyIncome, 2);
      expectCloseTo(result.monthlyDividendIncome, expectedMonthlyIncome, 2);
    });

    test('should verify mathematical consistency', () => {
      const testCases = [
        { stockPrice: 500, annualDividend: 25, numberOfShares: 200 },
        { stockPrice: 1500, annualDividend: 90, numberOfShares: 50 },
        { stockPrice: 3000, annualDividend: 150, numberOfShares: 100 },
      ];

      testCases.forEach(({ stockPrice, annualDividend, numberOfShares }) => {
        const inputs = createDividendYieldInputs({ stockPrice, annualDividend, numberOfShares });
        const result = calculateDividendYield(inputs);
        
        // Basic consistency checks
        const expectedYield = (annualDividend / stockPrice) * 100;
        const expectedIncome = annualDividend * numberOfShares;
        const expectedInvestment = stockPrice * numberOfShares;
        
        expectCloseTo(result.dividendYield, expectedYield, 2);
        expectCloseTo(result.annualDividendIncome, expectedIncome, 2);
        expectCloseTo(result.totalInvestment, expectedInvestment, 2);
        
        // Income distribution checks
        expectCloseTo(result.quarterlyDividendIncome * 4, result.annualDividendIncome, 0);
        expectCloseTo(result.monthlyDividendIncome * 12, result.annualDividendIncome, 0);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        stockPrice: 100 + i * 10,
        annualDividend: 5 + i * 0.5,
        numberOfShares: 50 + i * 5,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateDividendYield(inputs);
        expect(result).toBeDefined();
        expect(result.dividendYield).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large portfolio calculations efficiently', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 10000, // High-priced stock
        annualDividend: 500,
        numberOfShares: 100000, // Large portfolio
      });

      const startTime = Date.now();
      const result = calculateDividendYield(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.totalInvestment).toBe(1000000000); // 100 crores
      expect(result.annualDividendIncome).toBe(50000000); // 5 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createDividendYieldInputs({
        stockPrice: 1000,
        annualDividend: 50,
        numberOfShares: 100,
      });

      const result = calculateDividendYield(inputs);

      // These values should remain consistent across code changes
      expectCloseTo(result.dividendYield, 5, 2);
      expectCloseTo(result.annualDividendIncome, 5000, 2);
      expectCloseTo(result.quarterlyDividendIncome, 1250, 2);
      expectCloseTo(result.monthlyDividendIncome, 416.67, 2);
      expectCloseTo(result.totalInvestment, 100000, 2);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { stockPrice: 0, annualDividend: 50, numberOfShares: 100 },
        { stockPrice: 1000, annualDividend: 0, numberOfShares: 100 },
        { stockPrice: 1000, annualDividend: 50, numberOfShares: 0 },
        { stockPrice: 10000, annualDividend: 1000, numberOfShares: 10000 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateDividendYield(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.dividendYield).toBe('number');
        expect(typeof result.annualDividendIncome).toBe('number');
        expect(typeof result.quarterlyDividendIncome).toBe('number');
        expect(typeof result.monthlyDividendIncome).toBe('number');
        expect(typeof result.totalInvestment).toBe('number');
        
        expect(isFinite(result.dividendYield)).toBe(true);
        expect(isFinite(result.annualDividendIncome)).toBe(true);
        expect(isFinite(result.quarterlyDividendIncome)).toBe(true);
        expect(isFinite(result.monthlyDividendIncome)).toBe(true);
        expect(isFinite(result.totalInvestment)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createDividendYieldInputs({
        stockPrice: 1500,
        annualDividend: 90,
        numberOfShares: 150,
      });

      const result = calculateDividendYield(inputs);

      // Mathematical relationships that should always hold
      expect(result.dividendYield).toBe((inputs.annualDividend / inputs.stockPrice) * 100);
      expect(result.annualDividendIncome).toBe(inputs.annualDividend * inputs.numberOfShares);
      expect(result.totalInvestment).toBe(inputs.stockPrice * inputs.numberOfShares);
      
      // Income distribution relationships
      expectCloseTo(result.quarterlyDividendIncome * 4, result.annualDividendIncome, 2);
      expectCloseTo(result.monthlyDividendIncome * 12, result.annualDividendIncome, 2);
      expectCloseTo(result.quarterlyDividendIncome, result.monthlyDividendIncome * 3, 2);
      
      // Logical relationships
      expect(result.dividendYield).toBeGreaterThanOrEqual(0);
      expect(result.annualDividendIncome).toBeGreaterThanOrEqual(0);
      expect(result.quarterlyDividendIncome).toBeGreaterThanOrEqual(0);
      expect(result.monthlyDividendIncome).toBeGreaterThanOrEqual(0);
      expect(result.totalInvestment).toBeGreaterThanOrEqual(0);
    });
  });
});