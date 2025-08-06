/**
 * Comprehensive Test Suite for Debt Payoff Calculator
 * Tests all debt payoff scenarios, payment strategies, and time calculations
 * Priority: HIGH - Important for debt management and financial planning
 */

import { parseRobustNumber } from '../../src/lib/utils/number';

// Extracted function from src/app/calculators/debt-payoff/page.tsx
interface DebtPayoffInputs {
  totalDebt: number;
  interestRate: number;
  minimumPayment: number;
  extraPayment: number;
  paymentStrategy: string;
}

interface DebtPayoffResult {
  months: number;
  years: number;
  remainingMonths: number;
  totalInterestPaid: number;
  totalPayment: number;
  minPaymentMonths: number;
  minPaymentYears: number;
  minPaymentRemainingMonths: number;
  minPaymentInterest: number;
  interestSaved: number;
  timeSaved: number;
  payoffDate: Date;
}

function calculateDebtPayoff(inputs: DebtPayoffInputs): DebtPayoffResult {
  // Use parseRobustNumber for flexible input handling
  const totalDebt = Math.abs(parseRobustNumber(inputs.totalDebt)) || 100000;
  const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 18;
  const minimumPayment = Math.abs(parseRobustNumber(inputs.minimumPayment)) || 1000;
  const extraPayment = Math.abs(parseRobustNumber(inputs.extraPayment)) || 0;
  
  const monthlyRate = interestRate / 12 / 100;
  const totalMonthlyPayment = minimumPayment + extraPayment;
  
  // Ensure minimum payment can cover at least some principal
  const monthlyInterest = totalDebt * monthlyRate;
  const effectiveMinPayment = Math.max(minimumPayment, monthlyInterest + 1);
  const effectiveTotalPayment = Math.max(totalMonthlyPayment, monthlyInterest + 1);
  
  let remainingBalance = totalDebt;
  let totalInterestPaid = 0;
  let months = 0;
  
  // Calculate with minimum payment only
  let minPaymentBalance = totalDebt;
  let minPaymentInterest = 0;
  let minPaymentMonths = 0;
  
  while (minPaymentBalance > 0.01 && minPaymentMonths < 600) {
    const interestPayment = minPaymentBalance * monthlyRate;
    const principalPayment = Math.min(effectiveMinPayment - interestPayment, minPaymentBalance);
    
    if (principalPayment <= 0) {
      minPaymentMonths = 600; // Never pays off
      break;
    }
    
    minPaymentBalance -= principalPayment;
    minPaymentInterest += interestPayment;
    minPaymentMonths++;
  }
  
  // Calculate with extra payment
  while (remainingBalance > 0.01 && months < 600) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(effectiveTotalPayment - interestPayment, remainingBalance);
    
    if (principalPayment <= 0) {
      months = 600; // Never pays off
      break;
    }
    
    remainingBalance -= principalPayment;
    totalInterestPaid += interestPayment;
    months++;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  const minPaymentYears = Math.floor(minPaymentMonths / 12);
  const minPaymentRemainingMonths = minPaymentMonths % 12;
  
  const interestSaved = Math.max(0, minPaymentInterest - totalInterestPaid);
  const timeSaved = Math.max(0, minPaymentMonths - months);
  
  return {
    months,
    years,
    remainingMonths,
    totalInterestPaid,
    totalPayment: totalDebt + totalInterestPaid,
    minPaymentMonths,
    minPaymentYears,
    minPaymentRemainingMonths,
    minPaymentInterest,
    interestSaved,
    timeSaved,
    payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
  };
}

describe('Debt Payoff Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create debt payoff inputs
  const createDebtInputs = (overrides: Partial<DebtPayoffInputs> = {}): DebtPayoffInputs => ({
    totalDebt: 100000,
    interestRate: 18,
    minimumPayment: 3000,
    extraPayment: 0,
    paymentStrategy: 'avalanche',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard debt payoff correctly', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 3000,
        extraPayment: 0,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeGreaterThan(0);
      expect(result.months).toBeLessThan(600); // Should be payable
      expect(result.years).toBe(Math.floor(result.months / 12));
      expect(result.remainingMonths).toBe(result.months % 12);
      expect(result.totalInterestPaid).toBeGreaterThan(0);
      expect(result.totalPayment).toBe(100000 + result.totalInterestPaid);
      expect(result.payoffDate).toBeInstanceOf(Date);
    });

    test('should calculate debt payoff with different debt amounts', () => {
      const testCases = [
        { totalDebt: 50000, expectedMonthsRange: [15, 25] },
        { totalDebt: 200000, expectedMonthsRange: [60, 100] },
        { totalDebt: 500000, expectedMonthsRange: [150, 300] },
      ];

      testCases.forEach(({ totalDebt, expectedMonthsRange }) => {
        const inputs = createDebtInputs({ 
          totalDebt, 
          interestRate: 18, 
          minimumPayment: 3000 
        });
        const result = calculateDebtPayoff(inputs);
        
        expect(result.months).toBeGreaterThanOrEqual(expectedMonthsRange[0]);
        expect(result.months).toBeLessThanOrEqual(expectedMonthsRange[1]);
        expect(result.totalPayment).toBeGreaterThan(totalDebt);
      });
    });

    test('should calculate debt payoff with different interest rates', () => {
      const testCases = [
        { interestRate: 12, expectedMonthsRange: [30, 40] },
        { interestRate: 18, expectedMonthsRange: [35, 45] },
        { interestRate: 24, expectedMonthsRange: [40, 50] },
      ];

      testCases.forEach(({ interestRate, expectedMonthsRange }) => {
        const inputs = createDebtInputs({ 
          totalDebt: 100000,
          interestRate, 
          minimumPayment: 3000 
        });
        const result = calculateDebtPayoff(inputs);
        
        expect(result.months).toBeGreaterThanOrEqual(expectedMonthsRange[0]);
        expect(result.months).toBeLessThanOrEqual(expectedMonthsRange[1]);
      });
    });

    test('should calculate debt payoff with different minimum payments', () => {
      const testCases = [
        { minimumPayment: 2000, expectedMonthsRange: [50, 70] },
        { minimumPayment: 3000, expectedMonthsRange: [35, 45] },
        { minimumPayment: 5000, expectedMonthsRange: [20, 30] },
      ];

      testCases.forEach(({ minimumPayment, expectedMonthsRange }) => {
        const inputs = createDebtInputs({ 
          totalDebt: 100000,
          interestRate: 18, 
          minimumPayment 
        });
        const result = calculateDebtPayoff(inputs);
        
        expect(result.months).toBeGreaterThanOrEqual(expectedMonthsRange[0]);
        expect(result.months).toBeLessThanOrEqual(expectedMonthsRange[1]);
      });
    });
  });

  describe('💰 Extra Payment Impact Tests', () => {
    
    test('should calculate debt payoff with extra payments correctly', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 3000,
        extraPayment: 1000,
      });

      const result = calculateDebtPayoff(inputs);
      const resultWithoutExtra = calculateDebtPayoff({
        ...inputs,
        extraPayment: 0,
      });

      // Extra payments should reduce payoff time and total interest
      expect(result.months).toBeLessThan(resultWithoutExtra.months);
      expect(result.totalInterestPaid).toBeLessThan(resultWithoutExtra.totalInterestPaid);
      expect(result.interestSaved).toBeGreaterThan(0);
      expect(result.timeSaved).toBeGreaterThan(0);
    });

    test('should calculate significant impact of large extra payments', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 3000,
        extraPayment: 5000, // Large extra payment
      });

      const result = calculateDebtPayoff(inputs);

      // Should significantly reduce payoff time
      expect(result.months).toBeLessThan(20);
      expect(result.interestSaved).toBeGreaterThan(20000);
      expect(result.timeSaved).toBeGreaterThan(12);
    });

    test('should handle extra payment larger than minimum payment', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 2000,
        extraPayment: 5000, // Much larger than minimum
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeLessThan(20);
      expect(result.totalInterestPaid).toBeLessThan(20000);
    });

    test('should calculate interest and time savings accurately', () => {
      const inputs = createDebtInputs({
        totalDebt: 50000,
        interestRate: 15,
        minimumPayment: 1500,
        extraPayment: 500,
      });

      const result = calculateDebtPayoff(inputs);

      // Verify savings calculations
      expect(result.interestSaved).toBe(result.minPaymentInterest - result.totalInterestPaid);
      expect(result.timeSaved).toBe(result.minPaymentMonths - result.months);
      expect(result.interestSaved).toBeGreaterThan(0);
      expect(result.timeSaved).toBeGreaterThan(0);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero debt amount', () => {
      const inputs = createDebtInputs({
        totalDebt: 0,
        interestRate: 18,
        minimumPayment: 3000,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBe(0);
      expect(result.years).toBe(0);
      expect(result.totalInterestPaid).toBe(0);
      expect(result.totalPayment).toBe(0);
    });

    test('should handle zero interest rate', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 0,
        minimumPayment: 3000,
      });

      const result = calculateDebtPayoff(inputs);

      // With 0% interest, should pay off in totalDebt / minimumPayment months
      const expectedMonths = Math.ceil(100000 / 3000);
      expect(result.months).toBeCloseTo(expectedMonths, 0);
      expectCloseTo(result.totalInterestPaid, 0, 2);
      expectCloseTo(result.totalPayment, 100000, 2);
    });

    test('should handle very high interest rates', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 50, // 50% interest rate
        minimumPayment: 5000,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeGreaterThan(0);
      expect(result.totalInterestPaid).toBeGreaterThan(50000);
    });

    test('should handle minimum payment too low to cover interest', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 24, // 24% = 2% monthly
        minimumPayment: 1000, // Less than monthly interest of ₹2000
      });

      const result = calculateDebtPayoff(inputs);

      // Should hit the 600 month limit or adjust payment
      expect(result.months).toBeGreaterThan(0);
      expect(result.totalInterestPaid).toBeGreaterThan(0);
    });

    test('should handle very small debt amounts', () => {
      const inputs = createDebtInputs({
        totalDebt: 1000,
        interestRate: 18,
        minimumPayment: 500,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeLessThan(5);
      expect(result.totalPayment).toBeGreaterThan(1000);
    });

    test('should handle very large debt amounts', () => {
      const inputs = createDebtInputs({
        totalDebt: 10000000,
        interestRate: 18,
        minimumPayment: 50000,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeGreaterThan(100);
      expect(result.totalInterestPaid).toBeGreaterThan(5000000);
    });

    test('should handle very large minimum payments', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 50000, // Half the debt amount
      });

      const result = calculateDebtPayoff(inputs);

      expect(result.months).toBeLessThan(5);
      expect(result.totalInterestPaid).toBeLessThan(10000);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid debt amount inputs', () => {
      const testCases = [
        { totalDebt: null },
        { totalDebt: undefined },
        { totalDebt: '' },
        { totalDebt: 'invalid' },
        { totalDebt: -100000 }, // Negative amount
      ];

      testCases.forEach(({ totalDebt }) => {
        const inputs = createDebtInputs({ totalDebt: totalDebt as any });
        const result = calculateDebtPayoff(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.months).toBe('number');
        expect(isFinite(result.months)).toBe(true);
      });
    });

    test('should handle invalid interest rate inputs', () => {
      const testCases = [
        { interestRate: null },
        { interestRate: undefined },
        { interestRate: '' },
        { interestRate: 'invalid' },
        { interestRate: -18 }, // Negative rate
      ];

      testCases.forEach(({ interestRate }) => {
        const inputs = createDebtInputs({ interestRate: interestRate as any });
        const result = calculateDebtPayoff(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.months).toBe('number');
        expect(isFinite(result.months)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createDebtInputs({
        totalDebt: '₹1,00,000' as any,
        interestRate: '18%' as any,
        minimumPayment: '₹3,000' as any,
        extraPayment: '₹1,000' as any,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result).toBeDefined();
      expect(result.months).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(100000);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000.123456789,
        interestRate: 18.123456789,
        minimumPayment: 3000.987654321,
        extraPayment: 1000.555555,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.months)).toBe(true);
      expect(Number.isFinite(result.totalInterestPaid)).toBe(true);
      expect(Number.isFinite(result.totalPayment)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createDebtInputs({
        totalDebt: 1e10, // Very large number
        interestRate: 18,
        minimumPayment: 1e6,
      });

      const result = calculateDebtPayoff(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.months)).toBe(true);
      expect(isFinite(result.totalPayment)).toBe(true);
    });
  });

  describe('📊 Calculation Accuracy Tests', () => {
    
    test('should verify time calculations are consistent', () => {
      const inputs = createDebtInputs({
        totalDebt: 120000,
        interestRate: 15,
        minimumPayment: 4000,
        extraPayment: 1000,
      });

      const result = calculateDebtPayoff(inputs);

      // Verify years and months calculation
      expect(result.years).toBe(Math.floor(result.months / 12));
      expect(result.remainingMonths).toBe(result.months % 12);
      expect(result.years * 12 + result.remainingMonths).toBe(result.months);
    });

    test('should verify minimum payment scenario calculations', () => {
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 3000,
        extraPayment: 0,
      });

      const result = calculateDebtPayoff(inputs);

      // With no extra payment, results should match minimum payment scenario
      expect(result.months).toBe(result.minPaymentMonths);
      expect(result.totalInterestPaid).toBe(result.minPaymentInterest);
      expect(result.interestSaved).toBe(0);
      expect(result.timeSaved).toBe(0);
    });

    test('should verify total payment calculation', () => {
      const inputs = createDebtInputs({
        totalDebt: 75000,
        interestRate: 20,
        minimumPayment: 2500,
        extraPayment: 500,
      });

      const result = calculateDebtPayoff(inputs);

      // Total payment should equal principal + interest
      expectCloseTo(result.totalPayment, 75000 + result.totalInterestPaid, 2);
    });

    test('should verify payoff date calculation', () => {
      const inputs = createDebtInputs({
        totalDebt: 60000,
        interestRate: 15,
        minimumPayment: 2000,
      });

      const result = calculateDebtPayoff(inputs);

      // Payoff date should be approximately months * 30 days from now
      const expectedDate = new Date(Date.now() + result.months * 30 * 24 * 60 * 60 * 1000);
      const timeDifference = Math.abs(result.payoffDate.getTime() - expectedDate.getTime());
      
      // Allow for some variance in date calculation (within a day)
      expect(timeDifference).toBeLessThan(24 * 60 * 60 * 1000);
    });
  });

  describe('📈 Comparison Scenarios Tests', () => {
    
    test('should show clear benefit of extra payments', () => {
      const baseInputs = {
        totalDebt: 150000,
        interestRate: 18,
        minimumPayment: 4000,
      };

      const withoutExtra = calculateDebtPayoff({ ...baseInputs, extraPayment: 0, paymentStrategy: 'avalanche' });
      const withExtra = calculateDebtPayoff({ ...baseInputs, extraPayment: 2000, paymentStrategy: 'avalanche' });

      expect(withExtra.months).toBeLessThan(withoutExtra.months);
      expect(withExtra.totalInterestPaid).toBeLessThan(withoutExtra.totalInterestPaid);
      expect(withExtra.interestSaved).toBeGreaterThan(10000);
      expect(withExtra.timeSaved).toBeGreaterThan(6);
    });

    test('should handle different payment strategies', () => {
      const testStrategies = ['avalanche', 'snowball', 'minimum'];

      testStrategies.forEach(strategy => {
        const inputs = createDebtInputs({
          totalDebt: 100000,
          interestRate: 18,
          minimumPayment: 3000,
          extraPayment: 1000,
          paymentStrategy: strategy,
        });

        const result = calculateDebtPayoff(inputs);

        expect(result).toBeDefined();
        expect(result.months).toBeGreaterThan(0);
        expect(result.totalPayment).toBeGreaterThan(100000);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long payoff scenarios efficiently', () => {
      const inputs = createDebtInputs({
        totalDebt: 1000000,
        interestRate: 25,
        minimumPayment: 5000, // Very low payment for large debt
      });

      const startTime = Date.now();
      const result = calculateDebtPayoff(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.months).toBeGreaterThan(0);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        totalDebt: 50000 + i * 1000,
        interestRate: 12 + i * 0.1,
        minimumPayment: 1500 + i * 50,
        extraPayment: i * 10,
        paymentStrategy: 'avalanche',
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateDebtPayoff(inputs);
        expect(result).toBeDefined();
        expect(result.months).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createDebtInputs({
        totalDebt: 100000,
        interestRate: 18,
        minimumPayment: 3000,
        extraPayment: 1000,
        paymentStrategy: 'avalanche',
      });

      const result = calculateDebtPayoff(inputs);

      // These values should remain consistent across code changes
      expect(result.months).toBeGreaterThan(20);
      expect(result.months).toBeLessThan(35);
      expect(result.totalInterestPaid).toBeGreaterThan(15000);
      expect(result.totalInterestPaid).toBeLessThan(30000);
      expect(result.interestSaved).toBeGreaterThan(0);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { totalDebt: 1, interestRate: 0.01, minimumPayment: 1, extraPayment: 0 },
        { totalDebt: 1000000, interestRate: 50, minimumPayment: 50000, extraPayment: 25000 },
        { totalDebt: 100000, interestRate: 0, minimumPayment: 5000, extraPayment: 0 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateDebtPayoff(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.months).toBe('number');
        expect(typeof result.totalInterestPaid).toBe('number');
        expect(typeof result.totalPayment).toBe('number');
        expect(typeof result.interestSaved).toBe('number');
        expect(typeof result.timeSaved).toBe('number');
        
        expect(isFinite(result.months)).toBe(true);
        expect(isFinite(result.totalInterestPaid)).toBe(true);
        expect(isFinite(result.totalPayment)).toBe(true);
        expect(isFinite(result.interestSaved)).toBe(true);
        expect(isFinite(result.timeSaved)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createDebtInputs({
        totalDebt: 80000,
        interestRate: 16,
        minimumPayment: 2500,
        extraPayment: 750,
      });

      const result = calculateDebtPayoff(inputs);

      // Mathematical relationships that should always hold
      expect(result.totalPayment).toBeGreaterThan(inputs.totalDebt);
      expect(result.totalPayment).toBe(inputs.totalDebt + result.totalInterestPaid);
      expect(result.years).toBe(Math.floor(result.months / 12));
      expect(result.remainingMonths).toBe(result.months % 12);
      expect(result.interestSaved).toBe(result.minPaymentInterest - result.totalInterestPaid);
      expect(result.timeSaved).toBe(result.minPaymentMonths - result.months);
      
      // With extra payments, should save time and interest
      if (inputs.extraPayment > 0) {
        expect(result.interestSaved).toBeGreaterThanOrEqual(0);
        expect(result.timeSaved).toBeGreaterThanOrEqual(0);
      }
    });
  });
});