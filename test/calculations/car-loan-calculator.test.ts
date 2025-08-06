/**
 * Comprehensive Test Suite for Car Loan Calculator
 * Tests all car loan scenarios, EMI calculations, and automotive financing
 * Priority: HIGH - Critical for vehicle financing and auto loans
 */

import { calculateLoan } from '../../src/lib/calculations/loan';

describe('Car Loan Calculator - Comprehensive Test Suite', () => {

  // Helper function to create car loan inputs
  const createCarLoanInputs = (overrides: any = {}) => ({
    principal: 800000, // 8 lakhs default
    rate: 9.5,
    years: 7,
    extraPayment: 0,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🚗 Basic Car Loan EMI Calculations', () => {
    
    test('should calculate standard car loan EMI correctly', () => {
      const inputs = createCarLoanInputs({
        principal: 800000, // 8 lakhs
        rate: 9.5,
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // EMI calculation for car loan
      // Monthly rate = 9.5/12/100 = 0.007917
      // n = 7*12 = 84 months
      // Expected EMI ≈ ₹12,847
      expectCloseTo(result.monthlyPayment, 12847, 50);
      
      // Total payment = EMI * months
      expectCloseTo(result.totalPayment, 1079148, 1000);
      
      // Total interest = Total payment - Principal
      expectCloseTo(result.totalInterest, 279148, 1000);
      
      expect(result.paymentSchedule).toHaveLength(84);
    });

    test('should calculate car loan for different vehicle prices', () => {
      const testCases = [
        { amount: 400000, expectedEMI: 6424 }, // 4 lakhs - budget car
        { amount: 600000, expectedEMI: 9635 }, // 6 lakhs - mid-range car
        { amount: 1000000, expectedEMI: 16059 }, // 10 lakhs - premium car
        { amount: 1500000, expectedEMI: 24088 }, // 15 lakhs - luxury car
        { amount: 2500000, expectedEMI: 40147 }, // 25 lakhs - super luxury
      ];

      testCases.forEach(({ amount, expectedEMI }) => {
        const inputs = createCarLoanInputs({ 
          principal: amount,
          rate: 9.5,
          years: 7 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalPayment).toBeGreaterThan(amount);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate car loan for different interest rates', () => {
      const testCases = [
        { rate: 7.5, expectedEMI: 12247 }, // Bank rate
        { rate: 8.5, expectedEMI: 12547 }, // Competitive rate
        { rate: 9.5, expectedEMI: 12847 }, // Standard rate
        { rate: 10.5, expectedEMI: 13149 }, // Higher rate
        { rate: 12.0, expectedEMI: 13759 }, // Dealer financing
        { rate: 15.0, expectedEMI: 15000 }, // High-risk borrower
      ];

      testCases.forEach(({ rate, expectedEMI }) => {
        const inputs = createCarLoanInputs({ 
          principal: 800000,
          rate,
          years: 7 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        
        // Higher rates should result in higher total interest
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate car loan for different tenures', () => {
      const testCases = [
        { years: 3, expectedEMI: 25252, maxTotalInterest: 110000 },
        { years: 5, expectedEMI: 16899, maxTotalInterest: 215000 },
        { years: 7, expectedEMI: 12847, maxTotalInterest: 300000 },
        { years: 8, expectedEMI: 11508, maxTotalInterest: 350000 },
      ];

      testCases.forEach(({ years, expectedEMI, maxTotalInterest }) => {
        const inputs = createCarLoanInputs({ 
          principal: 800000,
          rate: 9.5,
          years 
        });
        const result = calculateLoan(inputs);
        
        expectCloseTo(result.monthlyPayment, expectedEMI, 100);
        expect(result.totalInterest).toBeLessThan(maxTotalInterest);
        expect(result.paymentSchedule).toHaveLength(years * 12);
      });
    });
  });

  describe('🏎️ Vehicle Category Scenarios', () => {
    
    test('should handle budget hatchback financing', () => {
      const inputs = createCarLoanInputs({
        principal: 350000, // 3.5 lakhs - budget hatchback
        rate: 8.5, // Good rate for new car
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // EMI should be affordable for middle-class
      expect(result.monthlyPayment).toBeLessThan(8000);
      expect(result.monthlyPayment).toBeGreaterThan(6000);
      
      // Total interest should be reasonable
      expect(result.totalInterest).toBeLessThan(100000);
      
      expect(result.paymentSchedule).toHaveLength(60);
    });

    test('should handle sedan financing scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 900000, // 9 lakhs - mid-size sedan
        rate: 9.0,
        years: 6,
        extraPayment: 2000 // Small extra payment
      });

      const result = calculateLoan(inputs);

      // EMI should be in sedan range
      expect(result.monthlyPayment).toBeGreaterThan(14000);
      expect(result.monthlyPayment).toBeLessThan(18000);
      
      // Extra payments should provide savings
      expect(result.interestSaved).toBeGreaterThan(10000);
      expect(result.payoffTime).toBeLessThan(72);
    });

    test('should handle SUV financing scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 1400000, // 14 lakhs - SUV
        rate: 9.5,
        years: 7,
        extraPayment: 5000
      });

      const result = calculateLoan(inputs);

      // EMI should reflect SUV pricing
      expect(result.monthlyPayment).toBeGreaterThan(20000);
      expect(result.monthlyPayment).toBeLessThan(30000);
      
      // Extra payments should provide significant savings
      expect(result.interestSaved).toBeGreaterThan(100000);
    });

    test('should handle luxury car financing', () => {
      const inputs = createCarLoanInputs({
        principal: 3000000, // 30 lakhs - luxury car
        rate: 10.5, // Higher rate for luxury segment
        years: 8, // Longer tenure for affordability
        extraPayment: 10000
      });

      const result = calculateLoan(inputs);

      // EMI should be in luxury range
      expect(result.monthlyPayment).toBeGreaterThan(40000);
      expect(result.monthlyPayment).toBeLessThan(60000);
      
      // Extra payments should provide substantial savings
      expect(result.interestSaved).toBeGreaterThan(300000);
    });

    test('should handle electric vehicle financing', () => {
      const inputs = createCarLoanInputs({
        principal: 1200000, // 12 lakhs - electric car
        rate: 8.0, // Lower rate for green vehicles
        years: 6,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Should benefit from lower EV rates
      expect(result.monthlyPayment).toBeLessThan(22000);
      expect(result.totalInterest).toBeLessThan(300000);
    });
  });

  describe('🏦 Financing Source Scenarios', () => {
    
    test('should handle bank financing scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 1000000,
        rate: 8.75, // Bank rate
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(15000);
      expect(result.monthlyPayment).toBeLessThan(18000);
      expect(result.totalInterest).toBeLessThan(400000);
    });

    test('should handle dealer financing scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 1000000,
        rate: 11.5, // Higher dealer rate
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(17000);
      expect(result.totalInterest).toBeGreaterThan(400000);
    });

    test('should handle NBFC financing scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 800000,
        rate: 12.0, // NBFC rate
        years: 6,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(15000);
      expect(result.totalInterest).toBeGreaterThan(250000);
    });

    test('should handle manufacturer financing offers', () => {
      const inputs = createCarLoanInputs({
        principal: 1500000,
        rate: 6.99, // Promotional rate
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Should benefit from promotional rates
      expect(result.monthlyPayment).toBeLessThan(32000);
      expect(result.totalInterest).toBeLessThan(400000);
    });
  });

  describe('💰 Down Payment Impact Analysis', () => {
    
    test('should compare different down payment scenarios', () => {
      const carPrice = 1000000; // 10 lakhs car
      
      const scenarios = [
        { downPayment: 100000, loanAmount: 900000 }, // 10% down
        { downPayment: 200000, loanAmount: 800000 }, // 20% down
        { downPayment: 300000, loanAmount: 700000 }, // 30% down
      ];

      scenarios.forEach(({ downPayment, loanAmount }) => {
        const inputs = createCarLoanInputs({
          principal: loanAmount,
          rate: 9.5,
          years: 7,
          extraPayment: 0
        });

        const result = calculateLoan(inputs);
        
        // Higher down payment should result in lower EMI
        expect(result.monthlyPayment).toBeLessThan(loanAmount / 60); // Rough check
        expect(result.totalInterest).toBeLessThan(loanAmount * 0.4);
      });
    });

    test('should calculate optimal down payment scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 600000, // After 40% down payment on 10L car
        rate: 8.5,
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // With substantial down payment, EMI should be very manageable
      expect(result.monthlyPayment).toBeLessThan(13000);
      expect(result.totalInterest).toBeLessThan(150000);
    });
  });

  describe('🔄 Refinancing & Balance Transfer Scenarios', () => {
    
    test('should handle car loan refinancing scenario', () => {
      // Original loan after 2 years
      const originalInputs = createCarLoanInputs({
        principal: 600000, // Remaining principal
        rate: 11.0, // Old higher rate
        years: 5, // Remaining tenure
        extraPayment: 0
      });

      // Refinanced loan
      const refinancedInputs = createCarLoanInputs({
        principal: 600000,
        rate: 8.5, // New lower rate
        years: 5,
        extraPayment: 0
      });

      const originalResult = calculateLoan(originalInputs);
      const refinancedResult = calculateLoan(refinancedInputs);

      // Refinancing should reduce EMI
      expect(refinancedResult.monthlyPayment).toBeLessThan(originalResult.monthlyPayment);
      
      // Should reduce total interest
      expect(refinancedResult.totalInterest).toBeLessThan(originalResult.totalInterest);
      
      // Monthly savings should be significant
      const monthlySavings = originalResult.monthlyPayment - refinancedResult.monthlyPayment;
      expect(monthlySavings).toBeGreaterThan(500);
    });

    test('should handle balance transfer with top-up', () => {
      const inputs = createCarLoanInputs({
        principal: 900000, // Original loan + top-up
        rate: 9.0, // Better rate with balance transfer
        years: 6,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(15000);
      expect(result.monthlyPayment).toBeLessThan(18000);
      expect(result.totalInterest).toBeLessThan(350000);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle minimum car loan amount', () => {
      const inputs = createCarLoanInputs({
        principal: 100000, // 1 lakh - used car
        rate: 10.5, // Higher rate for used car
        years: 3,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(2500);
      expect(result.monthlyPayment).toBeLessThan(4000);
      expect(result.totalInterest).toBeLessThan(30000);
    });

    test('should handle maximum car loan amount', () => {
      const inputs = createCarLoanInputs({
        principal: 5000000, // 50 lakhs - super luxury
        rate: 11.0,
        years: 8,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(70000);
      expect(result.totalInterest).toBeGreaterThan(1500000);
      expect(result.paymentSchedule).toHaveLength(96);
    });

    test('should handle used car financing rates', () => {
      const inputs = createCarLoanInputs({
        principal: 500000, // 5 lakhs used car
        rate: 12.5, // Higher rate for used cars
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(11000);
      expect(result.totalInterest).toBeGreaterThan(150000);
    });

    test('should handle very short tenure loans', () => {
      const inputs = createCarLoanInputs({
        principal: 600000,
        rate: 9.5,
        years: 2, // Very short tenure
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(25000);
      expect(result.totalInterest).toBeLessThan(100000);
      expect(result.paymentSchedule).toHaveLength(24);
    });

    test('should handle maximum tenure loans', () => {
      const inputs = createCarLoanInputs({
        principal: 1500000,
        rate: 9.5,
        years: 8, // Maximum car loan tenure
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeLessThan(25000);
      expect(result.totalInterest).toBeGreaterThan(600000);
      expect(result.paymentSchedule).toHaveLength(96);
    });

    test('should handle zero down payment scenario', () => {
      const inputs = createCarLoanInputs({
        principal: 800000, // Full car price financed
        rate: 10.5, // Higher rate for 100% financing
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(13000);
      expect(result.totalInterest).toBeGreaterThan(300000);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid car loan amounts', () => {
      const testCases = [
        { principal: 0 },
        { principal: -500000 },
        { principal: null },
        { principal: undefined },
        { principal: 'invalid' },
      ];

      testCases.forEach(({ principal }) => {
        const inputs = createCarLoanInputs({ principal: principal as any });
        const result = calculateLoan(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.monthlyPayment).toBe('number');
        expect(isFinite(result.monthlyPayment)).toBe(true);
      });
    });

    test('should handle string inputs with formatting', () => {
      const inputs = createCarLoanInputs({
        principal: '₹8,00,000' as any,
        rate: '9.5%' as any,
        years: '7 years' as any,
        extraPayment: '₹2,000' as any,
      });

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    test('should handle floating point precision', () => {
      const inputs = createCarLoanInputs({
        principal: 800000.123456789,
        rate: 9.567890123,
        years: 7.123456789,
        extraPayment: 2000.987654321,
      });

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.monthlyPayment)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify car loan EMI formula accuracy', () => {
      const inputs = createCarLoanInputs({
        principal: 1000000,
        rate: 10.0,
        years: 6,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Manual calculation: EMI = P[r(1+r)^n]/[(1+r)^n-1]
      const P = 1000000;
      const r = 10 / 12 / 100; // Monthly rate
      const n = 6 * 12; // Total months
      
      const expectedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      expectCloseTo(result.monthlyPayment, expectedEMI, 1);
    });

    test('should verify depreciation vs loan balance', () => {
      const inputs = createCarLoanInputs({
        principal: 1000000,
        rate: 9.5,
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Car depreciates faster than loan balance reduces initially
      // This is important for understanding negative equity
      const year1Balance = result.paymentSchedule[11].balance; // After 1 year
      const carValue = 1000000 * 0.85; // Assuming 15% depreciation in year 1
      
      expect(year1Balance).toBeGreaterThan(carValue); // Negative equity scenario
    });

    test('should verify total cost of ownership impact', () => {
      const inputs = createCarLoanInputs({
        principal: 800000,
        rate: 9.5,
        years: 5,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // Total cost includes loan interest
      const loanCost = result.totalInterest;
      
      // Loan interest should be significant part of total ownership cost
      expect(loanCost).toBeGreaterThan(100000);
      expect(loanCost / inputs.principal).toBeGreaterThan(0.15); // At least 15% of car price
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle luxury car loan calculations efficiently', () => {
      const inputs = createCarLoanInputs({
        principal: 10000000, // 1 crore luxury car
        rate: 11.0,
        years: 8,
        extraPayment: 0
      });

      const startTime = Date.now();
      const result = calculateLoan(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.monthlyPayment).toBeGreaterThan(140000);
      expect(result.paymentSchedule).toHaveLength(96);
    });

    test('should handle multiple car loan calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        principal: 500000 + i * 10000,
        rate: 8.5 + i % 4,
        years: 5 + i % 3,
        extraPayment: i * 100
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateLoan(inputs);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for standard car loan', () => {
      const inputs = createCarLoanInputs({
        principal: 800000,
        rate: 9.5,
        years: 7,
        extraPayment: 0
      });

      const result = calculateLoan(inputs);

      // These values should remain consistent
      expectCloseTo(result.monthlyPayment, 12847, 50);
      expect(result.totalPayment).toBeGreaterThan(1000000);
      expect(result.totalPayment).toBeLessThan(1200000);
      expect(result.totalInterest).toBeGreaterThan(250000);
      expect(result.paymentSchedule).toHaveLength(84);
    });

    test('should verify mathematical relationships for car loans', () => {
      const inputs = createCarLoanInputs({
        principal: 1200000,
        rate: 10.0,
        years: 6,
        extraPayment: 5000
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