/**
 * Test Runner Verification
 * Quick smoke test to ensure the test environment is working correctly
 */

import { calculateLoan } from '../../src/lib/calculations/loan';
import { calculateInvestment } from '../../src/lib/calculations/investment';
import type { LoanInputs, InvestmentInputs } from '../../src/lib/validations/calculator';

describe('Test Environment Verification', () => {
  
  test('should import loan calculator successfully', () => {
    expect(calculateLoan).toBeDefined();
    expect(typeof calculateLoan).toBe('function');
  });

  test('should import investment calculator successfully', () => {
    expect(calculateInvestment).toBeDefined();
    expect(typeof calculateInvestment).toBe('function');
  });

  test('should run basic loan calculation', () => {
    const inputs: LoanInputs = {
      principal: 100000,
      rate: 5,
      years: 10,
      extraPayment: 0,
    };
    const result = calculateLoan(inputs);

    expect(result).toBeDefined();
    expect(result.monthlyPayment).toBeGreaterThan(1000);
    expect(result.totalPayment).toBeGreaterThan(100000);
    expect(result.paymentSchedule).toHaveLength(120);
  });

  test('should run basic investment calculation', () => {
    const inputs: InvestmentInputs = {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      years: 10,
      compoundingFrequency: 'monthly',
    };
    const result = calculateInvestment(inputs);

    expect(result).toBeDefined();
    expect(result.finalAmount).toBeGreaterThan(70000);
    expect(result.totalContributions).toBe(70000);
    expect(result.yearlyBreakdown).toHaveLength(10);
  });
});