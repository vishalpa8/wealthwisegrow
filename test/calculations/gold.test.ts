/**
 * Comprehensive Test Suite for Gold Investment Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: LOW - Gold investment returns and appreciation calculations
 */

import { calculateGoldInvestment } from '../../src/lib/calculations/savings';
import type { GoldInputs, GoldResults } from '../../src/lib/calculations/savings';

describe('Gold Investment Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create gold investment inputs
  const createGoldInputs = (overrides: Partial<GoldInputs> = {}): GoldInputs => ({
    investmentAmount: 100000,
    currentGoldPrice: 5000,
    expectedAppreciation: 8,
    years: 10,
    ...overrides,
  });

  // Helper function for precise decimal comparison with more tolerance
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    // For larger numbers, use a more practical tolerance
    if (Math.abs(expected) > 10000) {
      expect(actual).toBeCloseTo(expected, Math.max(0, precision - 2));
    } else {
      expect(actual).toBeCloseTo(expected, precision);
    }
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate gold investment correctly', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.investmentAmount).toBe(100000);
      expectCloseTo(result.goldQuantity, 20, 2); // 100000 / 5000
      expect(result.maturityAmount).toBeGreaterThan(100000);
      expect(result.totalGains).toBeGreaterThan(0);
      expect(result.totalGains).toBe(result.maturityAmount - result.investmentAmount);
      expect(result.yearlyBreakdown).toHaveLength(10);
      
      // With 8% appreciation for 10 years: 100000 * (1.08)^10 ≈ 215,892
      expectCloseTo(result.maturityAmount, 215892, 1000);
    });

    test('should calculate gold investment with different investment amounts', () => {
      const testCases = [
        { investmentAmount: 50000, expectedQuantity: 10, expectedMaturity: 107946 },
        { investmentAmount: 200000, expectedQuantity: 40, expectedMaturity: 431785 },
        { investmentAmount: 500000, expectedQuantity: 100, expectedMaturity: 1079462 },
      ];

      testCases.forEach(({ investmentAmount, expectedQuantity, expectedMaturity }) => {
        const inputs = createGoldInputs({ 
          investmentAmount,
          currentGoldPrice: 5000,
          expectedAppreciation: 8,
          years: 10 
        });
        const result = calculateGoldInvestment(inputs);
        
        expectCloseTo(result.goldQuantity, expectedQuantity, 2);
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.investmentAmount).toBe(investmentAmount);
      });
    });

    test('should calculate gold investment with different gold prices', () => {
      const testCases = [
        { goldPrice: 4000, expectedQuantity: 25, expectedMaturity: 215892 },
        { goldPrice: 5000, expectedQuantity: 20, expectedMaturity: 215892 },
        { goldPrice: 6000, expectedQuantity: 16.67, expectedMaturity: 215892 },
        { goldPrice: 8000, expectedQuantity: 12.5, expectedMaturity: 215892 },
      ];

      testCases.forEach(({ goldPrice, expectedQuantity, expectedMaturity }) => {
        const inputs = createGoldInputs({ 
          investmentAmount: 100000,
          currentGoldPrice: goldPrice,
          expectedAppreciation: 8,
          years: 10 
        });
        const result = calculateGoldInvestment(inputs);
        
        expectCloseTo(result.goldQuantity, expectedQuantity, 2);
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000); // Maturity should be same regardless of entry price
      });
    });

    test('should calculate gold investment with different appreciation rates', () => {
      const testCases = [
        { appreciation: 5, expectedMaturity: 162889 },
        { appreciation: 8, expectedMaturity: 215892 },
        { appreciation: 10, expectedMaturity: 259374 },
        { appreciation: 12, expectedMaturity: 310585 },
      ];

      testCases.forEach(({ appreciation, expectedMaturity }) => {
        const inputs = createGoldInputs({ 
          investmentAmount: 100000,
          currentGoldPrice: 5000,
          expectedAppreciation: appreciation,
          years: 10 
        });
        const result = calculateGoldInvestment(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.goldQuantity).toBe(20); // Should remain constant
      });
    });

    test('should calculate gold investment with different time periods', () => {
      const testCases = [
        { years: 1, expectedMaturity: 108000 },
        { years: 5, expectedMaturity: 146933 },
        { years: 10, expectedMaturity: 215892 },
        { years: 15, expectedMaturity: 317217 },
        { years: 20, expectedMaturity: 466096 },
      ];

      testCases.forEach(({ years, expectedMaturity }) => {
        const inputs = createGoldInputs({ 
          investmentAmount: 100000,
          currentGoldPrice: 5000,
          expectedAppreciation: 8,
          years 
        });
        const result = calculateGoldInvestment(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.yearlyBreakdown).toHaveLength(years);
      });
    });
  });

  describe('🥇 Gold Quantity and Price Tests', () => {
    
    test('should calculate gold quantity correctly', () => {
      const testCases = [
        { investment: 50000, price: 2500, expectedQuantity: 20 },
        { investment: 100000, price: 4000, expectedQuantity: 25 },
        { investment: 150000, price: 6000, expectedQuantity: 25 },
        { investment: 200000, price: 8000, expectedQuantity: 25 },
      ];

      testCases.forEach(({ investment, price, expectedQuantity }) => {
        const inputs = createGoldInputs({ 
          investmentAmount: investment,
          currentGoldPrice: price,
          expectedAppreciation: 8,
          years: 10 
        });
        const result = calculateGoldInvestment(inputs);
        
        expectCloseTo(result.goldQuantity, expectedQuantity, 2);
      });
    });

    test('should handle fractional gold quantities', () => {
      const inputs = createGoldInputs({
        investmentAmount: 123456,
        currentGoldPrice: 5432,
        expectedAppreciation: 7,
        years: 8,
      });

      const result = calculateGoldInvestment(inputs);

      const expectedQuantity = 123456 / 5432;
      expectCloseTo(result.goldQuantity, expectedQuantity, 4);
      expect(result.goldQuantity).toBeGreaterThan(0);
    });

    test('should calculate future gold price correctly', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 10,
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      // Future gold price should be current price * (1 + appreciation)^years
      const expectedFuturePrice = 5000 * Math.pow(1.10, 5); // ≈ 8052.55
      
      // Verify through maturity calculation
      const expectedMaturity = result.goldQuantity * expectedFuturePrice;
      expectCloseTo(result.maturityAmount, expectedMaturity, 1);
    });
  });

  describe('📊 Yearly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate yearly breakdown', () => {
      const inputs = createGoldInputs({
        investmentAmount: 50000,
        currentGoldPrice: 2500,
        expectedAppreciation: 6,
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5);

      // Check first year
      const year1 = result.yearlyBreakdown[0];
      expect(year1.year).toBe(1);
      expectCloseTo(year1.goldPrice, 2650, 10); // 2500 * 1.06
      expectCloseTo(year1.value, 53000, 100); // 20 grams * 2650

      // Check that gold prices increase over time
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expect(result.yearlyBreakdown[i].goldPrice).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].goldPrice
        );
        expect(result.yearlyBreakdown[i].value).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].value
        );
      }

      // Final year should match overall results
      const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(finalYear.value, result.maturityAmount, 2);
    });

    test('should calculate compound appreciation correctly each year', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 4000,
        expectedAppreciation: 12,
        years: 3,
      });

      const result = calculateGoldInvestment(inputs);

      // Manual verification of compound appreciation
      let expectedPrice = 4000;
      result.yearlyBreakdown.forEach((year, index) => {
        expectedPrice = expectedPrice * 1.12;
        expectCloseTo(year.goldPrice, expectedPrice, 1);
        expectCloseTo(year.value, result.goldQuantity * expectedPrice, 1);
        expect(year.year).toBe(index + 1);
      });
    });

    test('should handle zero appreciation in yearly breakdown', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 0,
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      // With 0% appreciation, gold price should remain constant
      result.yearlyBreakdown.forEach(year => {
        expect(year.goldPrice).toBe(5000);
        expectCloseTo(year.value, 100000, 2); // Should remain at investment amount
      });
    });

    test('should calculate gains correctly in yearly breakdown', () => {
      const inputs = createGoldInputs({
        investmentAmount: 75000,
        currentGoldPrice: 3000,
        expectedAppreciation: 9,
        years: 4,
      });

      const result = calculateGoldInvestment(inputs);

      result.yearlyBreakdown.forEach(year => {
        // Gains should always equal value minus investment amount
        const expectedGains = year.value - inputs.investmentAmount;
        expectCloseTo(year.gains, expectedGains, 2);
        expect(year.gains).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero investment amount', () => {
      const inputs = createGoldInputs({
        investmentAmount: 0,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.investmentAmount).toBe(0);
      expect(result.goldQuantity).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalGains).toBe(0);
      expect(result.yearlyBreakdown).toHaveLength(10);
      
      // All yearly values should be zero
      result.yearlyBreakdown.forEach(year => {
        expect(year.goldPrice).toBeGreaterThan(0); // Price still appreciates
        expect(year.value).toBe(0);
        expect(year.gains).toBe(0);
      });
    });

    test('should handle zero gold price', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 0,
        expectedAppreciation: 8,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.investmentAmount).toBe(100000);
      expect(result.goldQuantity).toBe(0); // Cannot buy gold at zero price
      expect(result.maturityAmount).toBe(0);
      expect(result.totalGains).toBe(-100000); // Loss of entire investment
    });

    test('should handle zero appreciation rate', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 0,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.investmentAmount).toBe(100000);
      expectCloseTo(result.goldQuantity, 20, 2);
      expectCloseTo(result.maturityAmount, 100000, 2); // No appreciation
      expectCloseTo(result.totalGains, 0, 2);
    });

    test('should handle negative appreciation rate', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: -5, // 5% depreciation
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.maturityAmount).toBeLessThan(result.investmentAmount);
      expect(result.totalGains).toBeLessThan(0); // Should be negative (loss)
    });

    test('should handle very high appreciation rates', () => {
      const inputs = createGoldInputs({
        investmentAmount: 50000,
        currentGoldPrice: 2500,
        expectedAppreciation: 25, // 25% appreciation
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.maturityAmount).toBeGreaterThan(150000); // Should be over 3x
      expect(result.totalGains).toBeGreaterThan(100000);
    });

    test('should handle very short periods', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years: 1,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(1);
      expectCloseTo(result.maturityAmount, 108000, 100); // 100000 * 1.08
      expectCloseTo(result.totalGains, 8000, 100);
    });

    test('should handle very long periods', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 6,
        years: 50, // 50 years
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.yearlyBreakdown).toHaveLength(50);
      expect(result.maturityAmount).toBeGreaterThan(1500000); // Should be over 15x
      expect(result.totalGains).toBeGreaterThan(1400000);
    });

    test('should handle very high gold prices', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 50000, // Very expensive gold
        expectedAppreciation: 8,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      expectCloseTo(result.goldQuantity, 2, 2); // Can only buy 2 grams
      expect(result.maturityAmount).toBeGreaterThan(100000);
    });

    test('should handle fractional inputs', () => {
      const inputs = createGoldInputs({
        investmentAmount: 123456.78,
        currentGoldPrice: 5432.10,
        expectedAppreciation: 7.25,
        years: 8.5,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.goldQuantity)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle zero years', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years: 0,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result.investmentAmount).toBe(100000);
      expectCloseTo(result.goldQuantity, 20, 2);
      expectCloseTo(result.maturityAmount, 100000, 2); // No time for appreciation
      expectCloseTo(result.totalGains, 0, 2);
      expect(result.yearlyBreakdown).toHaveLength(0);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid investment amount inputs', () => {
      const testCases = [
        { investmentAmount: null },
        { investmentAmount: undefined },
        { investmentAmount: '' },
        { investmentAmount: 'invalid' },
        { investmentAmount: -100000 }, // Negative investment
      ];

      testCases.forEach(({ investmentAmount }) => {
        const inputs = createGoldInputs({ investmentAmount: investmentAmount as any });
        const result = calculateGoldInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.investmentAmount).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.investmentAmount)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid gold price inputs', () => {
      const testCases = [
        { currentGoldPrice: null },
        { currentGoldPrice: undefined },
        { currentGoldPrice: '' },
        { currentGoldPrice: 'invalid' },
        { currentGoldPrice: -5000 }, // Negative price
      ];

      testCases.forEach(({ currentGoldPrice }) => {
        const inputs = createGoldInputs({ currentGoldPrice: currentGoldPrice as any });
        const result = calculateGoldInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.goldQuantity).toBe('number');
        expect(isFinite(result.goldQuantity)).toBe(true);
      });
    });

    test('should handle invalid appreciation rate inputs', () => {
      const testCases = [
        { expectedAppreciation: null },
        { expectedAppreciation: undefined },
        { expectedAppreciation: '' },
        { expectedAppreciation: 'invalid' },
      ];

      testCases.forEach(({ expectedAppreciation }) => {
        const inputs = createGoldInputs({ expectedAppreciation: expectedAppreciation as any });
        const result = calculateGoldInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid years inputs', () => {
      const testCases = [
        { years: null },
        { years: undefined },
        { years: '' },
        { years: 'invalid' },
        { years: -10 }, // Negative years
      ];

      testCases.forEach(({ years }) => {
        const inputs = createGoldInputs({ years: years as any });
        const result = calculateGoldInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createGoldInputs({
        investmentAmount: '₹1,00,000' as any,
        currentGoldPrice: '₹5,000' as any,
        expectedAppreciation: '8%' as any,
        years: '10 years' as any,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result).toBeDefined();
      expect(result.investmentAmount).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.investmentAmount);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000.123456789,
        currentGoldPrice: 5000.987654321,
        expectedAppreciation: 8.123456789,
        years: 10.987654321,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.investmentAmount)).toBe(true);
      expect(Number.isFinite(result.goldQuantity)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createGoldInputs({
        investmentAmount: 1e10, // Very large investment
        currentGoldPrice: 1e5,
        expectedAppreciation: 8,
        years: 20,
      });

      const result = calculateGoldInvestment(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.investmentAmount)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify compound appreciation formula accuracy', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 4000,
        expectedAppreciation: 10,
        years: 5,
      });

      const result = calculateGoldInvestment(inputs);

      // Manual calculation using compound interest formula
      const expectedMaturity = 100000 * Math.pow(1.10, 5); // 161,051
      
      expectCloseTo(result.maturityAmount, expectedMaturity, 2);
      expectCloseTo(result.totalGains, expectedMaturity - 100000, 2);
    });

    test('should verify gold quantity calculation', () => {
      const inputs = createGoldInputs({
        investmentAmount: 250000,
        currentGoldPrice: 6250,
        expectedAppreciation: 7,
        years: 8,
      });

      const result = calculateGoldInvestment(inputs);

      // Gold quantity should equal investment amount / current gold price
      const expectedQuantity = 250000 / 6250; // 40 grams
      expectCloseTo(result.goldQuantity, expectedQuantity, 4);
    });

    test('should verify yearly breakdown calculations', () => {
      const inputs = createGoldInputs({
        investmentAmount: 80000,
        currentGoldPrice: 4000,
        expectedAppreciation: 6,
        years: 4,
      });

      const result = calculateGoldInvestment(inputs);

      // Manual verification of each year
      let expectedPrice = 4000;
      result.yearlyBreakdown.forEach((year, index) => {
        expectedPrice = expectedPrice * 1.06;
        expectCloseTo(year.goldPrice, expectedPrice, 1);
        expectCloseTo(year.value, result.goldQuantity * expectedPrice, 1);
        expectCloseTo(year.gains, year.value - 80000, 1);
        expect(year.year).toBe(index + 1);
      });
    });

    test('should verify total gains calculation', () => {
      const inputs = createGoldInputs({
        investmentAmount: 150000,
        currentGoldPrice: 5000,
        expectedAppreciation: 9,
        years: 12,
      });

      const result = calculateGoldInvestment(inputs);

      // Total gains should equal maturity amount minus investment amount
      const expectedGains = result.maturityAmount - result.investmentAmount;
      expectCloseTo(result.totalGains, expectedGains, 2);
    });

    test('should verify mathematical consistency', () => {
      const testCases = [
        { investment: 50000, price: 2500, appreciation: 5, years: 3 },
        { investment: 200000, price: 8000, appreciation: 12, years: 7 },
        { investment: 300000, price: 6000, appreciation: 8, years: 15 },
      ];

      testCases.forEach(({ investment, price, appreciation, years }) => {
        const inputs = createGoldInputs({ 
          investmentAmount: investment,
          currentGoldPrice: price,
          expectedAppreciation: appreciation,
          years 
        });
        const result = calculateGoldInvestment(inputs);
        
        // Basic consistency checks
        expect(result.investmentAmount).toBe(investment);
        expectCloseTo(result.goldQuantity, investment / price, 4);
        expect(result.maturityAmount).toBeGreaterThanOrEqual(result.investmentAmount);
        expectCloseTo(result.totalGains, result.maturityAmount - result.investmentAmount, 2);
        expect(result.yearlyBreakdown).toHaveLength(years);
        
        // Verify compound growth
        const expectedMaturity = investment * Math.pow(1 + appreciation/100, years);
        expectCloseTo(result.maturityAmount, expectedMaturity, 1);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long investment periods efficiently', () => {
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 6,
        years: 100, // 100 years
      });

      const startTime = Date.now();
      const result = calculateGoldInvestment(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.yearlyBreakdown).toHaveLength(100);
      expect(result.maturityAmount).toBeGreaterThan(30000000); // Should be over 3 crores
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        investmentAmount: 50000 + i * 1000,
        currentGoldPrice: 3000 + i * 10,
        expectedAppreciation: 5 + i % 10,
        years: 5 + i % 15,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateGoldInvestment(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large investment calculations efficiently', () => {
      const inputs = createGoldInputs({
        investmentAmount: 1000000000, // 100 crores
        currentGoldPrice: 10000,
        expectedAppreciation: 8,
        years: 20,
      });

      const startTime = Date.now();
      const result = calculateGoldInvestment(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(result.maturityAmount).toBeGreaterThan(4000000000); // Should be over 400 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createGoldInputs({
        investmentAmount: 100000,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years: 10,
      });

      const result = calculateGoldInvestment(inputs);

      // These values should remain consistent across code changes
      expect(result.investmentAmount).toBe(100000);
      expectCloseTo(result.goldQuantity, 20, 2);
      expectCloseTo(result.maturityAmount, 215892, 1000);
      expectCloseTo(result.totalGains, 115892, 1000);
      expect(result.yearlyBreakdown).toHaveLength(10);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { investmentAmount: 0, currentGoldPrice: 5000, expectedAppreciation: 8, years: 10 },
        { investmentAmount: 100000, currentGoldPrice: 0, expectedAppreciation: 8, years: 10 },
        { investmentAmount: 100000, currentGoldPrice: 5000, expectedAppreciation: 0, years: 10 },
        { investmentAmount: 100000, currentGoldPrice: 5000, expectedAppreciation: -5, years: 5 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateGoldInvestment(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.investmentAmount).toBe('number');
        expect(typeof result.goldQuantity).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalGains).toBe('number');
        expect(Array.isArray(result.yearlyBreakdown)).toBe(true);
        
        expect(isFinite(result.investmentAmount)).toBe(true);
        expect(isFinite(result.goldQuantity)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalGains)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createGoldInputs({
        investmentAmount: 200000,
        currentGoldPrice: 4000,
        expectedAppreciation: 7,
        years: 12,
      });

      const result = calculateGoldInvestment(inputs);

      // Mathematical relationships that should always hold
      expect(result.goldQuantity).toBe(result.investmentAmount / inputs.currentGoldPrice);
      expect(result.totalGains).toBe(result.maturityAmount - result.investmentAmount);
      
      // Yearly breakdown should be consistent
      if (result.yearlyBreakdown.length > 0) {
        const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
        expectCloseTo(finalYear.value, result.maturityAmount, 2);
        expectCloseTo(finalYear.gains, result.totalGains, 2);
      }
      
      // Each year should have consistent calculations
      result.yearlyBreakdown.forEach((year, index) => {
        expect(year.year).toBe(index + 1);
        expect(year.goldPrice).toBeGreaterThan(0);
        expectCloseTo(year.value, result.goldQuantity * year.goldPrice, 2);
        expectCloseTo(year.gains, year.value - result.investmentAmount, 2);
      });
      
      // Verify compound growth pattern
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        const prevYear = result.yearlyBreakdown[i - 1];
        const currentYear = result.yearlyBreakdown[i];
        
        // Current gold price should be previous price * (1 + appreciation rate)
        const expectedPrice = prevYear.goldPrice * (1 + inputs.expectedAppreciation / 100);
        expectCloseTo(currentYear.goldPrice, expectedPrice, 1);
      }
    });
  });
});