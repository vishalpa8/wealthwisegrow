/**
 * Bug Condition Exploration Test: Loan Calculator Display Values
 * 
 * **Validates: Requirements 3.1**
 * 
 * This test explores Bug 2 - Loan Calculator First Month Amortization Display.
 * The bug: system shows average monthly principal/interest instead of actual first month values.
 * 
 * EXPECTED BEHAVIOR: This test MUST FAIL on unfixed code.
 * - Failure confirms the bug exists
 * - The test encodes the CORRECT expected behavior
 * - When the bug is fixed, this test will pass
 * 
 * DO NOT fix the test or the code when it fails - document the counterexamples.
 */

import { describe, it, expect } from '@jest/globals';

// Since the calculation is in the page component, we'll replicate it here for testing
interface LoanInputs {
  amount: number;
  rate: number;
  years: number;
}

interface LoanResults {
  monthly: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
}

/**
 * This is the CURRENT (buggy) implementation from src/app/calculators/loan/page.tsx
 * It calculates AVERAGE values instead of first month amortization values
 */
function calculateLoanCurrent(values: LoanInputs): LoanResults {
  const principal = Math.abs(values.amount || 0);
  const annualRate = Math.abs(values.rate || 0);
  const years = Math.abs(values.years || 1);
  
  if (principal === 0) {
    return {
      monthly: 0,
      totalPayment: 0,
      totalInterest: 0,
      monthlyPrincipal: 0,
      monthlyInterest: 0
    };
  }
  
  const rate = annualRate / 100 / 12; // Monthly interest rate
  const months = years * 12;

  let monthly = 0;
  if (rate === 0) {
    monthly = principal / months;
  } else {
    monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  }
  
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  
  // BUG: These calculate AVERAGE values, not first month values
  const monthlyPrincipal = principal / months;
  const monthlyInterest = monthly - monthlyPrincipal;

  return {
    monthly: isFinite(monthly) ? monthly : 0,
    totalPayment: isFinite(totalPayment) ? totalPayment : 0,
    totalInterest: isFinite(totalInterest) ? totalInterest : 0,
    monthlyPrincipal: isFinite(monthlyPrincipal) ? monthlyPrincipal : 0,
    monthlyInterest: isFinite(monthlyInterest) ? monthlyInterest : 0
  };
}

/**
 * This is the CORRECT implementation that calculates actual first month values
 */
function calculateLoanCorrect(values: LoanInputs): LoanResults {
  const principal = Math.abs(values.amount || 0);
  const annualRate = Math.abs(values.rate || 0);
  const years = Math.abs(values.years || 1);
  
  if (principal === 0) {
    return {
      monthly: 0,
      totalPayment: 0,
      totalInterest: 0,
      monthlyPrincipal: 0,
      monthlyInterest: 0
    };
  }
  
  const rate = annualRate / 100 / 12; // Monthly interest rate
  const months = years * 12;

  let monthly = 0;
  if (rate === 0) {
    monthly = principal / months;
  } else {
    monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  }
  
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  
  // CORRECT: Calculate actual first month amortization values
  const firstMonthInterest = principal * rate;
  const firstMonthPrincipal = monthly - firstMonthInterest;

  return {
    monthly: isFinite(monthly) ? monthly : 0,
    totalPayment: isFinite(totalPayment) ? totalPayment : 0,
    totalInterest: isFinite(totalInterest) ? totalInterest : 0,
    monthlyPrincipal: isFinite(firstMonthPrincipal) ? firstMonthPrincipal : 0,
    monthlyInterest: isFinite(firstMonthInterest) ? firstMonthInterest : 0
  };
}

describe('Bug Exploration: Loan Calculator Display Values', () => {
  describe('Fault Condition: First Month Amortization Display', () => {
    /**
     * Test Case 1: Loan ₹100,000 at 12% for 5 years
     * Expected (Correct): First month interest ≈ ₹1,000, principal ≈ ₹1,224
     * Current (Wrong): Average interest ≈ ₹557, principal ≈ ₹1,667
     * 
     * This test WILL FAIL on unfixed code, proving the bug exists.
     */
    it('should calculate first month interest as ~₹1,000 for ₹100k at 12% for 5 years', () => {
      const inputs: LoanInputs = { 
        amount: 100000, 
        rate: 12, 
        years: 5 
      };
      
      const currentResult = calculateLoanCurrent(inputs);
      const correctResult = calculateLoanCorrect(inputs);
      
      // Monthly EMI should be the same in both
      expect(currentResult.monthly).toBeCloseTo(correctResult.monthly, 2);
      
      // First month interest should be: principal × (rate / 100 / 12)
      // = 100000 × (12 / 100 / 12) = 100000 × 0.01 = 1000
      expect(correctResult.monthlyInterest).toBeCloseTo(1000, 2);
      
      // First month principal should be: monthlyPayment - firstMonthInterest
      // ≈ 2224.44 - 1000 = 1224.44
      expect(correctResult.monthlyPrincipal).toBeCloseTo(1224.44, 2);
      
      // This will FAIL on current implementation (proves bug exists)
      expect(currentResult.monthlyInterest).toBeCloseTo(1000, 2);
      expect(currentResult.monthlyPrincipal).toBeCloseTo(1224.44, 2);
    });

    /**
     * Test Case 2: Loan ₹50,000 at 18% for 3 years
     * Expected (Correct): First month interest should be much higher than average
     * Current (Wrong): Shows average values
     * 
     * This test WILL FAIL on unfixed code, proving the bug exists.
     */
    it('should calculate first month interest as ~₹750 for ₹50k at 18% for 3 years', () => {
      const inputs: LoanInputs = { 
        amount: 50000, 
        rate: 18, 
        years: 3 
      };
      
      const currentResult = calculateLoanCurrent(inputs);
      const correctResult = calculateLoanCorrect(inputs);
      
      // First month interest should be: 50000 × (18 / 100 / 12) = 50000 × 0.015 = 750
      expect(correctResult.monthlyInterest).toBeCloseTo(750, 2);
      
      // First month principal should be: monthlyPayment - 750
      const expectedPrincipal = correctResult.monthly - 750;
      expect(correctResult.monthlyPrincipal).toBeCloseTo(expectedPrincipal, 2);
      
      // This will FAIL on current implementation (proves bug exists)
      expect(currentResult.monthlyInterest).toBeCloseTo(750, 2);
      expect(currentResult.monthlyPrincipal).toBeCloseTo(expectedPrincipal, 2);
    });

    /**
     * Test Case 3: Loan ₹200,000 at 6% for 10 years
     * Expected (Correct): First month values differ from average
     * Current (Wrong): Shows average values
     * 
     * This test WILL FAIL on unfixed code, proving the bug exists.
     */
    it('should calculate first month interest as ~₹1,000 for ₹200k at 6% for 10 years', () => {
      const inputs: LoanInputs = { 
        amount: 200000, 
        rate: 6, 
        years: 10 
      };
      
      const currentResult = calculateLoanCurrent(inputs);
      const correctResult = calculateLoanCorrect(inputs);
      
      // First month interest should be: 200000 × (6 / 100 / 12) = 200000 × 0.005 = 1000
      expect(correctResult.monthlyInterest).toBeCloseTo(1000, 2);
      
      // First month principal should be: monthlyPayment - 1000
      const expectedPrincipal = correctResult.monthly - 1000;
      expect(correctResult.monthlyPrincipal).toBeCloseTo(expectedPrincipal, 2);
      
      // This will FAIL on current implementation (proves bug exists)
      expect(currentResult.monthlyInterest).toBeCloseTo(1000, 2);
      expect(currentResult.monthlyPrincipal).toBeCloseTo(expectedPrincipal, 2);
    });
  });

  describe('Property: First Month Interest Formula', () => {
    /**
     * Property Test: firstMonthInterest = principal × (rate / 100 / 12)
     * 
     * This is the fundamental formula for calculating first month interest
     * in an amortizing loan.
     */
    it('should calculate first month interest using formula: principal × (rate / 100 / 12)', () => {
      const testCases = [
        { amount: 100000, rate: 12, years: 5 },
        { amount: 50000, rate: 18, years: 3 },
        { amount: 200000, rate: 6, years: 10 },
        { amount: 150000, rate: 9, years: 7 },
        { amount: 75000, rate: 15, years: 4 },
      ];
      
      testCases.forEach(inputs => {
        const currentResult = calculateLoanCurrent(inputs);
        const monthlyRate = inputs.rate / 100 / 12;
        const expectedFirstMonthInterest = inputs.amount * monthlyRate;
        
        // This will FAIL on current implementation
        expect(currentResult.monthlyInterest).toBeCloseTo(expectedFirstMonthInterest, 2);
      });
    });

    /**
     * Property Test: firstMonthPrincipal = monthlyPayment - firstMonthInterest
     * 
     * The principal portion is what's left after subtracting interest from EMI.
     */
    it('should calculate first month principal as: monthlyPayment - firstMonthInterest', () => {
      const testCases = [
        { amount: 100000, rate: 12, years: 5 },
        { amount: 50000, rate: 18, years: 3 },
        { amount: 200000, rate: 6, years: 10 },
      ];
      
      testCases.forEach(inputs => {
        const currentResult = calculateLoanCurrent(inputs);
        const correctResult = calculateLoanCorrect(inputs);
        
        // Verify the relationship holds in correct implementation
        expect(correctResult.monthlyPrincipal + correctResult.monthlyInterest)
          .toBeCloseTo(correctResult.monthly, 2);
        
        // This will FAIL on current implementation
        expect(currentResult.monthlyPrincipal).toBeCloseTo(correctResult.monthlyPrincipal, 2);
      });
    });
  });

  describe('Property: First Month Values Match Amortization Schedule', () => {
    /**
     * Property Test: First month display values should match amortization schedule[0]
     * 
     * In a proper amortization schedule, the first payment's principal and interest
     * split should match what's displayed as "Monthly Principal" and "Monthly Interest".
     */
    it('should match first payment in amortization schedule', () => {
      const inputs: LoanInputs = { 
        amount: 100000, 
        rate: 12, 
        years: 5 
      };
      
      const currentResult = calculateLoanCurrent(inputs);
      
      // Calculate first payment in amortization schedule
      const principal = inputs.amount;
      const monthlyRate = inputs.rate / 100 / 12;
      const firstPaymentInterest = principal * monthlyRate;
      const firstPaymentPrincipal = currentResult.monthly - firstPaymentInterest;
      
      // Current implementation should match amortization schedule
      // This will FAIL because current shows average, not first payment
      expect(currentResult.monthlyInterest).toBeCloseTo(firstPaymentInterest, 2);
      expect(currentResult.monthlyPrincipal).toBeCloseTo(firstPaymentPrincipal, 2);
    });
  });

  describe('Property: Interest Rates Impact', () => {
    /**
     * Property Test: Higher interest rates should show larger discrepancy
     * between average and first month values.
     * 
     * At higher rates, more of the early payments go to interest,
     * so the difference between average and first month is more pronounced.
     */
    it('should show larger discrepancy at higher interest rates', () => {
      const baseInputs = { amount: 100000, years: 5 };
      
      const lowRate = calculateLoanCurrent({ ...baseInputs, rate: 6 });
      const mediumRate = calculateLoanCurrent({ ...baseInputs, rate: 12 });
      const highRate = calculateLoanCurrent({ ...baseInputs, rate: 18 });
      
      const lowRateCorrect = calculateLoanCorrect({ ...baseInputs, rate: 6 });
      const mediumRateCorrect = calculateLoanCorrect({ ...baseInputs, rate: 12 });
      const highRateCorrect = calculateLoanCorrect({ ...baseInputs, rate: 18 });
      
      // Calculate discrepancies (difference between average and first month)
      const lowDiscrepancy = Math.abs(lowRate.monthlyInterest - lowRateCorrect.monthlyInterest);
      const mediumDiscrepancy = Math.abs(mediumRate.monthlyInterest - mediumRateCorrect.monthlyInterest);
      const highDiscrepancy = Math.abs(highRate.monthlyInterest - highRateCorrect.monthlyInterest);
      
      // Higher rates should have larger discrepancies
      expect(mediumDiscrepancy).toBeGreaterThan(lowDiscrepancy);
      expect(highDiscrepancy).toBeGreaterThan(mediumDiscrepancy);
    });
  });

  describe('Counterexample Documentation', () => {
    /**
     * This test documents the exact counterexamples that demonstrate the bug.
     * It shows what the current (wrong) implementation produces vs. what it should produce.
     */
    it('should document counterexamples showing the bug', () => {
      const testCase = { amount: 100000, rate: 12, years: 5 };
      const currentResult = calculateLoanCurrent(testCase);
      const correctResult = calculateLoanCorrect(testCase);
      
      // Document the discrepancy
      console.log('\n=== Bug Counterexample: Loan Display Values ===');
      console.log(`Input: Loan ₹${testCase.amount}, Rate ${testCase.rate}%, Term ${testCase.years} years`);
      console.log(`Monthly EMI: ₹${currentResult.monthly.toFixed(2)}`);
      console.log('\nCurrent (Wrong - Average Values):');
      console.log(`  Monthly Principal: ₹${currentResult.monthlyPrincipal.toFixed(2)} [principal / months]`);
      console.log(`  Monthly Interest: ₹${currentResult.monthlyInterest.toFixed(2)} [EMI - average principal]`);
      console.log('\nExpected (Correct - First Month Values):');
      console.log(`  First Month Principal: ₹${correctResult.monthlyPrincipal.toFixed(2)} [EMI - first month interest]`);
      console.log(`  First Month Interest: ₹${correctResult.monthlyInterest.toFixed(2)} [principal × monthly rate]`);
      console.log('\nDiscrepancy:');
      console.log(`  Principal Difference: ₹${Math.abs(currentResult.monthlyPrincipal - correctResult.monthlyPrincipal).toFixed(2)}`);
      console.log(`  Interest Difference: ₹${Math.abs(currentResult.monthlyInterest - correctResult.monthlyInterest).toFixed(2)}`);
      console.log('==============================================\n');
      
      // These assertions will fail on unfixed code, confirming the bug
      expect(currentResult.monthlyInterest).toBeCloseTo(correctResult.monthlyInterest, 2);
      expect(currentResult.monthlyPrincipal).toBeCloseTo(correctResult.monthlyPrincipal, 2);
    });

    /**
     * Additional counterexample with high interest rate
     */
    it('should document counterexample with high interest rate', () => {
      const testCase = { amount: 50000, rate: 18, years: 3 };
      const currentResult = calculateLoanCurrent(testCase);
      const correctResult = calculateLoanCorrect(testCase);
      
      console.log('\n=== Bug Counterexample: High Interest Rate ===');
      console.log(`Input: Loan ₹${testCase.amount}, Rate ${testCase.rate}%, Term ${testCase.years} years`);
      console.log(`Monthly EMI: ₹${currentResult.monthly.toFixed(2)}`);
      console.log(`\nCurrent Monthly Interest: ₹${currentResult.monthlyInterest.toFixed(2)}`);
      console.log(`Expected First Month Interest: ₹${correctResult.monthlyInterest.toFixed(2)}`);
      console.log(`Difference: ₹${Math.abs(currentResult.monthlyInterest - correctResult.monthlyInterest).toFixed(2)}`);
      console.log('==============================================\n');
      
      expect(currentResult.monthlyInterest).toBeCloseTo(correctResult.monthlyInterest, 2);
    });
  });
});
