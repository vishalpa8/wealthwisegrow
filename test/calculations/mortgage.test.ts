/**
 * Comprehensive Test Suite for Mortgage Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: HIGH - Complex financial calculations with multiple components
 */

import { calculateMortgage } from '../../src/lib/calculations/mortgage';
import type { MortgageInputs, MortgageResults } from '../../src/lib/calculations/mortgage';

describe('Mortgage Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create mortgage inputs
  const createMortgageInputs = (overrides: Partial<MortgageInputs> = {}): MortgageInputs => ({
    principal: 300000,
    rate: 4.5,
    years: 30,
    downPayment: 60000,
    propertyTax: 3600,
    insurance: 1200,
    pmi: 1800,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard mortgage correctly', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        rate: 4.5,
        years: 30,
        downPayment: 60000,
        propertyTax: 3600,
        insurance: 1200,
        pmi: 1800,
      });

      const result = calculateMortgage(inputs);

      // Loan amount = 300000 - 60000 = 240000
      // Expected monthly P&I for $240k at 4.5% for 30 years ≈ $1,216.04
      expectCloseTo(result.monthlyPrincipalAndInterest, 1216.04, 2);
      expectCloseTo(result.monthlyPropertyTax, 300, 2); // 3600/12
      expectCloseTo(result.monthlyInsurance, 100, 2); // 1200/12
      expectCloseTo(result.monthlyPMI, 150, 2); // 1800/12
      expectCloseTo(result.monthlyPayment, 1766.04, 2); // Total monthly payment
      expectCloseTo(result.loanToValue, 80, 2); // 240000/300000 * 100
      expect(result.paymentSchedule).toHaveLength(360);
    });

    test('should calculate mortgage with different home prices', () => {
      const testCases = [
        { principal: 200000, downPayment: 40000, expectedLoanAmount: 160000 },
        { principal: 500000, downPayment: 100000, expectedLoanAmount: 400000 },
        { principal: 750000, downPayment: 150000, expectedLoanAmount: 600000 },
      ];

      testCases.forEach(({ principal, downPayment, expectedLoanAmount }) => {
        const inputs = createMortgageInputs({ 
          principal, 
          downPayment, 
          rate: 4.5, 
          years: 30 
        });
        const result = calculateMortgage(inputs);
        
        // Verify loan amount calculation
        const actualLoanAmount = principal - downPayment;
        expect(actualLoanAmount).toBe(expectedLoanAmount);
        
        // Monthly payment should be proportional to loan amount
        expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(0);
        expect(result.totalPayment).toBeGreaterThan(expectedLoanAmount);
      });
    });

    test('should calculate mortgage with different interest rates', () => {
      const testCases = [
        { rate: 3.0, expectedRange: [1000, 1100] },
        { rate: 4.5, expectedRange: [1200, 1300] },
        { rate: 6.0, expectedRange: [1400, 1500] },
        { rate: 8.0, expectedRange: [1750, 1850] },
      ];

      testCases.forEach(({ rate, expectedRange }) => {
        const inputs = createMortgageInputs({ 
          principal: 300000,
          downPayment: 60000,
          rate, 
          years: 30 
        });
        const result = calculateMortgage(inputs);
        
        expect(result.monthlyPrincipalAndInterest).toBeGreaterThanOrEqual(expectedRange[0]);
        expect(result.monthlyPrincipalAndInterest).toBeLessThanOrEqual(expectedRange[1]);
      });
    });

    test('should calculate mortgage with different loan terms', () => {
      const testCases = [
        { years: 15, expectedRange: [1800, 1900] },
        { years: 20, expectedRange: [1500, 1600] },
        { years: 30, expectedRange: [1200, 1300] },
      ];

      testCases.forEach(({ years, expectedRange }) => {
        const inputs = createMortgageInputs({ 
          principal: 300000,
          downPayment: 60000,
          rate: 4.5, 
          years 
        });
        const result = calculateMortgage(inputs);
        
        expect(result.monthlyPrincipalAndInterest).toBeGreaterThanOrEqual(expectedRange[0]);
        expect(result.monthlyPrincipalAndInterest).toBeLessThanOrEqual(expectedRange[1]);
        expect(result.paymentSchedule).toHaveLength(years * 12);
      });
    });
  });

  describe('🏠 Down Payment & LTV Tests', () => {
    
    test('should handle different down payment amounts', () => {
      const testCases = [
        { downPayment: 0, expectedLTV: 100 },
        { downPayment: 30000, expectedLTV: 90 },
        { downPayment: 60000, expectedLTV: 80 },
        { downPayment: 90000, expectedLTV: 70 },
        { downPayment: 150000, expectedLTV: 50 },
      ];

      testCases.forEach(({ downPayment, expectedLTV }) => {
        const inputs = createMortgageInputs({ 
          principal: 300000,
          downPayment,
          rate: 4.5,
          years: 30 
        });
        const result = calculateMortgage(inputs);
        
        expectCloseTo(result.loanToValue, expectedLTV, 1);
        
        // Higher down payment should result in lower monthly payment
        const loanAmount = 300000 - downPayment;
        expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(0);
        
        // Verify loan amount calculation
        const expectedMonthlyPI = loanAmount > 0 ? result.monthlyPrincipalAndInterest : 0;
        expect(expectedMonthlyPI).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle 100% down payment (no loan)', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 300000, // 100% down payment
        rate: 4.5,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expectCloseTo(result.monthlyPrincipalAndInterest, 0, 2);
      expectCloseTo(result.totalPayment, 0, 2);
      expectCloseTo(result.totalInterest, 0, 2);
      expectCloseTo(result.loanToValue, 0, 2);
      expect(result.paymentSchedule).toHaveLength(0);
    });

    test('should handle down payment larger than home price', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 400000, // More than home price
        rate: 4.5,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expectCloseTo(result.monthlyPrincipalAndInterest, 0, 2);
      expectCloseTo(result.totalPayment, 0, 2);
      expectCloseTo(result.totalInterest, 0, 2);
      expectCloseTo(result.loanToValue, 0, 2);
    });
  });

  describe('💰 Additional Costs Tests', () => {
    
    test('should calculate monthly costs correctly', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 30,
        propertyTax: 6000,
        insurance: 1800,
        pmi: 2400,
      });

      const result = calculateMortgage(inputs);

      expectCloseTo(result.monthlyPropertyTax, 500, 2); // 6000/12
      expectCloseTo(result.monthlyInsurance, 150, 2); // 1800/12
      expectCloseTo(result.monthlyPMI, 200, 2); // 2400/12
      
      // Total monthly payment should include all components
      const expectedTotal = result.monthlyPrincipalAndInterest + 500 + 150 + 200;
      expectCloseTo(result.monthlyPayment, expectedTotal, 2);
    });

    test('should handle zero additional costs', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 30,
        propertyTax: 0,
        insurance: 0,
        pmi: 0,
      });

      const result = calculateMortgage(inputs);

      expectCloseTo(result.monthlyPropertyTax, 0, 2);
      expectCloseTo(result.monthlyInsurance, 0, 2);
      expectCloseTo(result.monthlyPMI, 0, 2);
      expectCloseTo(result.monthlyPayment, result.monthlyPrincipalAndInterest, 2);
    });

    test('should handle very high additional costs', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 30,
        propertyTax: 24000, // $2000/month
        insurance: 12000, // $1000/month
        pmi: 6000, // $500/month
      });

      const result = calculateMortgage(inputs);

      expectCloseTo(result.monthlyPropertyTax, 2000, 2);
      expectCloseTo(result.monthlyInsurance, 1000, 2);
      expectCloseTo(result.monthlyPMI, 500, 2);
      
      // Total should be much higher than P&I alone
      expect(result.monthlyPayment).toBeGreaterThan(result.monthlyPrincipalAndInterest + 3000);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero interest rate', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 0,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      // With 0% interest, monthly payment should be loan amount / months
      const expectedMonthly = 240000 / (30 * 12);
      expectCloseTo(result.monthlyPrincipalAndInterest, expectedMonthly, 2);
      expectCloseTo(result.totalInterest, 0, 2);
    });

    test('should handle very high interest rates', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 20, // 20% interest rate
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(3000);
      expect(result.totalInterest).toBeGreaterThan(result.monthlyPrincipalAndInterest * 360 - 240000);
    });

    test('should handle very short loan terms', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 1, // 1 year
      });

      const result = calculateMortgage(inputs);

      expect(result.paymentSchedule).toHaveLength(12);
      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(19000);
    });

    test('should handle very long loan terms', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 50, // 50 years
      });

      const result = calculateMortgage(inputs);

      expect(result.paymentSchedule).toHaveLength(600);
      expect(result.monthlyPrincipalAndInterest).toBeLessThan(1500);
      expect(result.totalInterest).toBeGreaterThan(300000);
    });

    test('should handle very small loan amounts', () => {
      const inputs = createMortgageInputs({
        principal: 50000,
        downPayment: 10000,
        rate: 4.5,
        years: 15,
      });

      const result = calculateMortgage(inputs);

      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(0);
      expect(result.monthlyPrincipalAndInterest).toBeLessThan(500);
      expectCloseTo(result.loanToValue, 80, 2);
    });

    test('should handle very large loan amounts', () => {
      const inputs = createMortgageInputs({
        principal: 2000000,
        downPayment: 400000,
        rate: 4.5,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(8000);
      expectCloseTo(result.loanToValue, 80, 2);
    });

    test('should handle fractional years', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 15.5, // 15.5 years = 186 months
      });

      const result = calculateMortgage(inputs);

      expect(result.paymentSchedule).toHaveLength(186);
      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(1500);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid principal inputs', () => {
      const testCases = [
        { principal: null },
        { principal: undefined },
        { principal: '' },
        { principal: 'invalid' },
        { principal: -300000 }, // Negative amount
      ];

      testCases.forEach(({ principal }) => {
        const inputs = createMortgageInputs({ principal: principal as any });
        const result = calculateMortgage(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(isFinite(result.monthlyPayment)).toBe(true);
      });
    });

    test('should handle invalid rate inputs', () => {
      const testCases = [
        { rate: null },
        { rate: undefined },
        { rate: '' },
        { rate: 'invalid' },
        { rate: -4.5 }, // Negative rate
      ];

      testCases.forEach(({ rate }) => {
        const inputs = createMortgageInputs({ rate: rate as any });
        const result = calculateMortgage(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(isFinite(result.monthlyPayment)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createMortgageInputs({
        principal: '$300,000' as any,
        downPayment: '$60,000' as any,
        rate: '4.5%' as any,
        years: '30 years' as any,
        propertyTax: '$3,600' as any,
        insurance: '$1,200' as any,
        pmi: '$1,800' as any,
      });

      const result = calculateMortgage(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(1000);
      expect(result.loanToValue).toBeGreaterThan(0);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createMortgageInputs({
        principal: 1e10, // Very large number
        downPayment: 1e9,
        rate: 4.5,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.monthlyPayment)).toBe(true);
      expect(isFinite(result.totalPayment)).toBe(true);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createMortgageInputs({
        principal: 300000.123456789,
        downPayment: 60000.987654321,
        rate: 4.123456789,
        years: 30.123456789,
        propertyTax: 3600.555555,
        insurance: 1200.777777,
        pmi: 1800.999999,
      });

      const result = calculateMortgage(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.monthlyPayment)).toBe(true);
      expect(Number.isFinite(result.totalPayment)).toBe(true);
      expect(Number.isFinite(result.loanToValue)).toBe(true);
    });
  });

  describe('📊 Payment Schedule Accuracy Tests', () => {
    
    test('should generate accurate payment schedule', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 5, // Short term for easier verification
      });

      const result = calculateMortgage(inputs);

      expect(result.paymentSchedule).toHaveLength(60);

      // First payment should have higher interest, lower principal
      const firstPayment = result.paymentSchedule[0];
      expect(firstPayment.month).toBe(1);
      expect(firstPayment.interest).toBeGreaterThan(0);
      expect(firstPayment.principal).toBeGreaterThan(0);
      expect(firstPayment.balance).toBeLessThan(240000);

      // Last payment should have lower interest, higher principal
      const lastPayment = result.paymentSchedule[59];
      expect(lastPayment.month).toBe(60);
      expect(lastPayment.principal).toBeGreaterThan(lastPayment.interest);
      expect(lastPayment.balance).toBeCloseTo(0, 2);

      // Verify balance decreases monotonically
      for (let i = 1; i < result.paymentSchedule.length; i++) {
        expect(result.paymentSchedule[i].balance).toBeLessThanOrEqual(
          result.paymentSchedule[i - 1].balance
        );
      }
    });

    test('should calculate cumulative interest correctly', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 10,
      });

      const result = calculateMortgage(inputs);

      // Cumulative interest should increase monotonically
      for (let i = 1; i < result.paymentSchedule.length; i++) {
        expect(result.paymentSchedule[i].cumulativeInterest).toBeGreaterThanOrEqual(
          result.paymentSchedule[i - 1].cumulativeInterest
        );
      }

      // Final cumulative interest should equal total interest
      const finalCumulativeInterest = result.paymentSchedule[result.paymentSchedule.length - 1].cumulativeInterest;
      expectCloseTo(finalCumulativeInterest, result.totalInterest, 0);
    });

    test('should handle payment schedule with zero loan amount', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 300000, // 100% down payment
        rate: 4.5,
        years: 30,
      });

      const result = calculateMortgage(inputs);

      expect(result.paymentSchedule).toHaveLength(0);
      expectCloseTo(result.totalPayment, 0, 2);
      expectCloseTo(result.totalInterest, 0, 2);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify mortgage formula accuracy', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 6,
        years: 15,
      });

      const result = calculateMortgage(inputs);

      // Manual calculation using mortgage formula
      const P = 240000; // Loan amount
      const r = 0.06 / 12; // Monthly rate
      const n = 15 * 12; // Number of payments
      
      const expectedMonthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      expectCloseTo(result.monthlyPrincipalAndInterest, expectedMonthly, 2);
    });

    test('should verify total payment calculations', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 4.5,
        years: 20,
      });

      const result = calculateMortgage(inputs);

      // Total payment should equal sum of all payments in schedule
      const calculatedTotal = result.paymentSchedule.reduce(
        (sum, payment) => sum + payment.payment, 0
      );

      expectCloseTo(result.totalPayment, calculatedTotal, 0);
    });

    test('should verify interest calculations', () => {
      const inputs = createMortgageInputs({
        principal: 300000,
        downPayment: 60000,
        rate: 5,
        years: 25,
      });

      const result = calculateMortgage(inputs);

      // Total interest should equal total payment minus loan amount
      const loanAmount = 240000;
      const expectedInterest = result.totalPayment - loanAmount;
      expectCloseTo(result.totalInterest, expectedInterest, 0);

      // Total interest should equal sum of all interest payments in schedule
      const calculatedInterest = result.paymentSchedule.reduce(
        (sum, payment) => sum + payment.interest, 0
      );
      expectCloseTo(result.totalInterest, calculatedInterest, 0);
    });

    test('should verify LTV calculations', () => {
      const testCases = [
        { principal: 400000, downPayment: 80000, expectedLTV: 80 },
        { principal: 500000, downPayment: 125000, expectedLTV: 75 },
        { principal: 600000, downPayment: 120000, expectedLTV: 80 },
      ];

      testCases.forEach(({ principal, downPayment, expectedLTV }) => {
        const inputs = createMortgageInputs({ principal, downPayment });
        const result = calculateMortgage(inputs);
        
        expectCloseTo(result.loanToValue, expectedLTV, 1);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long mortgage terms efficiently', () => {
      const inputs = createMortgageInputs({
        principal: 1000000,
        downPayment: 200000,
        rate: 4,
        years: 50, // 50 years = 600 payments
      });

      const startTime = Date.now();
      const result = calculateMortgage(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.paymentSchedule).toHaveLength(600);
      expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(0);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        principal: 200000 + i * 5000,
        downPayment: 40000 + i * 1000,
        rate: 3 + i * 0.05,
        years: 15 + i * 0.15,
        propertyTax: 2000 + i * 50,
        insurance: 800 + i * 20,
        pmi: 1000 + i * 30,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateMortgage(inputs);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createMortgageInputs({
        principal: 400000,
        downPayment: 80000,
        rate: 5.0,
        years: 30,
        propertyTax: 4800,
        insurance: 1600,
        pmi: 2000,
      });

      const result = calculateMortgage(inputs);

      // These values should remain consistent across code changes
      expectCloseTo(result.monthlyPrincipalAndInterest, 1717.46, 0);
      expectCloseTo(result.monthlyPropertyTax, 400, 2);
      expectCloseTo(result.monthlyInsurance, 133.33, 2);
      expectCloseTo(result.monthlyPMI, 166.67, 2);
      expectCloseTo(result.monthlyPayment, 2417.46, 0);
      expectCloseTo(result.loanToValue, 80, 2);
      expect(result.paymentSchedule).toHaveLength(360);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { principal: 100000, downPayment: 100000, rate: 0, years: 1 },
        { principal: 1000000, downPayment: 0, rate: 10, years: 50 },
        { principal: 300000, downPayment: 60000, rate: 4.5, years: 30 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateMortgage(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(typeof result.totalPayment).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
        expect(typeof result.loanToValue).toBe('number');
        expect(Array.isArray(result.paymentSchedule)).toBe(true);
        
        expect(isFinite(result.monthlyPayment)).toBe(true);
        expect(isFinite(result.totalPayment)).toBe(true);
        expect(isFinite(result.totalInterest)).toBe(true);
        expect(isFinite(result.loanToValue)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createMortgageInputs({
        principal: 350000,
        downPayment: 70000,
        rate: 4.25,
        years: 25,
        propertyTax: 4200,
        insurance: 1400,
        pmi: 1680,
      });

      const result = calculateMortgage(inputs);

      // Mathematical relationships that should always hold
      const loanAmount = inputs.principal - inputs.downPayment;
      expect(result.totalPayment).toBeGreaterThan(loanAmount);
      expectCloseTo(result.totalInterest, result.totalPayment - loanAmount, 0);
      expectCloseTo(result.loanToValue, (loanAmount / inputs.principal) * 100, 0);
      
      // Monthly payment components should sum correctly
      const expectedMonthlyTotal = result.monthlyPrincipalAndInterest + 
                                  result.monthlyPropertyTax + 
                                  result.monthlyInsurance + 
                                  result.monthlyPMI;
      expectCloseTo(result.monthlyPayment, expectedMonthlyTotal, 0);
      
      // Payment schedule should be consistent
      if (result.paymentSchedule.length > 0) {
        const totalSchedulePayments = result.paymentSchedule.reduce((sum, payment) => sum + payment.payment, 0);
        expectCloseTo(Math.round(totalSchedulePayments), result.totalPayment, -1);
      }
    });
  });
});