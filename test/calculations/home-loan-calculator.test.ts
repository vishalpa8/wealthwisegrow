/**
 * Comprehensive Test Suite for Home Loan Calculator
 * Tests all home loan scenarios, EMI calculations, and real estate financing
 * Priority: HIGH - Critical for home buyers and real estate financing
 */

import { calculateLoan } from '../../src/lib/calculations/loan';

describe('Home Loan Calculator - Comprehensive Test Suite', () => {

  // Helper function to create home loan inputs
  const createHomeLoanInputs = (overrides: any = {}) => ({
    principal: 3000000, // 30 lakhs default
    rate: 8.5,
    years: 20,
    extraPayment: 0,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🏠 Basic Home Loan EMI Calculations', () => {
    
    test('should calculate standard home loan EMI correctly', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000, // 30 lakhs
        rate: 8.5,
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // EMI calculation: P[r(1+r)^n]/[(1+r)^n-1]
      // Monthly rate = 8.5/12/100 = 0.007083
      // n = 20*12 = 240 months
      // Expected EMI ≈ ₹25,988
      expectCloseTo(result.monthlyPayment, 25988, 5);
      
      // Total payment = EMI * months
      expectCloseTo(result.totalPayment, 6237120, 100);
      
      // Total interest = Total payment - Principal
      expectCloseTo(result.totalInterest, 3237120, 100);
      
      expect(result.paymentSchedule).toHaveLength(240);
    });

    test('should calculate home loan for different loan amounts', () => {
      const testCases = [
        { amount: 1500000, expectedEMI: 12991 }, // 15 lakhs
        { amount: 2500000, expectedEMI: 21652 }, // 25 lakhs
        { amount: 5000000, expectedEMI: 43305 }, // 50 lakhs
        { amount: 7500000, expectedEMI: 64958 }, // 75 lakhs
      ];

      testCases.forEach(({ amount, expectedEMI }) => {
        const inputs = createHomeLoanInputs({ 
          principal: amount,
          rate: 8.5,
          years: 20 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalPayment).toBeGreaterThan(amount);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate home loan for different interest rates', () => {
      const testCases = [
        { rate: 7.0, expectedEMI: 23265 },
        { rate: 8.0, expectedEMI: 25093 },
        { rate: 8.5, expectedEMI: 25983 },
        { rate: 9.0, expectedEMI: 26992 },
        { rate: 10.0, expectedEMI: 28950 },
        { rate: 12.0, expectedEMI: 33058 },
      ];

      testCases.forEach(({ rate, expectedEMI }) => {
        const inputs = createHomeLoanInputs({ 
          principal: 3000000,
          rate,
          years: 20 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        
        // Higher rates should result in higher total interest
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate home loan for different tenures', () => {
      const testCases = [
        { years: 10, expectedEMI: 37116, maxTotalInterest: 1500000 },
        { years: 15, expectedEMI: 29551, maxTotalInterest: 2500000 },
        { years: 20, expectedEMI: 25983, maxTotalInterest: 3500000 },
        { years: 25, expectedEMI: 23847, maxTotalInterest: 4500000 },
        { years: 30, expectedEMI: 22609, maxTotalInterest: 5500000 },
      ];

      testCases.forEach(({ years, expectedEMI, maxTotalInterest }) => {
        const inputs = createHomeLoanInputs({ 
          principal: 3000000,
          rate: 8.5,
          years 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalInterest).toBeLessThan(maxTotalInterest);
        expect(result.paymentSchedule).toHaveLength(years * 12);
      });
    });
  });

  describe('💰 Extra Payment Benefits Analysis', () => {
    
    test('should calculate benefits of extra monthly payments', () => {
      const baseInputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 8.5,
        years: 20,
        extraPayment: 0
      });

      const extraPaymentInputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 8.5,
        years: 20,
        extraPayment: 5000 // Extra 5k monthly
      });

      const baseResult = calculateLoan(baseInputs);
      const extraResult = calculateLoan(extraPaymentInputs);

      // Extra payments should reduce total interest
      expect(extraResult.totalInterest).toBeLessThan(baseResult.totalInterest);
      
      // Should reduce payoff time
      expect(extraResult.payoffTime).toBeLessThan(baseResult.payoffTime);
      
      // Interest saved should be positive
      expect(extraResult.interestSaved).toBeGreaterThan(0);
      
      // Interest saved should equal difference in total interest
      expectCloseTo(
        extraResult.interestSaved, 
        baseResult.totalInterest - extraResult.totalInterest, 
        1
      );
    });

    test('should calculate impact of different extra payment amounts', () => {
      const testCases = [
        { extraPayment: 2000, expectedSavings: 400000 },
        { extraPayment: 5000, expectedSavings: 800000 },
        { extraPayment: 10000, expectedSavings: 1300000 },
        { extraPayment: 15000, expectedSavings: 1600000 },
      ];

      testCases.forEach(({ extraPayment, expectedSavings }) => {
        const inputs = createHomeLoanInputs({ 
          principal: 3000000,
          rate: 8.5,
          years: 20,
          extraPayment 
        });
        const result = calculateLoan(inputs);
        
        expect(result.interestSaved).toBeGreaterThan(expectedSavings * 0.8); // Within 20% tolerance
        expect(result.interestSaved).toBeLessThan(expectedSavings * 1.2);
        expect(result.payoffTime).toBeLessThan(240); // Less than 20 years
      });
    });

    test('should calculate time reduction with extra payments', () => {
      const inputs = createHomeLoanInputs({
        principal: 5000000, // 50 lakhs
        rate: 9.0,
        years: 25,
        extraPayment: 10000
      });

      const result = calculateLoan(inputs);

      // Should reduce tenure significantly
      expect(result.payoffTime).toBeLessThan(300); // Less than 25 years
      expect(result.payoffTime).toBeGreaterThan(180); // More than 15 years
      
      // Time reduction in years
      const timeReductionYears = (25 * 12 - result.payoffTime) / 12;
      expect(timeReductionYears).toBeGreaterThan(2); // At least 2 years reduction
    });
  });

  describe('🏘️ Real Estate Scenarios', () => {
    
    test('should handle first-time home buyer scenario', () => {
      const inputs = createHomeLoanInputs({
        principal: 2500000, // 25 lakhs - affordable home
        rate: 8.0, // Preferential rate for first-time buyers
        years: 25, // Longer tenure for lower EMI
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // EMI should be reasonable for middle-class income
      expect(result.monthlyPayment).toBeLessThan(25000);
      expect(result.monthlyPayment).toBeGreaterThan(15000);
      
      // Total interest should be manageable
      expect(result.totalInterest).toBeLessThan(4000000);
      
      // Payment schedule should be complete
      expect(result.paymentSchedule).toHaveLength(300);
    });

    test('should handle luxury home purchase scenario', () => {
      const inputs = createHomeLoanInputs({
        principal: 10000000, // 1 crore - luxury home
        rate: 9.5, // Higher rate for large loans
        years: 20,
        extraPayment: 20000 // Higher income, extra payments
      });

      const result = calculateLoan(inputs);

      // EMI should reflect luxury segment
      expect(result.monthlyPayment).toBeGreaterThan(90000);
      
      // Extra payments should provide significant savings
      expect(result.interestSaved).toBeGreaterThan(2000000);
      
      // Should reduce tenure
      expect(result.payoffTime).toBeLessThan(240);
    });

    test('should handle home loan refinancing scenario', () => {
      // Original loan
      const originalInputs = createHomeLoanInputs({
        principal: 2000000, // Remaining principal after 5 years
        rate: 10.0, // Old higher rate
        years: 15, // Remaining tenure
        extraPayment: 0
      });

      // Refinanced loan
      const refinancedInputs = createHomeLoanInputs({
        principal: 2000000,
        rate: 8.0, // New lower rate
        years: 15,
        extraPayment: 0
      });

      const originalResult = calculateLoan(originalInputs);
      const refinancedResult = calculateLoan(refinancedInputs);

      // Refinancing should reduce EMI
      expect(refinancedResult.monthlyPayment).toBeLessThan(originalResult.monthlyPayment);
      
      // Should reduce total interest
      expect(refinancedResult.totalInterest).toBeLessThan(originalResult.totalInterest);
      
      // Savings should be significant
      const monthlySavings = originalResult.monthlyPayment - refinancedResult.monthlyPayment;
      expect(monthlySavings).toBeGreaterThan(1000);
    });

    test('should handle joint home loan scenario', () => {
      const inputs = createHomeLoanInputs({
        principal: 4000000, // 40 lakhs - higher eligibility with joint application
        rate: 8.25, // Slightly better rate for joint loans
        years: 20,
        extraPayment: 3000 // Combined extra payment capacity
      });

      const result = calculateLoan(inputs);

      // EMI should be manageable for joint income
      expect(result.monthlyPayment).toBeLessThan(40000);
      expect(result.monthlyPayment).toBeGreaterThan(30000);
      
      // Extra payments should provide good savings
      expect(result.interestSaved).toBeGreaterThan(500000);
    });
  });

  describe('🏦 Bank-Specific Scenarios', () => {
    
    test('should handle SBI home loan rates', () => {
      const inputs = createHomeLoanInputs({
        principal: 3500000,
        rate: 8.40, // SBI current rates
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(25000);
      expect(result.monthlyPayment).toBeLessThan(35000);
      expect(result.totalInterest).toBeGreaterThan(2500000);
    });

    test('should handle HDFC home loan rates', () => {
      const inputs = createHomeLoanInputs({
        principal: 3500000,
        rate: 8.60, // HDFC current rates
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(25000);
      expect(result.monthlyPayment).toBeLessThan(35000);
      expect(result.totalInterest).toBeGreaterThan(2500000);
    });

    test('should handle ICICI home loan with step-up EMI', () => {
      // Simulate step-up by calculating with extra payments after initial period
      const inputs = createHomeLoanInputs({
        principal: 4000000,
        rate: 8.75,
        years: 25,
        extraPayment: 5000 // Step-up amount
      });

      const result = calculateLoan(inputs);

      // Should reduce tenure with step-up
      expect(result.payoffTime).toBeLessThan(300);
      expect(result.interestSaved).toBeGreaterThan(800000);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle minimum home loan amount', () => {
      const inputs = createHomeLoanInputs({
        principal: 100000, // 1 lakh minimum
        rate: 8.5,
        years: 5, // Short tenure for small amount
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(1500);
      expect(result.monthlyPayment).toBeLessThan(2500);
      expect(result.totalInterest).toBeLessThan(50000);
    });

    test('should handle maximum practical home loan amount', () => {
      const inputs = createHomeLoanInputs({
        principal: 50000000, // 5 crores - ultra luxury
        rate: 10.0, // Higher rate for large loans
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(400000);
      expect(result.totalInterest).toBeGreaterThan(20000000);
      expect(result.paymentSchedule).toHaveLength(240);
    });

    test('should handle very low interest rates', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 6.0, // Very competitive rate
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeLessThan(25000);
      expect(result.totalInterest).toBeLessThan(3000000);
    });

    test('should handle very high interest rates', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 15.0, // Very high rate
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(35000);
      expect(result.totalInterest).toBeGreaterThan(5000000);
    });

    test('should handle very short tenure', () => {
      const inputs = createHomeLoanInputs({
        principal: 1000000,
        rate: 8.5,
        years: 2, // Very short tenure
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(40000);
      expect(result.totalInterest).toBeLessThan(200000);
      expect(result.paymentSchedule).toHaveLength(24);
    });

    test('should handle very long tenure', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 8.5,
        years: 30, // Maximum tenure
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeLessThan(25000);
      expect(result.totalInterest).toBeGreaterThan(5000000);
      expect(result.paymentSchedule).toHaveLength(360);
    });

    test('should handle large extra payments', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 8.5,
        years: 20,
        extraPayment: 50000 // Very large extra payment
      });

      const result = calculateLoan(inputs);

      // Should pay off very quickly
      expect(result.payoffTime).toBeLessThan(100); // Less than 8 years
      expect(result.interestSaved).toBeGreaterThan(2000000);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid principal amounts', () => {
      const testCases = [
        { principal: 0 },
        { principal: -1000000 },
        { principal: null },
        { principal: undefined },
        { principal: 'invalid' },
      ];

      testCases.forEach(({ principal }) => {
        const inputs = createHomeLoanInputs({ principal: principal as any });
        const result = calculateLoan(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(isFinite(result.monthlyPayment)).toBe(true);
      });
    });

    test('should handle string inputs with currency formatting', () => {
      const inputs = createHomeLoanInputs({
        principal: '₹30,00,000' as any,
        rate: '8.5%' as any,
        years: '20 years' as any,
        extraPayment: '₹5,000' as any,
      });

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000.123456789,
        rate: 8.567890123,
        years: 20.123456789,
        extraPayment: 5000.987654321,
      });

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.monthlyPayment)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify EMI formula accuracy', () => {
      const inputs = createHomeLoanInputs({
        principal: 2000000,
        rate: 9.0,
        years: 15,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Manual calculation: EMI = P[r(1+r)^n]/[(1+r)^n-1]
      const P = 2000000;
      const r = 9 / 12 / 100; // Monthly rate
      const n = 15 * 12; // Total months
      
      const expectedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      expectCloseTo(result.monthlyPayment, expectedEMI, 1);
    });

    test('should verify total payment calculation', () => {
      const inputs = createHomeLoanInputs({
        principal: 1500000,
        rate: 8.0,
        years: 10,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Total payment should equal EMI * number of months
      const expectedTotalPayment = result.monthlyPayment * (inputs.years * 12);
      expectCloseTo(result.totalPayment, expectedTotalPayment, 1);
    });

    test('should verify interest calculation accuracy', () => {
      const inputs = createHomeLoanInputs({
        principal: 2500000,
        rate: 8.5,
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Total interest should equal total payment minus principal
      const expectedTotalInterest = result.totalPayment - inputs.principal;
      expectCloseTo(result.totalInterest, expectedTotalInterest, 1);
    });

    test('should verify payment schedule accuracy', () => {
      const inputs = createHomeLoanInputs({
        principal: 1000000,
        rate: 10.0,
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Verify payment schedule totals
      const schedulePrincipal = result.paymentSchedule.reduce((sum, payment) => sum + payment.principal, 0);
      const scheduleInterest = result.paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);

      expectCloseTo(schedulePrincipal, inputs.principal, 1);
      expectCloseTo(scheduleInterest, result.totalInterest, 1);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle large loan calculations efficiently', () => {
      const inputs = createHomeLoanInputs({
        principal: 100000000, // 10 crores
        rate: 8.5,
        years: 30,
        extraPayment: 0
      });

      const startTime = Date.now();
      const result = calculateLoan(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.monthlyPayment).toBeGreaterThan(700000);
      expect(result.paymentSchedule).toHaveLength(360);
    });

    test('should handle multiple home loan calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        principal: 2000000 + i * 50000,
        rate: 7.5 + i % 5,
        years: 15 + i % 15,
        extraPayment: i * 1000
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateLoan(inputs);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for standard home loan', () => {
      const inputs = createHomeLoanInputs({
        principal: 3000000,
        rate: 8.5,
        years: 20,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // These values should remain consistent
      expectCloseTo(result.monthlyPayment, 25983, 50);
      expect(result.totalPayment).toBeGreaterThan(6000000);
      expect(result.totalPayment).toBeLessThan(7000000);
      expect(result.totalInterest).toBeGreaterThan(3000000);
      expect(result.paymentSchedule).toHaveLength(240);
    });

    test('should verify mathematical relationships', () => {
      const inputs = createHomeLoanInputs({
        principal: 4000000,
        rate: 9.0,
        years: 25,
        extraPayment: 10000
      });

      const result = calculateLoan(inputs);

      // Mathematical relationships that should always hold
      expect(result.totalPayment).toBeGreaterThan(result.principal);
      expect(result.totalInterest).toBe(result.totalPayment - result.principal);
      expect(result.payoffTime).toBeLessThan(inputs.years * 12);
      expect(result.interestSaved).toBeGreaterThan(0);
    });
  });
});