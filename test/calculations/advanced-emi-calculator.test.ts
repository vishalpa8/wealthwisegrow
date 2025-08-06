/**
 * Comprehensive Test Suite for Advanced EMI Calculator
 * Tests all EMI scenarios, prepayment options, and amortization schedules
 * Priority: HIGH - Advanced loan calculation features
 */

import { calculateAdvancedEMI, EMIInputs } from '../../src/lib/calculations/advanced-emi';
import { parseRobustNumber } from '../../src/lib/utils/number';

describe('Advanced EMI Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create EMI inputs
  const createEMIInputs = (overrides: Partial<EMIInputs> = {}): EMIInputs => ({
    loanAmount: 2500000,
    interestRate: 8.5,
    loanTenure: 20,
    tenureType: "years",
    prepaymentAmount: 0,
    prepaymentFrequency: "none",
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard advanced EMI correctly', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
        prepaymentAmount: 0,
        prepaymentFrequency: "none",
      });

      const result = calculateAdvancedEMI(inputs);

      // Expected monthly EMI for ₹25L at 8.5% for 20 years ≈ ₹21,696
      expectCloseTo(result.monthlyEMI, 21696, 0);
      expect(result.totalAmount).toBeGreaterThan(2500000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.interestToLoanRatio).toBeGreaterThan(0);
      expect(result.amortizationSchedule).toHaveLength(240); // 20 years = 240 months
    });

    test('should calculate EMI with different loan amounts', () => {
      const testCases = [
        { loanAmount: 1000000, expectedEMIRange: [8600, 8800] },
        { loanAmount: 5000000, expectedEMIRange: [43000, 44000] },
        { loanAmount: 10000000, expectedEMIRange: [86000, 87000] },
      ];

      testCases.forEach(({ loanAmount, expectedEMIRange }) => {
        const inputs = createEMIInputs({ 
          loanAmount, 
          interestRate: 8.5, 
          loanTenure: 20,
          tenureType: "years" 
        });
        const result = calculateAdvancedEMI(inputs);
        
        expect(result.monthlyEMI).toBeGreaterThanOrEqual(expectedEMIRange[0]);
        expect(result.monthlyEMI).toBeLessThanOrEqual(expectedEMIRange[1]);
      });
    });

    test('should calculate EMI with different interest rates', () => {
      const testCases = [
        { interestRate: 6.0, expectedEMIRange: [17000, 18000] },
        { interestRate: 8.5, expectedEMIRange: [21000, 22000] },
        { interestRate: 12.0, expectedEMIRange: [27000, 28000] },
      ];

      testCases.forEach(({ interestRate, expectedEMIRange }) => {
        const inputs = createEMIInputs({ 
          loanAmount: 2500000,
          interestRate, 
          loanTenure: 20,
          tenureType: "years" 
        });
        const result = calculateAdvancedEMI(inputs);
        
        expect(result.monthlyEMI).toBeGreaterThanOrEqual(expectedEMIRange[0]);
        expect(result.monthlyEMI).toBeLessThanOrEqual(expectedEMIRange[1]);
      });
    });

    test('should calculate EMI with different tenure periods', () => {
      const testCases = [
        { loanTenure: 10, tenureType: "years" as const, expectedEMIRange: [30000, 32000] },
        { loanTenure: 15, tenureType: "years" as const, expectedEMIRange: [24000, 26000] },
        { loanTenure: 30, tenureType: "years" as const, expectedEMIRange: [19000, 21000] },
      ];

      testCases.forEach(({ loanTenure, tenureType, expectedEMIRange }) => {
        const inputs = createEMIInputs({ 
          loanAmount: 2500000,
          interestRate: 8.5, 
          loanTenure,
          tenureType 
        });
        const result = calculateAdvancedEMI(inputs);
        
        expect(result.monthlyEMI).toBeGreaterThanOrEqual(expectedEMIRange[0]);
        expect(result.monthlyEMI).toBeLessThanOrEqual(expectedEMIRange[1]);
        expect(result.amortizationSchedule).toHaveLength(loanTenure * 12);
      });
    });

    test('should handle tenure in months correctly', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 60, // 5 years in months
        tenureType: "months",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.amortizationSchedule).toHaveLength(60);
      expect(result.monthlyEMI).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThan(1000000);
    });
  });

  describe('💰 Prepayment Scenarios Tests', () => {
    
    test('should calculate EMI with monthly prepayments correctly', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
        prepaymentAmount: 5000,
        prepaymentFrequency: "monthly",
      });

      const result = calculateAdvancedEMI(inputs);
      const resultWithoutPrepayment = calculateAdvancedEMI({
        ...inputs,
        prepaymentAmount: 0,
        prepaymentFrequency: "none",
      });

      // Prepayments should reduce total interest and loan tenure
      expect(result.totalInterest).toBeLessThan(resultWithoutPrepayment.totalInterest);
      expect(result.amortizationSchedule.length).toBeLessThan(resultWithoutPrepayment.amortizationSchedule.length);
      
      // Each payment should include prepayment
      result.amortizationSchedule.forEach((payment, index) => {
        if (index < result.amortizationSchedule.length - 1) {
          expectCloseTo(payment.emi, result.monthlyEMI + 5000, 2);
        }
      });
    });

    test('should calculate EMI with yearly prepayments correctly', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
        prepaymentAmount: 100000,
        prepaymentFrequency: "yearly",
      });

      const result = calculateAdvancedEMI(inputs);

      // Check that prepayments are applied only in 12th, 24th, 36th months etc.
      const yearlyPayments = result.amortizationSchedule.filter((payment, index) => 
        (index + 1) % 12 === 0
      );
      
      yearlyPayments.forEach(payment => {
        if (payment.balance > 0) {
          expect(payment.emi).toBeGreaterThan(result.monthlyEMI);
        }
      });
    });

    test('should handle large prepayments that exceed balance', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
        prepaymentAmount: 500000, // Very large prepayment
        prepaymentFrequency: "monthly",
      });

      const result = calculateAdvancedEMI(inputs);

      // Loan should be paid off much earlier
      expect(result.amortizationSchedule.length).toBeLessThan(24); // Less than 2 years
      expect(result.totalInterest).toBeLessThan(100000);
      
      // Final balance should be zero
      const finalPayment = result.amortizationSchedule[result.amortizationSchedule.length - 1];
      expectCloseTo(finalPayment.balance, 0, 2);
    });

    test('should handle no prepayment scenario', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
        prepaymentAmount: 0,
        prepaymentFrequency: "none",
      });

      const result = calculateAdvancedEMI(inputs);

      // All EMI payments should be the same
      result.amortizationSchedule.forEach(payment => {
        expectCloseTo(payment.emi, result.monthlyEMI, 2);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should return error for zero loan amount', () => {
      const inputs = createEMIInputs({
        loanAmount: 0,
      });

      const result = calculateAdvancedEMI(inputs);
      expect(result.error).toBe('Loan amount must be positive.');
    });

    test('should handle zero interest rate', () => {
      const inputs = createEMIInputs({
        loanAmount: 2400000,
        interestRate: 0,
        loanTenure: 20,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      // With 0% interest, EMI should be loan amount / total months
      const expectedEMI = 2400000 / (20 * 12);
      expectCloseTo(result.monthlyEMI, expectedEMI, 2);
      expectCloseTo(result.totalInterest, 0, 2);
      expectCloseTo(result.totalAmount, 2400000, 2);
    });

    test('should handle very high interest rates', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 50, // 50% interest rate
        loanTenure: 10,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.monthlyEMI).toBeGreaterThan(40000);
      expect(result.totalInterest).toBeGreaterThan(result.monthlyEMI * 120 - 1000000);
      expect(result.amortizationSchedule).toHaveLength(120);
    });

    test('should handle very short tenure', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 1,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.amortizationSchedule).toHaveLength(12);
      expect(result.monthlyEMI).toBeGreaterThan(80000);
    });

    test('should handle very long tenure', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000,
        interestRate: 8.5,
        loanTenure: 50,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.amortizationSchedule).toHaveLength(600);
      expect(result.monthlyEMI).toBeLessThan(25000);
      expect(result.totalInterest).toBeGreaterThan(5000000);
    });

    test('should handle tenure in months edge cases', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 1, // 1 month
        tenureType: "months",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.amortizationSchedule).toHaveLength(1);
      expect(result.monthlyEMI).toBeGreaterThan(1000000);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should return error for invalid loan amount', () => {
      const inputs = createEMIInputs({ loanAmount: -1000 });
      const result = calculateAdvancedEMI(inputs);
      expect(result.error).toBe('Loan amount must be positive.');
    });

    test('should return error for invalid interest rate', () => {
      const inputs = createEMIInputs({ interestRate: -5 });
      const result = calculateAdvancedEMI(inputs);
      expect(result.error).toBe('Interest rate cannot be negative.');
    });

    test('should return error for invalid tenure', () => {
      const inputs = createEMIInputs({ loanTenure: 0 });
      const result = calculateAdvancedEMI(inputs);
      expect(result.error).toBe('Loan tenure must be positive.');
    });

    test('should return error for invalid prepayment amount', () => {
      const inputs = createEMIInputs({ prepaymentAmount: -100 });
      const result = calculateAdvancedEMI(inputs);
      expect(result.error).toBe('Prepayment amount cannot be negative.');
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createEMIInputs({
        loanAmount: '₹25,00,000' as any,
        interestRate: '8.5%' as any,
        loanTenure: '20 years' as any,
        prepaymentAmount: '₹5,000' as any,
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyEMI).toBeGreaterThan(20000);
      expect(result.totalAmount).toBeGreaterThan(2500000);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createEMIInputs({
        loanAmount: 2500000.123456789,
        interestRate: 8.123456789,
        loanTenure: 20.123456789,
        prepaymentAmount: 5000.987654321,
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.monthlyEMI)).toBe(true);
      expect(Number.isFinite(result.totalAmount)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });

    test('should handle invalid tenure type', () => {
      const inputs = createEMIInputs({
        tenureType: 'invalid' as any,
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyEMI).toBeGreaterThan(0);
    });

    test('should handle invalid prepayment frequency', () => {
      const inputs = createEMIInputs({
        prepaymentAmount: 5000,
        prepaymentFrequency: 'invalid' as any,
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyEMI).toBeGreaterThan(0);
    });
  });

  describe('📊 Amortization Schedule Accuracy Tests', () => {
    
    test('should generate accurate amortization schedule', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 2, // Short term for easier verification
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      expect(result.amortizationSchedule).toHaveLength(24);

      // First payment should have some interest component
      const firstPayment = result.amortizationSchedule[0];
      expect(firstPayment.month).toBe(1);
      // For a 2-year loan, principal payment is actually higher than interest from the start
      expect(firstPayment.principal).toBeGreaterThan(0);
      expect(firstPayment.interest).toBeGreaterThan(0);
      expect(firstPayment.balance).toBeLessThan(1000000);

      // Last payment should have lower interest, higher principal
      const lastPayment = result.amortizationSchedule[23];
      expect(lastPayment.month).toBe(24);
      expect(lastPayment.principal).toBeGreaterThan(lastPayment.interest);
      expectCloseTo(lastPayment.balance, 0, 2);

      // Verify balance decreases monotonically
      for (let i = 1; i < result.amortizationSchedule.length; i++) {
        expect(result.amortizationSchedule[i].balance).toBeLessThanOrEqual(
          result.amortizationSchedule[i - 1].balance
        );
      }
    });

    test('should calculate total interest correctly from schedule', () => {
      const inputs = createEMIInputs({
        loanAmount: 1500000,
        interestRate: 8.5,
        loanTenure: 5,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      // Total interest should equal sum of all interest payments in schedule
      const calculatedInterest = result.amortizationSchedule.reduce(
        (sum, payment) => sum + payment.interest, 0
      );
      expectCloseTo(result.totalInterest, calculatedInterest, 2);
    });

    test('should handle amortization with prepayments', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 10,
        tenureType: "years",
        prepaymentAmount: 10000,
        prepaymentFrequency: "monthly",
      });

      const result = calculateAdvancedEMI(inputs);

      // Each payment should include prepayment except possibly the last
      result.amortizationSchedule.forEach((payment, index) => {
        if (index < result.amortizationSchedule.length - 1) {
          expect(payment.emi).toBeGreaterThanOrEqual(result.monthlyEMI);
        }
      });

      // Loan should be paid off earlier than original tenure
      expect(result.amortizationSchedule.length).toBeLessThan(120);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify EMI formula accuracy', () => {
      const inputs = createEMIInputs({
        loanAmount: 1000000,
        interestRate: 9,
        loanTenure: 15,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      // Manual calculation using EMI formula
      const P = 1000000;
      const r = 0.09 / 12; // Monthly rate
      const n = 15 * 12; // Number of payments
      
      const expectedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      expectCloseTo(result.monthlyEMI, expectedEMI, 2);
    });

    test('should verify interest to loan ratio calculation', () => {
      const inputs = createEMIInputs({
        loanAmount: 2000000,
        interestRate: 8.5,
        loanTenure: 20,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      const expectedRatio = (result.totalInterest / 2000000) * 100;
      expectCloseTo(result.interestToLoanRatio, expectedRatio, 2);
    });

    test('should verify total amount calculation', () => {
      const inputs = createEMIInputs({
        loanAmount: 1500000,
        interestRate: 8.5,
        loanTenure: 25,
        tenureType: "years",
      });

      const result = calculateAdvancedEMI(inputs);

      const expectedTotal = 1500000 + result.totalInterest;
      expectCloseTo(result.totalAmount, expectedTotal, 2);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long tenure efficiently', () => {
      const inputs = createEMIInputs({
        loanAmount: 5000000,
        interestRate: 8.5,
        loanTenure: 50, // 50 years = 600 payments
        tenureType: "years",
      });

      const startTime = Date.now();
      const result = calculateAdvancedEMI(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.amortizationSchedule).toHaveLength(600);
      expect(result.monthlyEMI).toBeGreaterThan(0);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 50 }, (_, i) => ({
        loanAmount: 1000000 + i * 100000,
        interestRate: 6 + i * 0.1,
        loanTenure: 10 + i * 0.5,
        tenureType: "years" as const,
        prepaymentAmount: i * 1000,
        prepaymentFrequency: i % 2 === 0 ? "monthly" as const : "none" as const,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateAdvancedEMI(inputs);
        expect(result).toBeDefined();
        expect(result.monthlyEMI).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createEMIInputs({
        loanAmount: 3000000,
        interestRate: 8.5,
        loanTenure: 25,
        tenureType: "years",
        prepaymentAmount: 0,
        prepaymentFrequency: "none",
      });

      const result = calculateAdvancedEMI(inputs);

      // These values should remain consistent across code changes
      expectCloseTo(result.monthlyEMI, 24157, 0);
      expect(result.amortizationSchedule).toHaveLength(300);
      expect(result.totalAmount).toBeGreaterThan(3000000);
      expect(result.interestToLoanRatio).toBeGreaterThan(100);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { loanAmount: 1, interestRate: 0.01, loanTenure: 1, tenureType: "months" as const },
        { loanAmount: 10000000, interestRate: 25, loanTenure: 30, tenureType: "years" as const },
        { loanAmount: 1000000, interestRate: 0, loanTenure: 10, tenureType: "years" as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateAdvancedEMI(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyEMI).toBe('number');
        expect(typeof result.totalAmount).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
        expect(typeof result.interestToLoanRatio).toBe('number');
        expect(Array.isArray(result.amortizationSchedule)).toBe(true);
        
        expect(isFinite(result.monthlyEMI)).toBe(true);
        expect(isFinite(result.totalAmount)).toBe(true);
        expect(isFinite(result.totalInterest)).toBe(true);
        expect(isFinite(result.interestToLoanRatio)).toBe(true);
      });
    });
  });
});