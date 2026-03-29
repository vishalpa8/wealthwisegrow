/**
 * Bug Condition Exploration Test: Simple Interest Monthly Interest Calculation
 * 
 * **Validates: Requirements 2.1, 2.2**
 * 
 * This test explores Bug 1 - Simple Interest Monthly Interest Calculation.
 * The bug: system divides by (time × 12) instead of just 12 when calculating monthly interest.
 * 
 * EXPECTED BEHAVIOR: This test MUST FAIL on unfixed code.
 * - Failure confirms the bug exists
 * - The test encodes the CORRECT expected behavior
 * - When the bug is fixed, this test will pass
 * 
 * DO NOT fix the test or the code when it fails - document the counterexamples.
 */

import { describe, it, expect } from '@jest/globals';
import { calculateSimpleInterest, SimpleInterestInputs } from '../../src/lib/calculations/simple-interest';

describe('Bug Exploration: Simple Interest Monthly Interest Calculation', () => {
  describe('Fault Condition: Monthly Interest Formula', () => {
    /**
     * Test Case 1: Principal ₹100,000, Rate 10%, Time 3 years
     * Expected (Correct): monthlyInterest = ₹2,500
     * Current (Wrong): monthlyInterest = ₹833.33
     * 
     * This test WILL FAIL on unfixed code, proving the bug exists.
     */
    it('should calculate monthly interest as ₹2,500 for ₹100k at 10% for 3 years', () => {
      const inputs: SimpleInterestInputs = { 
        principal: 100000, 
        rate: 10, 
        time: 3 
      };
      const result = calculateSimpleInterest(inputs);
      
      // Total simple interest: (100000 * 10 * 3) / 100 = 30000
      expect(result.simpleInterest).toBe(30000);
      
      // Monthly interest should be: 30000 / 12 = 2500
      // NOT: 30000 / (3 * 12) = 833.33
      expect(result.monthlyInterest).toBe(2500);
    });

    /**
     * Test Case 2: Principal ₹50,000, Rate 8%, Time 1 year
     * Expected (Correct): monthlyInterest = ₹333.33
     * Current (Wrong): monthlyInterest = ₹333.33
     * 
     * EDGE CASE: Bug is HIDDEN when time = 1 year (both formulas match)
     * This test will PASS even on unfixed code.
     */
    it('should calculate monthly interest as ₹333.33 for ₹50k at 8% for 1 year (bug hidden)', () => {
      const inputs: SimpleInterestInputs = { 
        principal: 50000, 
        rate: 8, 
        time: 1 
      };
      const result = calculateSimpleInterest(inputs);
      
      // Total simple interest: (50000 * 8 * 1) / 100 = 4000
      expect(result.simpleInterest).toBe(4000);
      
      // Monthly interest: 4000 / 12 = 333.33
      // Bug hidden: 4000 / (1 * 12) = 333.33 (same result!)
      expect(result.monthlyInterest).toBeCloseTo(333.33, 2);
    });

    /**
     * Test Case 3: Principal ₹200,000, Rate 12%, Time 5 years
     * Expected (Correct): monthlyInterest = ₹10,000
     * Current (Wrong): monthlyInterest = ₹2,000
     * 
     * This test WILL FAIL on unfixed code, proving the bug exists.
     */
    it('should calculate monthly interest as ₹10,000 for ₹200k at 12% for 5 years', () => {
      const inputs: SimpleInterestInputs = { 
        principal: 200000, 
        rate: 12, 
        time: 5 
      };
      const result = calculateSimpleInterest(inputs);
      
      // Total simple interest: (200000 * 12 * 5) / 100 = 120000
      expect(result.simpleInterest).toBe(120000);
      
      // Monthly interest should be: 120000 / 12 = 10000
      // NOT: 120000 / (5 * 12) = 2000
      expect(result.monthlyInterest).toBe(10000);
    });
  });

  describe('Property: Monthly Interest Scales with Time Period', () => {
    /**
     * Property Test: Monthly interest should scale proportionally with time period
     * for the same principal and rate.
     * 
     * According to the design specification, monthly interest = simpleInterest / 12,
     * where simpleInterest = (principal * rate * time) / 100.
     * Therefore, monthly interest WILL vary with the time period.
     * 
     * This property test verifies the correct formula is applied.
     */
    it('should calculate monthly interest proportional to time period', () => {
      const baseInputs = { 
        principal: 100000, 
        rate: 10 
      };
      
      // Calculate for different time periods
      const result1Year = calculateSimpleInterest({ ...baseInputs, time: 1 });
      const result3Years = calculateSimpleInterest({ ...baseInputs, time: 3 });
      const result5Years = calculateSimpleInterest({ ...baseInputs, time: 5 });
      const result10Years = calculateSimpleInterest({ ...baseInputs, time: 10 });
      
      // Monthly interest should be: simpleInterest / 12
      // For 1 year: (100000 * 10 * 1 / 100) / 12 = 10000 / 12 = 833.33
      // For 3 years: (100000 * 10 * 3 / 100) / 12 = 30000 / 12 = 2500
      // For 5 years: (100000 * 10 * 5 / 100) / 12 = 50000 / 12 = 4166.67
      // For 10 years: (100000 * 10 * 10 / 100) / 12 = 100000 / 12 = 8333.33
      
      expect(result1Year.monthlyInterest).toBeCloseTo(833.33, 2);
      expect(result3Years.monthlyInterest).toBeCloseTo(2500, 2);
      expect(result5Years.monthlyInterest).toBeCloseTo(4166.67, 2);
      expect(result10Years.monthlyInterest).toBeCloseTo(8333.33, 2);
      
      // Verify proportional scaling: 3 years should be 3x of 1 year
      expect(result3Years.monthlyInterest).toBeCloseTo(result1Year.monthlyInterest * 3, 1);
      expect(result5Years.monthlyInterest).toBeCloseTo(result1Year.monthlyInterest * 5, 1);
      expect(result10Years.monthlyInterest).toBeCloseTo(result1Year.monthlyInterest * 10, 1);
    });

    /**
     * Property Test: Verify the correct formula across multiple scenarios
     * 
     * For any valid inputs, monthlyInterest should equal simpleInterest / 12
     * NOT simpleInterest / (time * 12)
     */
    it('should always calculate monthly interest as simpleInterest / 12', () => {
      const testCases = [
        { principal: 50000, rate: 5, time: 2 },
        { principal: 150000, rate: 7.5, time: 4 },
        { principal: 75000, rate: 9, time: 6 },
        { principal: 300000, rate: 11, time: 8 },
      ];
      
      testCases.forEach(inputs => {
        const result = calculateSimpleInterest(inputs);
        const expectedMonthlyInterest = result.simpleInterest / 12;
        
        expect(result.monthlyInterest).toBeCloseTo(expectedMonthlyInterest, 2);
      });
    });
  });

  describe('Counterexample Documentation', () => {
    /**
     * This test documents the exact counterexamples that demonstrate the bug.
     * It shows what the current (wrong) implementation produces vs. what it should produce.
     */
    it('should document counterexamples showing the bug', () => {
      const testCase = { principal: 100000, rate: 10, time: 3 };
      const result = calculateSimpleInterest(testCase);
      
      // Current implementation (WRONG):
      const currentFormula = result.simpleInterest / (testCase.time * 12);
      
      // Expected implementation (CORRECT):
      const correctFormula = result.simpleInterest / 12;
      
      // Document the discrepancy
      console.log('\n=== Bug Counterexample ===');
      console.log(`Input: Principal ₹${testCase.principal}, Rate ${testCase.rate}%, Time ${testCase.time} years`);
      console.log(`Simple Interest: ₹${result.simpleInterest}`);
      console.log(`Current (Wrong) Monthly Interest: ₹${currentFormula.toFixed(2)} [dividing by ${testCase.time * 12}]`);
      console.log(`Expected (Correct) Monthly Interest: ₹${correctFormula.toFixed(2)} [dividing by 12]`);
      console.log(`Actual Result: ₹${result.monthlyInterest}`);
      console.log('========================\n');
      
      // This assertion will fail on unfixed code, confirming the bug
      expect(result.monthlyInterest).toBe(correctFormula);
    });
  });
});
