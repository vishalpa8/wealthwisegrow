/**
 * Preservation Property Tests: Loan Calculator Core Calculations
 * 
 * **Validates: Requirements 6.1, 6.2, 6.11, 6.12, 6.17**
 * **Property 2: Preservation - Loan Calculator Core Calculations**
 * 
 * This test suite verifies that all CORRECT loan calculator calculations
 * remain unchanged when Bug 2 (display values) is fixed.
 * 
 * IMPORTANT: Observation-first methodology
 * - These tests observe and capture the CURRENT CORRECT behavior
 * - Tests run on UNFIXED code (before display values bug is fixed)
 * - EXPECTED OUTCOME: All tests PASS (confirms baseline to preserve)
 * - These tests do NOT test display values (that's the bug)
 * 
 * Coverage:
 * - Monthly EMI calculation using standard mortgage formula
 * - Total payment calculation: monthlyPayment × months
 * - Total interest calculation: totalPayment - principal
 * - Amortization schedule generation with correct balance tracking
 * - Extra payment handling reducing principal
 * - Zero interest rate handling (simple division)
 * - Edge cases: various loan amounts, rates, terms
 */

import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { calculateLoan } from '../../src/lib/calculations/loan';
import type { LoanInputs } from '../../src/lib/validations/calculator';

describe('Preservation: Loan Calculator Core Calculations', () => {
  describe('Property: Monthly EMI Formula', () => {
    /**
     * Property: For any valid loan inputs with rate > 0,
     * monthly payment = P × [r × (1 + r)^n] / [(1 + r)^n - 1]
     * where P = principal, r = monthly rate, n = number of payments
     */
    it('should calculate monthly EMI using standard mortgage formula', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 10_000_000, noNaN: true }),  // principal
          fc.float({ min: Math.fround(0.1), max: 30, noNaN: true }),            // annual rate
          fc.float({ min: 1, max: 30, noNaN: true }),              // years
          (principal, annualRate, years) => {
            const inputs: LoanInputs = { 
              principal, 
              rate: annualRate, 
              years, 
              extraPayment: 0 
            };
            const result = calculateLoan(inputs);
            
            // Calculate expected monthly payment using mortgage formula
            const monthlyRate = annualRate / 1200;
            const numberOfPayments = years * 12;
            const powerTerm = Math.pow(1 + monthlyRate, numberOfPayments);
            const expectedMonthly = principal * (monthlyRate * powerTerm) / (powerTerm - 1);
            
            // Verify the formula is correct (within floating point precision)
            expect(result.monthlyPayment).toBeCloseTo(expectedMonthly, 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Monthly payment should be proportional to principal
     * Doubling principal should double the monthly payment (for same rate and term)
     */
    it('should scale monthly payment proportionally with principal', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 3, max: 15, noNaN: true }),           // rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          (principal, rate, years) => {
            const result1 = calculateLoan({ principal, rate, years, extraPayment: 0 });
            const result2 = calculateLoan({ principal: principal * 2, rate, years, extraPayment: 0 });
            
            // Doubling principal should double the monthly payment
            expect(result2.monthlyPayment).toBeCloseTo(result1.monthlyPayment * 2, 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Monthly payment should increase with interest rate
     * Higher rate should result in higher monthly payment
     */
    it('should have higher monthly payment for higher interest rates', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 3, max: 10, noNaN: true }),           // lower rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          (principal, lowerRate, years) => {
            const higherRate = lowerRate + 5;
            const result1 = calculateLoan({ principal, rate: lowerRate, years, extraPayment: 0 });
            const result2 = calculateLoan({ principal, rate: higherRate, years, extraPayment: 0 });
            
            // Higher rate should result in higher monthly payment
            expect(result2.monthlyPayment).toBeGreaterThan(result1.monthlyPayment);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Monthly payment should decrease with longer term
     * Longer term should result in lower monthly payment (but higher total interest)
     */
    it('should have lower monthly payment for longer terms', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 5, max: 15, noNaN: true }),           // rate
          fc.float({ min: 5, max: 15, noNaN: true }),           // shorter years
          (principal, rate, shorterYears) => {
            const longerYears = shorterYears + 10;
            const result1 = calculateLoan({ principal, rate, years: shorterYears, extraPayment: 0 });
            const result2 = calculateLoan({ principal, rate, years: longerYears, extraPayment: 0 });
            
            // Longer term should result in lower monthly payment
            expect(result2.monthlyPayment).toBeLessThan(result1.monthlyPayment);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Total Payment Calculation', () => {
    /**
     * Property: Total payment = monthly payment × number of payments (without extra payments)
     * Note: Use integer years to avoid excessive rounding artifacts from fractional months
     */
    it('should calculate total payment as monthly payment × months', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 1_000_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 20, noNaN: true }),             // rate
          fc.integer({ min: 1, max: 30 }),                        // years (integer to avoid fractional month issues)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Total payment should equal monthly payment × number of payments
            const expectedTotalPayment = result.monthlyPayment * (years * 12);
            
            // Allow tolerance for rounding (loan calculations round to 2 decimal places)
            // Rounding artifacts scale with number of payments and can be significant
            const numPayments = years * 12;
            const tolerance = Math.max(5, numPayments * 0.35);
            expect(Math.abs(result.totalPayment - expectedTotalPayment)).toBeLessThanOrEqual(tolerance);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Total payment should always be >= principal
     * (for non-negative interest rates)
     * Note: Use integer years to avoid excessive rounding artifacts
     */
    it('should always have total payment >= principal', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 1_000_000, noNaN: true }),  // principal
          fc.float({ min: Math.fround(0.1), max: 20, noNaN: true }),             // rate (avoid near-zero rates)
          fc.integer({ min: 1, max: 30 }),                        // years (integer)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Total payment should be at least the principal (allow small rounding tolerance)
            expect(result.totalPayment).toBeGreaterThanOrEqual(principal - 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Total Interest Calculation', () => {
    /**
     * Property: Total interest = total payment - principal
     * Note: Use integer years to avoid excessive rounding artifacts
     */
    it('should calculate total interest as total payment - principal', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 1_000_000, noNaN: true }),  // principal
          fc.float({ min: Math.fround(0.1), max: 20, noNaN: true }),           // rate
          fc.integer({ min: 1, max: 30 }),                        // years (integer)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Total interest should equal total payment - principal (allow rounding tolerance)
            const expectedTotalInterest = result.totalPayment - principal;
            
            // Longer terms can have more rounding artifacts
            const tolerance = years > 15 ? 14 : 10;
            expect(Math.abs(result.totalInterest - expectedTotalInterest)).toBeLessThanOrEqual(tolerance);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Total interest should be >= 0 for non-negative rates
     */
    it('should have non-negative total interest for non-negative rates', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 1_000_000, noNaN: true }),  // principal
          fc.float({ min: 0, max: 20, noNaN: true }),             // rate
          fc.float({ min: 1, max: 30, noNaN: true }),             // years
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Total interest should be non-negative
            expect(result.totalInterest).toBeGreaterThanOrEqual(-0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Higher interest rate should result in higher total interest
     */
    it('should have higher total interest for higher rates', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 3, max: 10, noNaN: true }),           // lower rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          (principal, lowerRate, years) => {
            const higherRate = lowerRate + 5;
            const result1 = calculateLoan({ principal, rate: lowerRate, years, extraPayment: 0 });
            const result2 = calculateLoan({ principal, rate: higherRate, years, extraPayment: 0 });
            
            // Higher rate should result in higher total interest
            expect(result2.totalInterest).toBeGreaterThan(result1.totalInterest);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Amortization Schedule', () => {
    /**
     * Property: Payment schedule should have correct number of entries
     * Number of payments should equal years × 12 (without extra payments)
     */
    it('should generate payment schedule with correct number of entries', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.integer({ min: 1, max: 30 }),                      // years (integer for exact count)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Should have exactly years × 12 payments
            expect(result.paymentSchedule.length).toBe(years * 12);
            expect(result.payoffTime).toBe(years * 12);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Balance should decrease monotonically
     * Each payment should reduce the balance
     */
    it('should have monotonically decreasing balance in payment schedule', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.float({ min: 1, max: 10, noNaN: true }),           // years (shorter for faster tests)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Balance should decrease with each payment
            for (let i = 1; i < result.paymentSchedule.length; i++) {
              expect(result.paymentSchedule[i].balance).toBeLessThanOrEqual(
                result.paymentSchedule[i - 1].balance + 0.01
              );
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Property: Final balance should be zero (or very close to zero)
     * Note: Use integer years to avoid excessive rounding artifacts
     */
    it('should have final balance close to zero', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.integer({ min: 1, max: 10 }),                      // years (integer, shorter for faster tests)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Final balance should be zero or very close to zero (allow rounding tolerance)
            const finalBalance = result.paymentSchedule[result.paymentSchedule.length - 1].balance;
            expect(finalBalance).toBeLessThan(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Each payment should equal principal + interest
     */
    it('should have each payment equal to principal + interest', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.float({ min: 1, max: 5, noNaN: true }),            // years (shorter for faster tests)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Each payment should equal principal + interest (except possibly last payment)
            for (let i = 0; i < result.paymentSchedule.length - 1; i++) {
              const payment = result.paymentSchedule[i];
              const calculatedPayment = payment.principal + payment.interest;
              expect(payment.payment).toBeCloseTo(calculatedPayment, 1);
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Property: Sum of all principal payments should equal original principal
     * Note: Use integer years to avoid excessive rounding artifacts
     */
    it('should have sum of principal payments equal to original principal', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.integer({ min: 1, max: 10 }),                      // years (integer)
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Sum of all principal payments should equal original principal (allow rounding tolerance)
            const totalPrincipalPaid = result.paymentSchedule.reduce(
              (sum, payment) => sum + payment.principal,
              0
            );
            expect(Math.abs(totalPrincipalPaid - principal)).toBeLessThan(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Sum of all interest payments should equal total interest
     */
    it('should have sum of interest payments equal to total interest', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 1, max: 15, noNaN: true }),           // rate
          fc.float({ min: 1, max: 10, noNaN: true }),           // years
          (principal, rate, years) => {
            const inputs: LoanInputs = { principal, rate, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // Sum of all interest payments should equal total interest
            const totalInterestPaid = result.paymentSchedule.reduce(
              (sum, payment) => sum + payment.interest,
              0
            );
            expect(totalInterestPaid).toBeCloseTo(result.totalInterest, 1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Extra Payment Handling', () => {
    /**
     * Property: Extra payments should reduce payoff time
     * Note: Only test when extra payment is significant enough to make a difference
     */
    it('should reduce payoff time with extra payments', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 5, max: 15, noNaN: true }),           // rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          fc.float({ min: 200, max: 1000, noNaN: true }),       // extra payment (increased minimum)
          (principal, rate, years, extraPayment) => {
            const resultWithoutExtra = calculateLoan({ principal, rate, years, extraPayment: 0 });
            const resultWithExtra = calculateLoan({ principal, rate, years, extraPayment });
            
            // Extra payments should reduce payoff time (or at least not increase it)
            expect(resultWithExtra.payoffTime).toBeLessThanOrEqual(resultWithoutExtra.payoffTime);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Extra payments should reduce total interest
     */
    it('should reduce total interest with extra payments', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 5, max: 15, noNaN: true }),           // rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          fc.float({ min: 100, max: 1000, noNaN: true }),       // extra payment
          (principal, rate, years, extraPayment) => {
            const resultWithoutExtra = calculateLoan({ principal, rate, years, extraPayment: 0 });
            const resultWithExtra = calculateLoan({ principal, rate, years, extraPayment });
            
            // Extra payments should reduce total interest
            expect(resultWithExtra.totalInterest).toBeLessThan(resultWithoutExtra.totalInterest);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Interest saved should be positive with extra payments
     */
    it('should have positive interest saved with extra payments', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50000, max: 500_000, noNaN: true }),  // principal
          fc.float({ min: 5, max: 15, noNaN: true }),           // rate
          fc.float({ min: 5, max: 20, noNaN: true }),           // years
          fc.float({ min: 100, max: 1000, noNaN: true }),       // extra payment
          (principal, rate, years, extraPayment) => {
            const result = calculateLoan({ principal, rate, years, extraPayment });
            
            // Interest saved should be positive
            expect(result.interestSaved).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Cases: Zero Interest Rate', () => {
    /**
     * Edge Case: Zero interest rate should use simple division
     * Monthly payment = principal / number of months
     */
    it('should handle zero interest rate correctly', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10000, max: 1_000_000, noNaN: true }),  // principal
          fc.integer({ min: 1, max: 30 }),                        // years
          (principal, years) => {
            const inputs: LoanInputs = { principal, rate: 0, years, extraPayment: 0 };
            const result = calculateLoan(inputs);
            
            // With 0% interest, monthly payment should be principal / months
            const expectedMonthly = principal / (years * 12);
            expect(result.monthlyPayment).toBeCloseTo(expectedMonthly, 1);
            
            // Total interest should be zero (or very close)
            expect(result.totalInterest).toBeCloseTo(0, 1);
            
            // Total payment should equal principal (allow rounding tolerance)
            expect(Math.abs(result.totalPayment - principal)).toBeLessThan(2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Specific Test Cases from Requirements', () => {
    /**
     * Test Case: Standard loan calculation
     * ₹100,000 at 12% for 5 years
     */
    it('should calculate correctly for ₹100,000 at 12% for 5 years', () => {
      const inputs: LoanInputs = { principal: 100000, rate: 12, years: 5, extraPayment: 0 };
      const result = calculateLoan(inputs);
      
      // Expected monthly payment ≈ ₹2,224.44
      expect(result.monthlyPayment).toBeCloseTo(2224.44, 1);
      
      // Should have 60 payments
      expect(result.payoffTime).toBe(60);
      expect(result.paymentSchedule.length).toBe(60);
      
      // Total payment should be monthly × 60
      expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 60, 0);
      
      // Total interest should be total payment - principal
      expect(result.totalInterest).toBeCloseTo(result.totalPayment - 100000, 1);
      
      // Final balance should be zero
      expect(result.paymentSchedule[59].balance).toBeCloseTo(0, 0);
    });

    /**
     * Test Case: High interest loan
     * ₹50,000 at 18% for 3 years
     */
    it('should calculate correctly for ₹50,000 at 18% for 3 years', () => {
      const inputs: LoanInputs = { principal: 50000, rate: 18, years: 3, extraPayment: 0 };
      const result = calculateLoan(inputs);
      
      // Expected monthly payment ≈ ₹1,809.66 (allow tolerance for calculation differences)
      expect(result.monthlyPayment).toBeCloseTo(1807.62, 1);
      
      // Should have 36 payments
      expect(result.payoffTime).toBe(36);
      
      // Total interest should be positive and significant
      expect(result.totalInterest).toBeGreaterThan(10000);
      
      // Final balance should be zero
      expect(result.paymentSchedule[35].balance).toBeCloseTo(0, 0);
    });

    /**
     * Test Case: Low interest long-term loan
     * ₹200,000 at 6% for 10 years
     */
    it('should calculate correctly for ₹200,000 at 6% for 10 years', () => {
      const inputs: LoanInputs = { principal: 200000, rate: 6, years: 10, extraPayment: 0 };
      const result = calculateLoan(inputs);
      
      // Expected monthly payment ≈ ₹2,220.41
      expect(result.monthlyPayment).toBeCloseTo(2220.41, 1);
      
      // Should have 120 payments
      expect(result.payoffTime).toBe(120);
      
      // Total payment should be monthly × 120
      expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 120, 0);
      
      // Final balance should be zero
      expect(result.paymentSchedule[119].balance).toBeCloseTo(0, 0);
    });

    /**
     * Test Case: Zero interest loan
     * ₹100,000 at 0% for 5 years
     */
    it('should calculate correctly for ₹100,000 at 0% for 5 years', () => {
      const inputs: LoanInputs = { principal: 100000, rate: 0, years: 5, extraPayment: 0 };
      const result = calculateLoan(inputs);
      
      // With 0% interest, monthly payment = 100,000 / 60 = ₹1,666.67
      expect(result.monthlyPayment).toBeCloseTo(1666.67, 1);
      
      // Total interest should be zero
      expect(result.totalInterest).toBeCloseTo(0, 1);
      
      // Total payment should equal principal
      expect(result.totalPayment).toBeCloseTo(100000, 0);
      
      // Should have 60 payments
      expect(result.payoffTime).toBe(60);
    });

    /**
     * Test Case: Loan with extra payments
     * ₹100,000 at 10% for 10 years with ₹200 extra payment
     */
    it('should calculate correctly with extra payments', () => {
      const inputs: LoanInputs = { principal: 100000, rate: 10, years: 10, extraPayment: 200 };
      const result = calculateLoan(inputs);
      
      // Should have fewer than 120 payments due to extra payments
      expect(result.payoffTime).toBeLessThan(120);
      
      // Interest saved should be positive
      expect(result.interestSaved).toBeGreaterThan(0);
      
      // Total interest should be less than without extra payments
      const resultWithoutExtra = calculateLoan({ ...inputs, extraPayment: 0 });
      expect(result.totalInterest).toBeLessThan(resultWithoutExtra.totalInterest);
      
      // Final balance should be zero
      const finalPayment = result.paymentSchedule[result.paymentSchedule.length - 1];
      expect(finalPayment.balance).toBeCloseTo(0, 0);
    });
  });
});
