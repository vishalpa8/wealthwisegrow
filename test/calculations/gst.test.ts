/**
 * Comprehensive Test Suite for GST Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - Tax calculations with inclusive/exclusive modes
 */

import { calculateGST } from '../../src/lib/calculations/tax';
import type { GSTInputs, GSTResults } from '../../src/lib/calculations/tax';

describe('GST Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create GST inputs
  const createGSTInputs = (overrides: Partial<GSTInputs> = {}): GSTInputs => ({
    amount: 10000,
    gstRate: 18,
    type: 'exclusive',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate GST exclusive correctly', () => {
      const inputs = createGSTInputs({
        amount: 10000,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(10000);
      expectCloseTo(result.gstAmount, 1800, 2); // 10000 * 18/100
      expectCloseTo(result.totalAmount, 11800, 2); // 10000 + 1800
      expectCloseTo(result.cgst, 900, 2); // 1800/2
      expectCloseTo(result.sgst, 900, 2); // 1800/2
      expectCloseTo(result.igst, 1800, 2); // Full GST amount
    });

    test('should calculate GST inclusive correctly', () => {
      const inputs = createGSTInputs({
        amount: 11800,
        gstRate: 18,
        type: 'inclusive',
      });

      const result = calculateGST(inputs);

      expectCloseTo(result.totalAmount, 11800, 2);
      expectCloseTo(result.originalAmount, 10000, 2); // 11800 / 1.18
      expectCloseTo(result.gstAmount, 1800, 2); // 11800 - 10000
      expectCloseTo(result.cgst, 900, 2); // 1800/2
      expectCloseTo(result.sgst, 900, 2); // 1800/2
      expectCloseTo(result.igst, 1800, 2); // Full GST amount
    });

    test('should calculate GST with different rates', () => {
      const testCases = [
        { gstRate: 5, expectedGST: 500 },
        { gstRate: 12, expectedGST: 1200 },
        { gstRate: 18, expectedGST: 1800 },
        { gstRate: 28, expectedGST: 2800 },
      ];

      testCases.forEach(({ gstRate, expectedGST }) => {
        const inputs = createGSTInputs({ 
          amount: 10000,
          gstRate,
          type: 'exclusive' 
        });
        const result = calculateGST(inputs);
        
        expectCloseTo(result.gstAmount, expectedGST, 2);
        expectCloseTo(result.totalAmount, 10000 + expectedGST, 2);
      });
    });

    test('should calculate GST with different amounts', () => {
      const testCases = [
        { amount: 1000, expectedGST: 180 },
        { amount: 5000, expectedGST: 900 },
        { amount: 25000, expectedGST: 4500 },
        { amount: 100000, expectedGST: 18000 },
      ];

      testCases.forEach(({ amount, expectedGST }) => {
        const inputs = createGSTInputs({ 
          amount,
          gstRate: 18,
          type: 'exclusive' 
        });
        const result = calculateGST(inputs);
        
        expectCloseTo(result.gstAmount, expectedGST, 2);
        expectCloseTo(result.totalAmount, amount + expectedGST, 2);
      });
    });
  });

  describe('🔄 Inclusive vs Exclusive Tests', () => {
    
    test('should handle exclusive GST calculation', () => {
      const inputs = createGSTInputs({
        amount: 50000,
        gstRate: 12,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(50000);
      expectCloseTo(result.gstAmount, 6000, 2); // 50000 * 12/100
      expectCloseTo(result.totalAmount, 56000, 2); // 50000 + 6000
    });

    test('should handle inclusive GST calculation', () => {
      const inputs = createGSTInputs({
        amount: 56000,
        gstRate: 12,
        type: 'inclusive',
      });

      const result = calculateGST(inputs);

      expectCloseTo(result.totalAmount, 56000, 2);
      expectCloseTo(result.originalAmount, 50000, 2); // 56000 / 1.12
      expectCloseTo(result.gstAmount, 6000, 2); // 56000 - 50000
    });

    test('should verify exclusive and inclusive calculations are inverse', () => {
      const originalAmount = 25000;
      const gstRate = 18;

      // Calculate exclusive first
      const exclusiveInputs = createGSTInputs({
        amount: originalAmount,
        gstRate,
        type: 'exclusive',
      });
      const exclusiveResult = calculateGST(exclusiveInputs);

      // Use the total amount for inclusive calculation
      const inclusiveInputs = createGSTInputs({
        amount: exclusiveResult.totalAmount,
        gstRate,
        type: 'inclusive',
      });
      const inclusiveResult = calculateGST(inclusiveInputs);

      // Should get back to original amount
      expectCloseTo(inclusiveResult.originalAmount, originalAmount, 2);
      expectCloseTo(inclusiveResult.gstAmount, exclusiveResult.gstAmount, 2);
    });

    test('should handle round-trip calculations accurately', () => {
      const testCases = [
        { amount: 10000, rate: 5 },
        { amount: 15000, rate: 12 },
        { amount: 30000, rate: 18 },
        { amount: 50000, rate: 28 },
      ];

      testCases.forEach(({ amount, rate }) => {
        // Exclusive -> Inclusive -> Exclusive
        const step1 = calculateGST({ amount, gstRate: rate, type: 'exclusive' });
        const step2 = calculateGST({ amount: step1.totalAmount, gstRate: rate, type: 'inclusive' });
        
        expectCloseTo(step2.originalAmount, amount, 1);
        expectCloseTo(step2.gstAmount, step1.gstAmount, 1);
      });
    });
  });

  describe('📊 GST Component Tests', () => {
    
    test('should calculate CGST and SGST correctly', () => {
      const inputs = createGSTInputs({
        amount: 20000,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      const expectedGST = 3600; // 20000 * 18/100
      expectCloseTo(result.gstAmount, expectedGST, 2);
      expectCloseTo(result.cgst, expectedGST / 2, 2); // Half of total GST
      expectCloseTo(result.sgst, expectedGST / 2, 2); // Half of total GST
      expectCloseTo(result.cgst + result.sgst, result.gstAmount, 2);
    });

    test('should calculate IGST correctly', () => {
      const inputs = createGSTInputs({
        amount: 15000,
        gstRate: 12,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      const expectedGST = 1800; // 15000 * 12/100
      expectCloseTo(result.gstAmount, expectedGST, 2);
      expectCloseTo(result.igst, expectedGST, 2); // Full GST amount
    });

    test('should verify GST component relationships', () => {
      const inputs = createGSTInputs({
        amount: 35000,
        gstRate: 28,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      // CGST + SGST should equal total GST
      expectCloseTo(result.cgst + result.sgst, result.gstAmount, 2);
      
      // IGST should equal total GST
      expectCloseTo(result.igst, result.gstAmount, 2);
      
      // CGST should equal SGST
      expectCloseTo(result.cgst, result.sgst, 2);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero amount', () => {
      const inputs = createGSTInputs({
        amount: 0,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(0);
      expect(result.gstAmount).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBe(0);
    });

    test('should handle zero GST rate', () => {
      const inputs = createGSTInputs({
        amount: 10000,
        gstRate: 0,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(10000);
      expect(result.gstAmount).toBe(0);
      expect(result.totalAmount).toBe(10000);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBe(0);
    });

    test('should handle very high GST rates', () => {
      const inputs = createGSTInputs({
        amount: 10000,
        gstRate: 100, // 100% GST
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(10000);
      expectCloseTo(result.gstAmount, 10000, 2); // 100% of amount
      expectCloseTo(result.totalAmount, 20000, 2); // Double the original
      expectCloseTo(result.cgst, 5000, 2);
      expectCloseTo(result.sgst, 5000, 2);
      expectCloseTo(result.igst, 10000, 2);
    });

    test('should handle very small amounts', () => {
      const inputs = createGSTInputs({
        amount: 1,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(1);
      expectCloseTo(result.gstAmount, 0.18, 2);
      expectCloseTo(result.totalAmount, 1.18, 2);
      expectCloseTo(result.cgst, 0.09, 2);
      expectCloseTo(result.sgst, 0.09, 2);
      expectCloseTo(result.igst, 0.18, 2);
    });

    test('should handle very large amounts', () => {
      const inputs = createGSTInputs({
        amount: 10000000, // 1 crore
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(10000000);
      expectCloseTo(result.gstAmount, 1800000, 2); // 18 lakhs
      expectCloseTo(result.totalAmount, 11800000, 2); // 1.18 crores
      expectCloseTo(result.cgst, 900000, 2);
      expectCloseTo(result.sgst, 900000, 2);
      expectCloseTo(result.igst, 1800000, 2);
    });

    test('should handle fractional amounts', () => {
      const inputs = createGSTInputs({
        amount: 12345.67,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expectCloseTo(result.originalAmount, 12345.67, 2);
      expectCloseTo(result.gstAmount, 2222.22, 2); // 12345.67 * 0.18
      expectCloseTo(result.totalAmount, 14567.89, 2);
    });

    test('should handle fractional GST rates', () => {
      const inputs = createGSTInputs({
        amount: 10000,
        gstRate: 18.5, // Fractional rate
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result.originalAmount).toBe(10000);
      expectCloseTo(result.gstAmount, 1850, 2); // 10000 * 18.5/100
      expectCloseTo(result.totalAmount, 11850, 2);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid amount inputs', () => {
      const testCases = [
        { amount: null },
        { amount: undefined },
        { amount: '' },
        { amount: 'invalid' },
        { amount: -10000 }, // Negative amount
      ];

      testCases.forEach(({ amount }) => {
        const inputs = createGSTInputs({ amount: amount as any });
        const result = calculateGST(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.originalAmount).toBe('number');
        expect(typeof result.gstAmount).toBe('number');
        expect(typeof result.totalAmount).toBe('number');
        expect(isFinite(result.originalAmount)).toBe(true);
        expect(isFinite(result.gstAmount)).toBe(true);
        expect(isFinite(result.totalAmount)).toBe(true);
      });
    });

    test('should handle invalid GST rate inputs', () => {
      const testCases = [
        { gstRate: null },
        { gstRate: undefined },
        { gstRate: '' },
        { gstRate: 'invalid' },
        { gstRate: -18 }, // Negative rate
      ];

      testCases.forEach(({ gstRate }) => {
        const inputs = createGSTInputs({ gstRate: gstRate as any });
        const result = calculateGST(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.gstAmount).toBe('number');
        expect(isFinite(result.gstAmount)).toBe(true);
      });
    });

    test('should handle invalid type inputs', () => {
      const testCases = [
        { type: null },
        { type: undefined },
        { type: '' },
        { type: 'invalid' },
      ];

      testCases.forEach(({ type }) => {
        const inputs = createGSTInputs({ type: type as any });
        const result = calculateGST(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.originalAmount).toBe('number');
        expect(typeof result.totalAmount).toBe('number');
        expect(isFinite(result.originalAmount)).toBe(true);
        expect(isFinite(result.totalAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createGSTInputs({
        amount: '₹10,000' as any,
        gstRate: '18%' as any,
      });

      const result = calculateGST(inputs);

      expect(result).toBeDefined();
      expect(result.originalAmount).toBeGreaterThan(0);
      expect(result.gstAmount).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThan(result.originalAmount);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createGSTInputs({
        amount: 10000.123456789,
        gstRate: 18.987654321,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.originalAmount)).toBe(true);
      expect(Number.isFinite(result.gstAmount)).toBe(true);
      expect(Number.isFinite(result.totalAmount)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createGSTInputs({
        amount: 1e10, // Very large amount
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.originalAmount)).toBe(true);
      expect(isFinite(result.gstAmount)).toBe(true);
      expect(isFinite(result.totalAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify exclusive GST formula accuracy', () => {
      const inputs = createGSTInputs({
        amount: 25000,
        gstRate: 12,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      // Manual calculation
      const expectedGST = 25000 * 0.12;
      const expectedTotal = 25000 + expectedGST;

      expectCloseTo(result.gstAmount, expectedGST, 2);
      expectCloseTo(result.totalAmount, expectedTotal, 2);
      expect(result.originalAmount).toBe(25000);
    });

    test('should verify inclusive GST formula accuracy', () => {
      const inputs = createGSTInputs({
        amount: 28000,
        gstRate: 12,
        type: 'inclusive',
      });

      const result = calculateGST(inputs);

      // Manual calculation for inclusive GST
      const expectedOriginal = 28000 / 1.12;
      const expectedGST = 28000 - expectedOriginal;

      expectCloseTo(result.originalAmount, expectedOriginal, 2);
      expectCloseTo(result.gstAmount, expectedGST, 2);
      expect(result.totalAmount).toBe(28000);
    });

    test('should verify GST component calculations', () => {
      const inputs = createGSTInputs({
        amount: 40000,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      const expectedGST = 40000 * 0.18;
      
      // CGST and SGST should be half of total GST
      expectCloseTo(result.cgst, expectedGST / 2, 2);
      expectCloseTo(result.sgst, expectedGST / 2, 2);
      
      // IGST should be full GST
      expectCloseTo(result.igst, expectedGST, 2);
      
      // Sum verification
      expectCloseTo(result.cgst + result.sgst, result.gstAmount, 2);
    });

    test('should verify calculation consistency', () => {
      const testCases = [
        { amount: 5000, rate: 5, type: 'exclusive' as const },
        { amount: 15000, rate: 12, type: 'inclusive' as const },
        { amount: 30000, rate: 18, type: 'exclusive' as const },
        { amount: 50000, rate: 28, type: 'inclusive' as const },
      ];

      testCases.forEach(({ amount, rate, type }) => {
        const inputs = createGSTInputs({ amount, gstRate: rate, type });
        const result = calculateGST(inputs);
        
        // Basic consistency checks
        expect(result.totalAmount).toBeGreaterThanOrEqual(result.originalAmount);
        expect(result.gstAmount).toBeGreaterThanOrEqual(0);
        expectCloseTo(result.cgst + result.sgst, result.gstAmount, 2);
        expectCloseTo(result.igst, result.gstAmount, 2);
        
        if (type === 'exclusive') {
          expect(result.originalAmount).toBe(amount);
          expectCloseTo(result.totalAmount, result.originalAmount + result.gstAmount, 2);
        } else {
          expect(result.totalAmount).toBe(amount);
          expectCloseTo(result.originalAmount + result.gstAmount, result.totalAmount, 2);
        }
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        amount: 1000 + i * 100,
        gstRate: 5 + (i % 4) * 5, // 5, 10, 15, 20
        type: i % 2 === 0 ? 'exclusive' as const : 'inclusive' as const,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateGST(inputs);
        expect(result).toBeDefined();
        expect(result.gstAmount).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large amount calculations efficiently', () => {
      const inputs = createGSTInputs({
        amount: 1e9, // 100 crores
        gstRate: 18,
        type: 'exclusive',
      });

      const startTime = Date.now();
      const result = calculateGST(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.gstAmount).toBeGreaterThan(1e8);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createGSTInputs({
        amount: 50000,
        gstRate: 18,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      // These values should remain consistent across code changes
      expect(result.originalAmount).toBe(50000);
      expectCloseTo(result.gstAmount, 9000, 2);
      expectCloseTo(result.totalAmount, 59000, 2);
      expectCloseTo(result.cgst, 4500, 2);
      expectCloseTo(result.sgst, 4500, 2);
      expectCloseTo(result.igst, 9000, 2);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { amount: 0, gstRate: 18, type: 'exclusive' as const },
        { amount: 1000000, gstRate: 0, type: 'inclusive' as const },
        { amount: 12345.67, gstRate: 28, type: 'exclusive' as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateGST(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.originalAmount).toBe('number');
        expect(typeof result.gstAmount).toBe('number');
        expect(typeof result.totalAmount).toBe('number');
        expect(typeof result.cgst).toBe('number');
        expect(typeof result.sgst).toBe('number');
        expect(typeof result.igst).toBe('number');
        
        expect(isFinite(result.originalAmount)).toBe(true);
        expect(isFinite(result.gstAmount)).toBe(true);
        expect(isFinite(result.totalAmount)).toBe(true);
        expect(isFinite(result.cgst)).toBe(true);
        expect(isFinite(result.sgst)).toBe(true);
        expect(isFinite(result.igst)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createGSTInputs({
        amount: 75000,
        gstRate: 12,
        type: 'exclusive',
      });

      const result = calculateGST(inputs);

      // Mathematical relationships that should always hold
      expect(result.totalAmount).toBeGreaterThanOrEqual(result.originalAmount);
      expect(result.gstAmount).toBeGreaterThanOrEqual(0);
      expectCloseTo(result.cgst + result.sgst, result.gstAmount, 2);
      expectCloseTo(result.igst, result.gstAmount, 2);
      expectCloseTo(result.cgst, result.sgst, 2);
      
      if (inputs.type === 'exclusive') {
        expectCloseTo(result.totalAmount, result.originalAmount + result.gstAmount, 2);
      } else {
        expectCloseTo(result.originalAmount + result.gstAmount, result.totalAmount, 2);
      }
    });
  });
});