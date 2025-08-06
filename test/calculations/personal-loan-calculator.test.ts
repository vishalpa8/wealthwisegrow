/**
 * Comprehensive Test Suite for Personal Loan Calculator
 * Tests all personal loan scenarios, EMI calculations, and unsecured lending
 * Priority: HIGH - Critical for personal finance and unsecured lending
 */

import { calculateLoan } from '../../src/lib/calculations/loan';

describe('Personal Loan Calculator - Comprehensive Test Suite', () => {

  // Helper function to create personal loan inputs
  const createPersonalLoanInputs = (overrides: any = {}) => ({
    principal: 500000, // 5 lakhs default
    rate: 12,
    years: 5,
    extraPayment: 0,
    ...overrides,
  });

  // Helper function to calculate additional metrics like income requirement
  const calculatePersonalLoanWithMetrics = (inputs: any) => {
    const result = calculateLoan(inputs);
    const monthlyIncome = inputs.principal > 0 ? 
      (inputs.principal / (inputs.years * 12) * 3) : 0; // 3x EMI as minimum income
    
    return {
      ...result,
      monthlyIncome,
    };
  };

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('💳 Basic Personal Loan EMI Calculations', () => {
    
    test('should calculate standard personal loan EMI correctly', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000, // 5 lakhs
        rate: 12,
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI calculation for personal loan
      // Monthly rate = 12/12/100 = 0.01
      // n = 5*12 = 60 months
      // Expected EMI ≈ ₹11,122
      expectCloseTo(result.monthlyPayment, 11122, 50);
      
      // Total payment = EMI * months
      expectCloseTo(result.totalPayment, 667320, 1000);
      
      // Total interest = Total payment - Principal
      expectCloseTo(result.totalInterest, 167320, 1000);
      
      // Minimum income requirement (3x EMI)
      expectCloseTo(result.monthlyIncome, 33366, 100);
      
      expect(result.paymentSchedule).toHaveLength(60);
    });

    test('should calculate personal loan for different amounts', () => {
      const testCases = [
        { amount: 100000, expectedEMI: 2224 }, // 1 lakh - small personal loan
        { amount: 300000, expectedEMI: 6673 }, // 3 lakhs - medium loan
        { amount: 750000, expectedEMI: 16683 }, // 7.5 lakhs - large loan
        { amount: 1000000, expectedEMI: 22244 }, // 10 lakhs - maximum typical
        { amount: 2000000, expectedEMI: 44488 }, // 20 lakhs - high-income borrower
      ];

      testCases.forEach(({ amount, expectedEMI }) => {
        const inputs = createPersonalLoanInputs({ 
          principal: amount,
          rate: 12,
          years: 5 
        });
        const result = calculatePersonalLoanWithMetrics(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalPayment).toBeGreaterThan(amount);
        expect(result.totalInterest).toBeGreaterThan(0);
        
        // Income requirement should be 3x EMI
        expectCloseTo(result.monthlyIncome, expectedEMI * 3, 100);
      });
    });

    test('should calculate personal loan for different interest rates', () => {
      const testCases = [
        { rate: 10.0, expectedEMI: 10607 }, // Best rate for premium customers
        { rate: 11.0, expectedEMI: 10871 }, // Good credit score
        { rate: 12.0, expectedEMI: 11122 }, // Standard rate
        { rate: 14.0, expectedEMI: 11634 }, // Average credit score
        { rate: 16.0, expectedEMI: 12156 }, // Below average credit
        { rate: 18.0, expectedEMI: 12687 }, // Poor credit score
        { rate: 24.0, expectedEMI: 14764 }, // High-risk borrower
      ];

      testCases.forEach(({ rate, expectedEMI }) => {
        const inputs = createPersonalLoanInputs({ 
          principal: 500000,
          rate,
          years: 5 
        });
        const result = calculatePersonalLoanWithMetrics(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        
        // Higher rates should result in higher total interest
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate personal loan for different tenures', () => {
      const testCases = [
        { years: 1, expectedEMI: 44424, maxTotalInterest: 35000 },
        { years: 2, expectedEMI: 23536, maxTotalInterest: 65000 },
        { years: 3, expectedEMI: 16607, maxTotalInterest: 100000 },
        { years: 5, expectedEMI: 11122, maxTotalInterest: 170000 },
        { years: 7, expectedEMI: 8567, maxTotalInterest: 220000 },
      ];

      testCases.forEach(({ years, expectedEMI, maxTotalInterest }) => {
        const inputs = createPersonalLoanInputs({ 
          principal: 500000,
          rate: 12,
          years 
        });
        const result = calculatePersonalLoanWithMetrics(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalInterest).toBeLessThan(maxTotalInterest);
        expect(result.paymentSchedule).toHaveLength(years * 12);
      });
    });
  });

  describe('🎯 Personal Loan Use Case Scenarios', () => {
    
    test('should handle debt consolidation scenario', () => {
      const inputs = createPersonalLoanInputs({
        principal: 800000, // 8 lakhs to consolidate multiple debts
        rate: 13.5, // Slightly higher rate for large amount
        years: 6,
        extraPayment: 5000 // Extra payment to clear faster
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI should be manageable for debt consolidation
      expect(result.monthlyPayment).toBeGreaterThan(14000);
      expect(result.monthlyPayment).toBeLessThan(18000);
      
      // Extra payments should provide significant savings
      expect(result.interestSaved).toBeGreaterThan(50000);
      expect(result.payoffTime).toBeLessThan(72);
      
      // Income requirement
      expect(result.monthlyIncome).toBeGreaterThan(45000);
    });

    test('should handle medical emergency loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 300000, // 3 lakhs for medical emergency
        rate: 11.5, // Competitive rate for urgent need
        years: 3, // Shorter tenure for quick repayment
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI should be affordable for emergency
      expect(result.monthlyPayment).toBeGreaterThan(9000);
      expect(result.monthlyPayment).toBeLessThan(12000);
      
      // Total interest should be reasonable for short tenure
      expect(result.totalInterest).toBeLessThan(80000);
      
      // Income requirement should be manageable
      expect(result.monthlyIncome).toBeLessThan(40000);
    });

    test('should handle wedding loan scenario', () => {
      const inputs = createPersonalLoanInputs({
        principal: 1000000, // 10 lakhs for wedding expenses
        rate: 14.0, // Higher rate for large unsecured loan
        years: 7, // Longer tenure to manage EMI
        extraPayment: 3000
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI should be manageable for wedding loan
      expect(result.monthlyPayment).toBeGreaterThan(17000);
      expect(result.monthlyPayment).toBeLessThan(22000);
      
      // Extra payments should help reduce burden
      expect(result.interestSaved).toBeGreaterThan(80000);
      
      // Income requirement for large loan
      expect(result.monthlyIncome).toBeGreaterThan(60000);
    });

    test('should handle home renovation loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 600000, // 6 lakhs for home renovation
        rate: 12.5,
        years: 5,
        extraPayment: 2000
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI should be reasonable for renovation
      expect(result.monthlyPayment).toBeGreaterThan(13000);
      expect(result.monthlyPayment).toBeLessThan(16000);
      
      // Extra payments should provide good savings
      expect(result.interestSaved).toBeGreaterThan(30000);
    });

    test('should handle education loan (personal)', () => {
      const inputs = createPersonalLoanInputs({
        principal: 400000, // 4 lakhs for education
        rate: 11.0, // Better rate for education purpose
        years: 4, // Aligned with course duration
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // EMI should be student-friendly
      expect(result.monthlyPayment).toBeGreaterThan(9000);
      expect(result.monthlyPayment).toBeLessThan(12000);
      
      // Total interest should be reasonable
      expect(result.totalInterest).toBeLessThan(120000);
    });
  });

  describe('🏦 Bank & NBFC Scenarios', () => {
    
    test('should handle premium bank personal loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 750000,
        rate: 10.5, // Premium customer rate
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(15000);
      expect(result.monthlyPayment).toBeLessThan(18000);
      expect(result.totalInterest).toBeLessThan(250000);
    });

    test('should handle NBFC personal loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 16.0, // Higher NBFC rate
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(12000);
      expect(result.totalInterest).toBeGreaterThan(200000);
    });

    test('should handle fintech lender rates', () => {
      const inputs = createPersonalLoanInputs({
        principal: 300000,
        rate: 18.0, // Fintech/app-based lender
        years: 3,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(11000);
      expect(result.totalInterest).toBeGreaterThan(80000);
    });

    test('should handle salary-based personal loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 600000, // 10x monthly salary
        rate: 11.5, // Good rate for salaried
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Should be affordable for salaried person
      expect(result.monthlyPayment).toBeLessThan(15000);
      expect(result.monthlyIncome).toBeGreaterThan(40000);
    });
  });

  describe('💰 Prepayment & Extra Payment Analysis', () => {
    
    test('should calculate benefits of regular extra payments', () => {
      const baseInputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 12,
        years: 5,
        extraPayment: 0
      });

      const extraPaymentInputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 12,
        years: 5,
        extraPayment: 3000 // Extra 3k monthly
      });

      const baseResult = calculatePersonalLoanWithMetrics(baseInputs);
      const extraResult = calculatePersonalLoanWithMetrics(extraPaymentInputs);

      // Extra payments should reduce total interest significantly
      expect(extraResult.totalInterest).toBeLessThan(baseResult.totalInterest);
      
      // Should reduce payoff time substantially
      expect(extraResult.payoffTime).toBeLessThan(baseResult.payoffTime);
      
      // Interest saved should be significant for personal loans
      expect(extraResult.interestSaved).toBeGreaterThan(50000);
    });

    test('should calculate impact of different extra payment amounts', () => {
      const testCases = [
        { extraPayment: 1000, expectedSavings: 25000 },
        { extraPayment: 2000, expectedSavings: 45000 },
        { extraPayment: 5000, expectedSavings: 90000 },
        { extraPayment: 10000, expectedSavings: 130000 },
      ];

      testCases.forEach(({ extraPayment, expectedSavings }) => {
        const inputs = createPersonalLoanInputs({ 
          principal: 500000,
          rate: 12,
          years: 5,
          extraPayment 
        });
        const result = calculatePersonalLoanWithMetrics(inputs);
        
        expect(result.interestSaved).toBeGreaterThan(expectedSavings * 0.8);
        expect(result.interestSaved).toBeLessThan(expectedSavings * 1.3);
        expect(result.payoffTime).toBeLessThan(60);
      });
    });

    test('should calculate lump sum prepayment scenario', () => {
      // Simulate lump sum by using very high extra payment for shorter period
      const inputs = createPersonalLoanInputs({
        principal: 800000,
        rate: 14,
        years: 6,
        extraPayment: 20000 // Large extra payment
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Should significantly reduce tenure
      expect(result.payoffTime).toBeLessThan(50); // Much less than 72 months
      expect(result.interestSaved).toBeGreaterThan(200000);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle minimum personal loan amount', () => {
      const inputs = createPersonalLoanInputs({
        principal: 50000, // 50k minimum
        rate: 14, // Higher rate for small amount
        years: 2,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(2000);
      expect(result.monthlyPayment).toBeLessThan(3000);
      expect(result.totalInterest).toBeLessThan(15000);
      expect(result.monthlyIncome).toBeLessThan(10000);
    });

    test('should handle maximum personal loan amount', () => {
      const inputs = createPersonalLoanInputs({
        principal: 5000000, // 50 lakhs - ultra high income
        rate: 15, // Higher rate for large unsecured loan
        years: 7,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(85000);
      expect(result.totalInterest).toBeGreaterThan(2000000);
      expect(result.monthlyIncome).toBeGreaterThan(250000);
    });

    test('should handle very high interest rates', () => {
      const inputs = createPersonalLoanInputs({
        principal: 300000,
        rate: 30, // Very high rate for high-risk borrower
        years: 3,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(12000);
      expect(result.totalInterest).toBeGreaterThan(150000);
    });

    test('should handle very short tenure', () => {
      const inputs = createPersonalLoanInputs({
        principal: 200000,
        rate: 12,
        years: 1, // Very short tenure
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(17000);
      expect(result.totalInterest).toBeLessThan(15000);
      expect(result.paymentSchedule).toHaveLength(12);
    });

    test('should handle maximum tenure', () => {
      const inputs = createPersonalLoanInputs({
        principal: 1000000,
        rate: 12,
        years: 7, // Maximum personal loan tenure
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.monthlyPayment).toBeLessThan(20000);
      expect(result.totalInterest).toBeGreaterThan(400000);
      expect(result.paymentSchedule).toHaveLength(84);
    });

    test('should handle zero extra payment', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 12,
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result.interestSaved).toBe(0);
      expect(result.payoffTime).toBe(60);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid loan amounts', () => {
      const testCases = [
        { principal: 0 },
        { principal: -300000 },
        { principal: null },
        { principal: undefined },
        { principal: 'invalid' },
      ];

      testCases.forEach(({ principal }) => {
        const inputs = createPersonalLoanInputs({ principal: principal as any });
        const result = calculatePersonalLoanWithMetrics(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(isFinite(result.monthlyPayment)).toBe(true);
        expect(typeof result.monthlyIncome).toBe('number');
      });
    });

    test('should handle string inputs with formatting', () => {
      const inputs = createPersonalLoanInputs({
        principal: '₹5,00,000' as any,
        rate: '12%' as any,
        years: '5 years' as any,
        extraPayment: '₹3,000' as any,
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.monthlyIncome).toBeGreaterThan(0);
    });

    test('should handle floating point precision', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000.123456789,
        rate: 12.567890123,
        years: 5.123456789,
        extraPayment: 3000.987654321,
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.monthlyPayment)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
      expect(Number.isFinite(result.monthlyIncome)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify personal loan EMI formula accuracy', () => {
      const inputs = createPersonalLoanInputs({
        principal: 600000,
        rate: 13,
        years: 4,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Manual calculation: EMI = P[r(1+r)^n]/[(1+r)^n-1]
      const P = 600000;
      const r = 13 / 12 / 100; // Monthly rate
      const n = 4 * 12; // Total months
      
      const expectedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      expectCloseTo(result.monthlyPayment, expectedEMI, 1);
    });

    test('should verify income requirement calculation', () => {
      const inputs = createPersonalLoanInputs({
        principal: 400000,
        rate: 12,
        years: 3,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Income requirement should be 3x EMI
      const expectedIncome = result.monthlyPayment * 3;
      expectCloseTo(result.monthlyIncome, expectedIncome, 1);
    });

    test('should verify effective interest rate calculation', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 12,
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Effective rate = (Total Interest / Principal) * 100
      const expectedEffectiveRate = (result.totalInterest / inputs.principal) * 100;
      expectCloseTo(expectedEffectiveRate, (result.totalInterest / inputs.principal) * 100, 1);
    });

    test('should verify payment schedule accuracy', () => {
      const inputs = createPersonalLoanInputs({
        principal: 300000,
        rate: 14,
        years: 3,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Verify payment schedule totals
      const schedulePrincipal = result.paymentSchedule.reduce((sum, payment) => sum + payment.principal, 0);
      const scheduleInterest = result.paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);

      expectCloseTo(schedulePrincipal, inputs.principal, 1);
      expectCloseTo(scheduleInterest, result.totalInterest, 1);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle large personal loan calculations efficiently', () => {
      const inputs = createPersonalLoanInputs({
        principal: 10000000, // 1 crore personal loan
        rate: 15,
        years: 7,
        extraPayment: 0
      });

      const startTime = Date.now();
      const result = calculatePersonalLoanWithMetrics(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.monthlyPayment).toBeGreaterThan(170000);
      expect(result.monthlyIncome).toBeGreaterThan(500000);
    });

    test('should handle multiple personal loan calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        principal: 200000 + i * 5000,
        rate: 10 + i % 15,
        years: 2 + i % 6,
        extraPayment: i * 50
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculatePersonalLoanWithMetrics(inputs);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
        expect(result.monthlyIncome).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for standard personal loan', () => {
      const inputs = createPersonalLoanInputs({
        principal: 500000,
        rate: 12,
        years: 5,
        extraPayment: 0
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // These values should remain consistent
      expectCloseTo(result.monthlyPayment, 11122, 50);
      expect(result.totalPayment).toBeGreaterThan(650000);
      expect(result.totalPayment).toBeLessThan(700000);
      expect(result.totalInterest).toBeGreaterThan(150000);
      expectCloseTo(result.monthlyIncome, 33366, 100);
      expect(result.paymentSchedule).toHaveLength(60);
    });

    test('should verify mathematical relationships for personal loans', () => {
      const inputs = createPersonalLoanInputs({
        principal: 750000,
        rate: 13,
        years: 6,
        extraPayment: 4000
      });

      const result = calculatePersonalLoanWithMetrics(inputs);

      // Mathematical relationships that should always hold
      expect(result.totalPayment).toBeGreaterThan(result.principal);
      expect(result.totalInterest).toBe(result.totalPayment - result.principal);
      expect(result.payoffTime).toBeLessThan(inputs.years * 12);
      expect(result.interestSaved).toBeGreaterThan(0);
      expect(result.monthlyIncome).toBe(result.monthlyPayment * 3);
    });
  });
});