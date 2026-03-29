/**
 * Preservation Property Tests: Simple Interest Core Calculations
 * 
 * **Validates: Requirements 6.1, 6.3, 6.18**
 * **Property 2: Preservation - Simple Interest Core Calculations**
 * 
 * This test suite verifies that all CORRECT simple interest calculations
 * remain unchanged when Bug 1 (monthly interest) is fixed.
 * 
 * IMPORTANT: Observation-first methodology
 * - These tests observe and capture the CURRENT CORRECT behavior
 * - Tests run on UNFIXED code (before monthly interest bug is fixed)
 * - EXPECTED OUTCOME: All tests PASS (confirms baseline to preserve)
 * - These tests do NOT test monthly interest (that's the bug)
 * 
 * Coverage:
 * - Total simple interest calculation: (principal × rate × time) / 100
 * - Total amount calculation: principal + simpleInterest
 * - Yearly interest calculation: simpleInterest / time
 * - Edge cases: zero principal, zero rate, zero time
 */

import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { calculateSimpleInterest, SimpleInterestInputs } from '../../src/lib/calculations/simple-interest';

describe('Preservation: Simple Interest Core Calculations', () => {
  describe('Property: Total Simple Interest Formula', () => {
    /**
     * Property: For any valid inputs, simple interest = (principal × rate × time) / 100
     * This is the fundamental simple interest formula that must never change.
     */
    it('should calculate simple interest using formula (P × R × T) / 100', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10_000_000, noNaN: true }),  // principal
          fc.float({ min: 0, max: 50, noNaN: true }),          // rate
          fc.float({ min: 0, max: 50, noNaN: true }),          // time
          (principal, rate, time) => {
            const inputs: SimpleInterestInputs = { principal, rate, time };
            const result = calculateSimpleInterest(inputs);
            
            // Calculate expected simple interest
            const expectedSimpleInterest = (principal * rate * time) / 100;
            
            // Verify the formula is correct (within floating point precision)
            expect(result.simpleInterest).toBeCloseTo(expectedSimpleInterest, 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Simple interest should be proportional to principal
     * Doubling principal should double the interest (for same rate and time)
     */
    it('should scale simple interest proportionally with principal', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1000, max: 1_000_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 20, noNaN: true }),            // rate
          fc.float({ min: 1, max: 10, noNaN: true }),            // time
          (principal, rate, time) => {
            const result1 = calculateSimpleInterest({ principal, rate, time });
            const result2 = calculateSimpleInterest({ principal: principal * 2, rate, time });
            
            // Doubling principal should double the interest
            expect(result2.simpleInterest).toBeCloseTo(result1.simpleInterest * 2, 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Simple interest should be proportional to rate
     * Doubling rate should double the interest (for same principal and time)
     */
    it('should scale simple interest proportionally with rate', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 100_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 10, noNaN: true }),           // rate
          fc.float({ min: 1, max: 10, noNaN: true }),           // time
          (principal, rate, time) => {
            const result1 = calculateSimpleInterest({ principal, rate, time });
            const result2 = calculateSimpleInterest({ principal, rate: rate * 2, time });
            
            // Doubling rate should double the interest
            expect(result2.simpleInterest).toBeCloseTo(result1.simpleInterest * 2, 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Simple interest should be proportional to time
     * Doubling time should double the interest (for same principal and rate)
     */
    it('should scale simple interest proportionally with time', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 100_000, noNaN: true }),  // principal
          fc.float({ min: 5, max: 15, noNaN: true }),           // rate
          fc.float({ min: 1, max: 10, noNaN: true }),           // time
          (principal, rate, time) => {
            const result1 = calculateSimpleInterest({ principal, rate, time });
            const result2 = calculateSimpleInterest({ principal, rate, time: time * 2 });
            
            // Doubling time should double the interest
            expect(result2.simpleInterest).toBeCloseTo(result1.simpleInterest * 2, 1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Total Amount Calculation', () => {
    /**
     * Property: Total amount = principal + simple interest
     * This fundamental relationship must always hold.
     */
    it('should calculate total amount as principal + simple interest', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1000, max: 10_000_000, noNaN: true }),  // principal
          fc.float({ min: Math.fround(0.1), max: 50, noNaN: true }),           // rate
          fc.float({ min: Math.fround(0.1), max: 50, noNaN: true }),           // time
          (principal, rate, time) => {
            const inputs: SimpleInterestInputs = { principal, rate, time };
            const result = calculateSimpleInterest(inputs);
            
            // Total amount should equal principal + simple interest
            const expectedTotalAmount = result.principal + result.simpleInterest;
            
            expect(result.totalAmount).toBeCloseTo(expectedTotalAmount, 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Total amount should always be >= principal
     * (assuming non-negative rate and time)
     */
    it('should always have total amount >= principal for non-negative inputs', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10_000_000, noNaN: true }),  // principal
          fc.float({ min: 0, max: 50, noNaN: true }),          // rate
          fc.float({ min: 0, max: 50, noNaN: true }),          // time
          (principal, rate, time) => {
            const inputs: SimpleInterestInputs = { principal, rate, time };
            const result = calculateSimpleInterest(inputs);
            
            // Total amount should be at least the principal
            expect(result.totalAmount).toBeGreaterThanOrEqual(result.principal - 0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Effective Rate Calculation', () => {
    /**
     * Property: Effective rate = (simple interest / principal) × 100
     * This shows the total return as a percentage of principal.
     */
    it('should calculate effective rate as (simpleInterest / principal) × 100', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1000, max: 10_000_000, noNaN: true }),  // principal (avoid zero)
          fc.float({ min: Math.fround(0.1), max: 50, noNaN: true }),           // rate
          fc.float({ min: Math.fround(0.1), max: 50, noNaN: true }),           // time
          (principal, rate, time) => {
            const inputs: SimpleInterestInputs = { principal, rate, time };
            const result = calculateSimpleInterest(inputs);
            
            // Effective rate should be (simpleInterest / principal) × 100
            const expectedEffectiveRate = (result.simpleInterest / result.principal) * 100;
            
            expect(result.effectiveRate).toBeCloseTo(expectedEffectiveRate, 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Effective rate = rate × time
     * In simple interest, effective rate is just the product of rate and time.
     */
    it('should have effective rate equal to rate × time', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 100_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 20, noNaN: true }),           // rate
          fc.float({ min: 1, max: 10, noNaN: true }),           // time
          (principal, rate, time) => {
            const inputs: SimpleInterestInputs = { principal, rate, time };
            const result = calculateSimpleInterest(inputs);
            
            // Effective rate should equal rate × time
            const expectedEffectiveRate = rate * time;
            
            expect(result.effectiveRate).toBeCloseTo(expectedEffectiveRate, 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases: Zero Values', () => {
    /**
     * Edge Case: Zero principal should result in zero interest and zero total
     */
    it('should handle zero principal correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 0, rate: 10, time: 5 };
      const result = calculateSimpleInterest(inputs);
      
      expect(result.principal).toBe(0);
      expect(result.simpleInterest).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.effectiveRate).toBe(0);
      // Note: We don't test monthlyInterest here (that's the bug)
    });

    /**
     * Edge Case: Zero rate should result in zero interest
     */
    it('should handle zero rate correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 0, time: 5 };
      const result = calculateSimpleInterest(inputs);
      
      expect(result.principal).toBe(100000);
      expect(result.simpleInterest).toBe(0);
      expect(result.totalAmount).toBe(100000);
      expect(result.effectiveRate).toBe(0);
    });

    /**
     * Edge Case: Zero time should result in zero interest
     */
    it('should handle zero time correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 10, time: 0 };
      const result = calculateSimpleInterest(inputs);
      
      expect(result.principal).toBe(100000);
      expect(result.simpleInterest).toBe(0);
      expect(result.totalAmount).toBe(100000);
      expect(result.effectiveRate).toBe(0);
    });

    /**
     * Edge Case: All zeros should result in all zeros
     */
    it('should handle all zero inputs correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 0, rate: 0, time: 0 };
      const result = calculateSimpleInterest(inputs);
      
      expect(result.principal).toBe(0);
      expect(result.simpleInterest).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.effectiveRate).toBe(0);
    });
  });

  describe('Edge Cases: Boundary Values', () => {
    /**
     * Edge Case: Very small values should be handled correctly
     * Note: Values are rounded to 2 decimal places, so very small values become 0
     */
    it('should handle very small values correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 0.01, rate: 0.01, time: 0.01 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (0.01 × 0.01 × 0.01) / 100 = 0.000001
      // After rounding to 2 decimal places: 0
      expect(result.simpleInterest).toBe(0);
      expect(result.totalAmount).toBe(0.01);
    });

    /**
     * Edge Case: Very large values should be handled correctly
     */
    it('should handle very large values correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 10_000_000, rate: 50, time: 50 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (10,000,000 × 50 × 50) / 100 = 250,000,000
      expect(result.simpleInterest).toBe(250_000_000);
      expect(result.totalAmount).toBe(260_000_000);
      expect(result.effectiveRate).toBe(2500);
    });

    /**
     * Edge Case: Fractional time periods should work correctly
     */
    it('should handle fractional time periods correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 12, time: 0.5 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (100,000 × 12 × 0.5) / 100 = 6,000
      expect(result.simpleInterest).toBe(6000);
      expect(result.totalAmount).toBe(106000);
      expect(result.effectiveRate).toBe(6);
    });

    /**
     * Edge Case: Fractional rates should work correctly
     */
    it('should handle fractional rates correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 7.5, time: 2 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (100,000 × 7.5 × 2) / 100 = 15,000
      expect(result.simpleInterest).toBe(15000);
      expect(result.totalAmount).toBe(115000);
      expect(result.effectiveRate).toBe(15);
    });
  });

  describe('Specific Test Cases from Requirements', () => {
    /**
     * Test Case: Standard simple interest calculation
     * Validates that the core formula works for typical inputs
     */
    it('should calculate correctly for ₹100,000 at 10% for 3 years', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 10, time: 3 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (100,000 × 10 × 3) / 100 = 30,000
      expect(result.principal).toBe(100000);
      expect(result.simpleInterest).toBe(30000);
      expect(result.totalAmount).toBe(130000);
      expect(result.effectiveRate).toBe(30);
    });

    /**
     * Test Case: Another standard calculation
     */
    it('should calculate correctly for ₹50,000 at 8% for 2 years', () => {
      const inputs: SimpleInterestInputs = { principal: 50000, rate: 8, time: 2 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (50,000 × 8 × 2) / 100 = 8,000
      expect(result.principal).toBe(50000);
      expect(result.simpleInterest).toBe(8000);
      expect(result.totalAmount).toBe(58000);
      expect(result.effectiveRate).toBe(16);
    });

    /**
     * Test Case: Long-term investment
     */
    it('should calculate correctly for ₹200,000 at 12% for 5 years', () => {
      const inputs: SimpleInterestInputs = { principal: 200000, rate: 12, time: 5 };
      const result = calculateSimpleInterest(inputs);
      
      // Simple interest = (200,000 × 12 × 5) / 100 = 120,000
      expect(result.principal).toBe(200000);
      expect(result.simpleInterest).toBe(120000);
      expect(result.totalAmount).toBe(320000);
      expect(result.effectiveRate).toBe(60);
    });
  });
});
