/**
 * Comprehensive Test Suite for Income Tax Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: HIGH - Complex tax calculations with multiple regimes and brackets
 */

import { calculateIncomeTax } from '../../src/lib/calculations/tax';
import type { IncomeTaxInputs, IncomeTaxResults } from '../../src/lib/calculations/tax';

describe('Income Tax Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create income tax inputs
  const createIncomeTaxInputs = (overrides: Partial<IncomeTaxInputs> = {}): IncomeTaxInputs => ({
    annualIncome: 1000000,
    age: 30,
    deductions: 150000,
    regime: 'new',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate tax for new regime correctly', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1000000,
        age: 30,
        deductions: 100000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(1000000);
      expect(result.taxableIncome).toBe(825000); // 1000000 - 100000 - 75000 (standard deduction)
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.cess).toBe(result.incomeTax * 0.04);
      expect(result.totalTax).toBe(result.incomeTax + result.cess);
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax);
      expect(result.taxBrackets).toHaveLength(3); // Should have 3 tax brackets for this income
    });

    test('should calculate tax for old regime correctly', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1000000,
        age: 30,
        deductions: 100000,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(1000000);
      expect(result.taxableIncome).toBe(850000); // 1000000 - 100000 - 50000 (standard deduction)
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.cess).toBe(result.incomeTax * 0.04);
      expect(result.totalTax).toBe(result.incomeTax + result.cess);
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax);
      expect(result.taxBrackets.length).toBeGreaterThan(0);
    });

    test('should calculate tax for different income levels', () => {
      const testCases = [
        { annualIncome: 500000, expectedTaxRange: [0, 10000] },
        { annualIncome: 1000000, expectedTaxRange: [10000, 60000] },
        { annualIncome: 2000000, expectedTaxRange: [150000, 300000] },
        { annualIncome: 5000000, expectedTaxRange: [800000, 1300000] },
      ];

      testCases.forEach(({ annualIncome, expectedTaxRange }) => {
        const inputs = createIncomeTaxInputs({ 
          annualIncome,
          age: 30,
          deductions: 50000,
          regime: 'new' 
        });
        const result = calculateIncomeTax(inputs);
        
        expect(result.totalTax).toBeGreaterThanOrEqual(expectedTaxRange[0]);
        expect(result.totalTax).toBeLessThanOrEqual(expectedTaxRange[1]);
      });
    });

    test('should handle different age groups correctly', () => {
      const testCases = [
        { age: 25, regime: 'old' as const, expectedExemption: 250000 },
        { age: 65, regime: 'old' as const, expectedExemption: 300000 },
        { age: 85, regime: 'old' as const, expectedExemption: 500000 },
      ];

      testCases.forEach(({ age, regime, expectedExemption }) => {
        const inputs = createIncomeTaxInputs({ 
          annualIncome: expectedExemption + 100000,
          age,
          deductions: 0,
          regime 
        });
        const result = calculateIncomeTax(inputs);
        
        // Should have some tax for income above exemption limit
        expect(result.incomeTax).toBeGreaterThan(0);
        expect(result.taxableIncome).toBeGreaterThan(0);
      });
    });
  });

  describe('💰 Tax Regime Comparison Tests', () => {
    
    test('should calculate different taxes for old vs new regime', () => {
      const baseInputs = {
        annualIncome: 1500000,
        age: 35,
        deductions: 200000,
      };

      const oldRegimeResult = calculateIncomeTax({ ...baseInputs, regime: 'old' });
      const newRegimeResult = calculateIncomeTax({ ...baseInputs, regime: 'new' });

      // Both should be valid calculations
      expect(oldRegimeResult.totalTax).toBeGreaterThan(0);
      expect(newRegimeResult.totalTax).toBeGreaterThan(0);
      
      // Tax amounts will differ between regimes
      expect(oldRegimeResult.totalTax).not.toBe(newRegimeResult.totalTax);
      
      // Standard deductions should be different
      expect(oldRegimeResult.taxableIncome).not.toBe(newRegimeResult.taxableIncome);
    });

    test('should apply correct standard deductions', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1000000,
        age: 30,
        deductions: 0, // No additional deductions
      });

      const oldRegimeResult = calculateIncomeTax({ ...inputs, regime: 'old' });
      const newRegimeResult = calculateIncomeTax({ ...inputs, regime: 'new' });

      // Old regime: 1000000 - 0 - 50000 = 950000
      expect(oldRegimeResult.taxableIncome).toBe(950000);
      
      // New regime: 1000000 - 0 - 75000 = 925000
      expect(newRegimeResult.taxableIncome).toBe(925000);
    });

    test('should handle high deductions in old regime', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 2000000,
        age: 30,
        deductions: 500000, // High deductions
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.taxableIncome).toBe(1450000); // 2000000 - 500000 - 50000
      expect(result.incomeTax).toBeGreaterThan(0);
    });
  });

  describe('📊 Tax Bracket Accuracy Tests', () => {
    
    test('should generate correct tax brackets for new regime', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1500000,
        age: 30,
        deductions: 100000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      // Should have multiple tax brackets
      expect(result.taxBrackets.length).toBeGreaterThan(1);
      
      // Check that tax brackets are in order and have correct rates
      const expectedRates = [0, 5, 10, 15, 20]; // New regime rates
      result.taxBrackets.forEach((bracket, index) => {
        expect(expectedRates).toContain(bracket.rate);
        expect(bracket.taxableAmount).toBeGreaterThan(0);
        expect(bracket.tax).toBeGreaterThanOrEqual(0);
      });

      // Total tax should equal sum of all bracket taxes
      const totalBracketTax = result.taxBrackets.reduce((sum, bracket) => sum + bracket.tax, 0);
      expectCloseTo(result.incomeTax, totalBracketTax, 2);
    });

    test('should generate correct tax brackets for old regime', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1200000,
        age: 30,
        deductions: 150000,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      // Should have tax brackets
      expect(result.taxBrackets.length).toBeGreaterThan(0);
      
      // Check that tax brackets have correct rates for old regime
      const expectedRates = [0, 5, 20, 30]; // Old regime rates
      result.taxBrackets.forEach(bracket => {
        expect(expectedRates).toContain(bracket.rate);
        expect(bracket.taxableAmount).toBeGreaterThan(0);
        expect(bracket.tax).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle income exactly at bracket boundaries', () => {
      const testCases = [
        { annualIncome: 375000, regime: 'new' as const }, // Exactly at 300k + 75k standard deduction
        { annualIncome: 775000, regime: 'new' as const }, // Exactly at 700k + 75k
        { annualIncome: 300000, regime: 'old' as const }, // Exactly at basic exemption
      ];

      testCases.forEach(({ annualIncome, regime }) => {
        const inputs = createIncomeTaxInputs({ 
          annualIncome,
          age: 30,
          deductions: 0,
          regime 
        });
        const result = calculateIncomeTax(inputs);
        
        expect(result).toBeDefined();
        expect(result.incomeTax).toBeGreaterThanOrEqual(0);
        expect(result.taxBrackets.length).toBeGreaterThan(0);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero income', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 0,
        age: 30,
        deductions: 0,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.cess).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.netIncome).toBe(0);
      expect(result.taxBrackets).toHaveLength(0);
    });

    test('should handle income below exemption limit', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 200000,
        age: 30,
        deductions: 0,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(200000);
      expect(result.taxableIncome).toBe(125000); // 200000 - 75000
      expect(result.incomeTax).toBe(0); // Below 300k exemption
      expect(result.cess).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.netIncome).toBe(200000);
    });

    test('should handle very high income', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 10000000, // 1 crore
        age: 30,
        deductions: 200000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(10000000);
      expect(result.incomeTax).toBeGreaterThan(2000000);
      expect(result.totalTax).toBeGreaterThan(2000000);
      expect(result.netIncome).toBeLessThan(8000000);
      expect(result.taxBrackets.length).toBeGreaterThan(3);
    });

    test('should handle deductions larger than income', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 500000,
        age: 30,
        deductions: 600000, // Deductions > income
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      expect(result.grossIncome).toBe(500000);
      expect(result.taxableIncome).toBe(0); // Should not be negative
      expect(result.incomeTax).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.netIncome).toBe(500000);
    });

    test('should handle senior citizen exemptions', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 400000,
        age: 65, // Senior citizen
        deductions: 0,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      // Senior citizens have higher exemption limit in old regime
      expect(result.taxableIncome).toBe(350000); // 400000 - 0 - 50000
      expect(result.incomeTax).toBe(2500); // (350000 - 300000) * 5% = 2500
    });

    test('should handle super senior citizen exemptions', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 600000,
        age: 85, // Super senior citizen
        deductions: 0,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      // Super senior citizens have highest exemption limit
      expect(result.taxableIncome).toBe(550000); // 600000 - 0 - 50000
      expect(result.incomeTax).toBe(2500); // (550000 - 500000) * 5% = 2500
    });

    test('should handle fractional income amounts', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1234567.89,
        age: 30,
        deductions: 123456.78,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.incomeTax)).toBe(true);
      expect(Number.isFinite(result.totalTax)).toBe(true);
      expect(Number.isFinite(result.netIncome)).toBe(true);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should return error for negative income', () => {
      const inputs = createIncomeTaxInputs({ annualIncome: -100000 });
      const result = calculateIncomeTax(inputs);
      expect(result.error).toBe('Annual income cannot be negative.');
    });

    test('should return error for invalid age', () => {
      const inputs = createIncomeTaxInputs({ age: 15 });
      const result = calculateIncomeTax(inputs);
      expect(result.error).toBe('Please enter a valid age.');
    });

    test('should return error for negative deductions', () => {
      const inputs = createIncomeTaxInputs({ deductions: -50000 });
      const result = calculateIncomeTax(inputs);
      expect(result.error).toBe('Deductions cannot be negative.');
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: '₹10,00,000' as any,
        age: '30 years' as any,
        deductions: '₹1,50,000' as any,
      });

      const result = calculateIncomeTax(inputs);

      expect(result).toBeDefined();
      expect(result.grossIncome).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    test('should handle invalid regime inputs', () => {
      const inputs = createIncomeTaxInputs({
        regime: 'invalid' as any,
      });

      const result = calculateIncomeTax(inputs);

      // The current implementation defaults to 'new' regime, so no error is thrown.
      // This test verifies that it doesn't crash.
      expect(result).toBeDefined();
      expect(typeof result.totalTax).toBe('number');
      expect(isFinite(result.totalTax)).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle very large numbers safely', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1e10, // Very large income
        age: 30,
        deductions: 1e8,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.totalTax)).toBe(true);
      expect(isFinite(result.netIncome)).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify tax calculation accuracy', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1000000,
        age: 30,
        deductions: 100000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      // Manual calculation for new regime
      const taxableIncome = 825000; // 1000000 - 100000 - 75000
      
      // New regime slabs: 0-3L (0%), 3L-7L (5%), 7L-10L (10%), 10L-12L (15%), 12L-15L (20%), 15L+ (30%)
      let expectedTax = 0;
      if (taxableIncome > 300000) expectedTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
      if (taxableIncome > 700000) expectedTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
      
      expectCloseTo(result.incomeTax, expectedTax, 2);
    });

    test('should verify cess calculation', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1500000,
        age: 30,
        deductions: 200000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      // Cess should be 4% of income tax
      const expectedCess = result.incomeTax * 0.04;
      expectCloseTo(result.cess, expectedCess, 2);
    });

    test('should verify total tax calculation', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 2000000,
        age: 30,
        deductions: 300000,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      // Total tax should equal income tax + cess
      const expectedTotalTax = result.incomeTax + result.cess;
      expectCloseTo(result.totalTax, expectedTotalTax, 2);
    });

    test('should verify net income calculation', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1200000,
        age: 30,
        deductions: 150000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      // Net income should equal gross income minus total tax
      const expectedNetIncome = result.grossIncome - result.totalTax;
      expectCloseTo(result.netIncome, expectedNetIncome, 2);
    });

    test('should verify taxable income calculation', () => {
      const testCases = [
        { income: 1000000, deductions: 100000, regime: 'new' as const, expectedTaxable: 825000 },
        { income: 1000000, deductions: 100000, regime: 'old' as const, expectedTaxable: 850000 },
        { income: 500000, deductions: 200000, regime: 'new' as const, expectedTaxable: 225000 },
      ];

      testCases.forEach(({ income, deductions, regime, expectedTaxable }) => {
        const inputs = createIncomeTaxInputs({ 
          annualIncome: income,
          age: 30,
          deductions,
          regime 
        });
        const result = calculateIncomeTax(inputs);
        
        expect(result.taxableIncome).toBe(expectedTaxable);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple tax calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        annualIncome: 500000 + i * 50000,
        age: 25 + i % 60,
        deductions: 50000 + i * 5000,
        regime: i % 2 === 0 ? 'new' as const : 'old' as const,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateIncomeTax(inputs);
        expect(result).toBeDefined();
        expect(result.totalTax).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle very high income calculations efficiently', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 100000000, // 10 crores
        age: 30,
        deductions: 1000000,
        regime: 'new',
      });

      const startTime = Date.now();
      const result = calculateIncomeTax(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(result.totalTax).toBeGreaterThan(20000000);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createIncomeTaxInputs({
        annualIncome: 1500000,
        age: 35,
        deductions: 200000,
        regime: 'new',
      });

      const result = calculateIncomeTax(inputs);

      // These values should remain consistent across code changes
      expect(result.grossIncome).toBe(1500000);
      expect(result.taxableIncome).toBe(1225000); // 1500000 - 200000 - 75000
      expect(result.incomeTax).toBeGreaterThan(70000);
      expect(result.incomeTax).toBeLessThan(100000);
      expect(result.cess).toBe(result.incomeTax * 0.04);
      expect(result.totalTax).toBe(result.incomeTax + result.cess);
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { annualIncome: 0, age: 25, deductions: 0, regime: 'new' as const },
        { annualIncome: 10000000, age: 85, deductions: 500000, regime: 'old' as const },
        { annualIncome: 300000, age: 30, deductions: 400000, regime: 'new' as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateIncomeTax(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.grossIncome).toBe('number');
        expect(typeof result.taxableIncome).toBe('number');
        expect(typeof result.incomeTax).toBe('number');
        expect(typeof result.totalTax).toBe('number');
        expect(typeof result.netIncome).toBe('number');
        expect(Array.isArray(result.taxBrackets)).toBe(true);
        
        expect(isFinite(result.grossIncome)).toBe(true);
        expect(isFinite(result.taxableIncome)).toBe(true);
        expect(isFinite(result.incomeTax)).toBe(true);
        expect(isFinite(result.totalTax)).toBe(true);
        expect(isFinite(result.netIncome)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createIncomeTaxInputs({
        annualIncome: 1800000,
        age: 40,
        deductions: 250000,
        regime: 'old',
      });

      const result = calculateIncomeTax(inputs);

      // Mathematical relationships that should always hold
      expect(result.grossIncome).toBe(inputs.annualIncome);
      expect(result.taxableIncome).toBeLessThanOrEqual(result.grossIncome);
      expect(result.cess).toBe(result.incomeTax * 0.04);
      expect(result.totalTax).toBe(result.incomeTax + result.cess);
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax);
      
      // Tax brackets should sum to total income tax
      if (result.taxBrackets.length > 0) {
        const totalBracketTax = result.taxBrackets.reduce((sum, bracket) => sum + bracket.tax, 0);
        expectCloseTo(result.incomeTax, totalBracketTax, 2);
      }
      
      // All tax amounts should be non-negative
      expect(result.incomeTax).toBeGreaterThanOrEqual(0);
      expect(result.cess).toBeGreaterThanOrEqual(0);
      expect(result.totalTax).toBeGreaterThanOrEqual(0);
    });
  });
});