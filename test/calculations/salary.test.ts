/**
 * Comprehensive Test Suite for Salary Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - CTC to in-hand salary calculations
 */

import { calculateSalary } from '../../src/lib/calculations/tax';
import type { SalaryInputs, SalaryResults } from '../../src/lib/calculations/tax';

describe('Salary Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create salary inputs
  const createSalaryInputs = (overrides: Partial<SalaryInputs> = {}): SalaryInputs => ({
    ctc: 1200000,
    basicPercent: 40,
    hraPercent: 50,
    pfContribution: 12,
    professionalTax: 2400,
    otherAllowances: 100000,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate salary breakdown correctly', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      expect(result.ctc).toBe(1200000);
      expectCloseTo(result.basicSalary, 480000, 2); // 1200000 * 40/100
      expectCloseTo(result.hra, 240000, 2); // 480000 * 50/100
      expect(result.otherAllowances).toBe(100000);
      expectCloseTo(result.grossSalary, 820000, 2); // 480000 + 240000 + 100000
      expectCloseTo(result.pfDeduction, 57600, 2); // 480000 * 12/100
      expectCloseTo(result.professionalTax, 2400, 2);
      expect(result.totalDeductions).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(result.grossSalary);
      expect(result.monthlySalary).toBeCloseTo(result.netSalary / 12);
    });

    test('should calculate salary with different CTC amounts', () => {
      const testCases = [
        { ctc: 600000, expectedBasic: 240000 },
        { ctc: 1000000, expectedBasic: 400000 },
        { ctc: 1800000, expectedBasic: 720000 },
        { ctc: 2500000, expectedBasic: 1000000 },
      ];

      testCases.forEach(({ ctc, expectedBasic }) => {
        const inputs = createSalaryInputs({ 
          ctc,
          basicPercent: 40,
          hraPercent: 50,
          pfContribution: 12 
        });
        const result = calculateSalary(inputs);
        
        expectCloseTo(result.basicSalary, expectedBasic, 2);
        expect(result.ctc).toBe(ctc);
        expect(result.netSalary).toBeLessThan(result.grossSalary);
      });
    });

    test('should calculate salary with different basic percentages', () => {
      const testCases = [
        { basicPercent: 30, expectedBasic: 360000 },
        { basicPercent: 40, expectedBasic: 480000 },
        { basicPercent: 50, expectedBasic: 600000 },
        { basicPercent: 60, expectedBasic: 720000 },
      ];

      testCases.forEach(({ basicPercent, expectedBasic }) => {
        const inputs = createSalaryInputs({ 
          ctc: 1200000,
          basicPercent,
          hraPercent: 50 
        });
        const result = calculateSalary(inputs);
        
        expectCloseTo(result.basicSalary, expectedBasic, 2);
        expectCloseTo(result.hra, expectedBasic * 0.5, 2); // HRA is 50% of basic
      });
    });

    test('should calculate salary with different HRA percentages', () => {
      const testCases = [
        { hraPercent: 40, expectedHRA: 192000 },
        { hraPercent: 50, expectedHRA: 240000 },
        { hraPercent: 60, expectedHRA: 288000 },
      ];

      testCases.forEach(({ hraPercent, expectedHRA }) => {
        const inputs = createSalaryInputs({ 
          ctc: 1200000,
          basicPercent: 40,
          hraPercent 
        });
        const result = calculateSalary(inputs);
        
        expectCloseTo(result.hra, expectedHRA, 2);
        expect(result.basicSalary).toBe(480000); // Should remain constant
      });
    });
  });

  describe('💰 Deduction Calculation Tests', () => {
    
    test('should calculate PF deduction correctly', () => {
      const testCases = [
        { pfContribution: 10, expectedPF: 48000 },
        { pfContribution: 12, expectedPF: 57600 },
        { pfContribution: 15, expectedPF: 72000 },
      ];

      testCases.forEach(({ pfContribution, expectedPF }) => {
        const inputs = createSalaryInputs({ 
          ctc: 1200000,
          basicPercent: 40,
          pfContribution 
        });
        const result = calculateSalary(inputs);
        
        expectCloseTo(result.pfDeduction, expectedPF, 2);
        expect(result.basicSalary).toBe(480000);
      });
    });

    test('should calculate professional tax correctly', () => {
      const testCases = [
        { professionalTax: 1200, expectedMonthly: 100 },
        { professionalTax: 2400, expectedMonthly: 200 },
        { professionalTax: 3600, expectedMonthly: 300 },
      ];

      testCases.forEach(({ professionalTax, expectedMonthly }) => {
        const inputs = createSalaryInputs({ 
          ctc: 1200000,
          professionalTax 
        });
        const result = calculateSalary(inputs);
        
        expectCloseTo(result.professionalTax, professionalTax, 2);
      });
    });

    test('should calculate income tax deduction', () => {
      const inputs = createSalaryInputs({
        ctc: 2000000, // Higher CTC to trigger income tax
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 200000,
      });

      const result = calculateSalary(inputs);

      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.totalDeductions).toBeGreaterThan(result.pfDeduction + result.professionalTax);
    });

    test('should calculate total deductions correctly', () => {
      const inputs = createSalaryInputs({
        ctc: 1500000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 150000,
      });

      const result = calculateSalary(inputs);

      const expectedTotalDeductions = result.pfDeduction + result.professionalTax + result.incomeTax;
      expectCloseTo(result.totalDeductions, expectedTotalDeductions, 2);
    });
  });

  describe('📊 Gross and Net Salary Tests', () => {
    
    test('should calculate gross salary correctly', () => {
      const inputs = createSalaryInputs({
        ctc: 1000000,
        basicPercent: 50,
        hraPercent: 40,
        otherAllowances: 80000,
      });

      const result = calculateSalary(inputs);

      const expectedGross = result.basicSalary + result.hra + result.otherAllowances;
      expectCloseTo(result.grossSalary, expectedGross, 2);
    });

    test('should calculate net salary correctly', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      const expectedNet = result.grossSalary - result.totalDeductions;
      expectCloseTo(result.netSalary, expectedNet, 2);
      expect(result.monthlySalary).toBeCloseTo(result.netSalary / 12);
    });

    test('should verify salary component relationships', () => {
      const inputs = createSalaryInputs({
        ctc: 1800000,
        basicPercent: 45,
        hraPercent: 55,
        pfContribution: 12,
        professionalTax: 3600,
        otherAllowances: 120000,
      });

      const result = calculateSalary(inputs);

      // Basic salary should be percentage of CTC
      expectCloseTo(result.basicSalary, inputs.ctc * inputs.basicPercent / 100, 2);
      
      // HRA should be percentage of basic salary
      expectCloseTo(result.hra, result.basicSalary * inputs.hraPercent / 100, 2);
      
      // PF should be percentage of basic salary
      expectCloseTo(result.pfDeduction, result.basicSalary * inputs.pfContribution / 100, 2);
      
      // Gross should be sum of components
      expectCloseTo(result.grossSalary, result.basicSalary + result.hra + result.otherAllowances, 2);
      
      // Net should be gross minus deductions
      expectCloseTo(result.netSalary, result.grossSalary - result.totalDeductions, 2);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero CTC', () => {
      const inputs = createSalaryInputs({
        ctc: 0,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 0,
        otherAllowances: 0,
      });

      const result = calculateSalary(inputs);

      expect(result.ctc).toBe(0);
      expect(result.basicSalary).toBe(0);
      expect(result.hra).toBe(0);
      expect(result.grossSalary).toBe(0);
      expect(result.pfDeduction).toBe(0);
      expect(result.netSalary).toBe(0);
    });

    test('should handle very high CTC', () => {
      const inputs = createSalaryInputs({
        ctc: 10000000, // 1 crore
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 500000,
      });

      const result = calculateSalary(inputs);

      expect(result.ctc).toBe(10000000);
      expect(result.basicSalary).toBe(4000000);
      expect(result.hra).toBe(2000000);
      expect(result.incomeTax).toBeGreaterThan(500000); // Should have significant tax
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    test('should handle zero basic percentage', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 0,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      expect(result.basicSalary).toBe(0);
      expect(result.hra).toBe(0); // HRA is based on basic
      expect(result.pfDeduction).toBe(0); // PF is based on basic
    });

    test('should handle zero HRA percentage', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 0,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      expect(result.basicSalary).toBe(480000);
      expect(result.hra).toBe(0);
      expect(result.grossSalary).toBe(580000); // Basic + other allowances only
    });

    test('should handle zero PF contribution', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 0,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      expect(result.pfDeduction).toBe(0);
      expect(result.totalDeductions).toBe(result.professionalTax + result.incomeTax);
    });

    test('should handle zero professional tax', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 0,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      expect(result.professionalTax).toBe(0);
      expect(result.totalDeductions).toBe(result.pfDeduction + result.incomeTax);
    });

    test('should handle zero other allowances', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 0,
      });

      const result = calculateSalary(inputs);

      expect(result.otherAllowances).toBe(0);
      expect(result.grossSalary).toBe(result.basicSalary + result.hra);
    });

    test('should handle fractional percentages', () => {
      const inputs = createSalaryInputs({
        ctc: 1234567.89,
        basicPercent: 42.5,
        hraPercent: 47.5,
        pfContribution: 11.5,
        professionalTax: 2345.67,
        otherAllowances: 98765.43,
      });

      const result = calculateSalary(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.basicSalary)).toBe(true);
      expect(Number.isFinite(result.hra)).toBe(true);
      expect(Number.isFinite(result.netSalary)).toBe(true);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid CTC inputs', () => {
      const testCases = [
        { ctc: null },
        { ctc: undefined },
        { ctc: '' },
        { ctc: 'invalid' },
        { ctc: -1200000 }, // Negative CTC
      ];

      testCases.forEach(({ ctc }) => {
        const inputs = createSalaryInputs({ ctc: ctc as any });
        const result = calculateSalary(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.ctc).toBe('number');
        expect(typeof result.netSalary).toBe('number');
        expect(isFinite(result.ctc)).toBe(true);
        expect(isFinite(result.netSalary)).toBe(true);
      });
    });

    test('should handle invalid percentage inputs', () => {
      const testCases = [
        { basicPercent: null },
        { hraPercent: undefined },
        { pfContribution: '' },
        { basicPercent: 'invalid' },
        { hraPercent: -50 }, // Negative percentage
      ];

      testCases.forEach((overrides) => {
        const inputs = createSalaryInputs(overrides as any);
        const result = calculateSalary(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.basicSalary).toBe('number');
        expect(typeof result.hra).toBe('number');
        expect(isFinite(result.basicSalary)).toBe(true);
        expect(isFinite(result.hra)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createSalaryInputs({
        ctc: '₹12,00,000' as any,
        basicPercent: '40%' as any,
        hraPercent: '50%' as any,
        pfContribution: '12%' as any,
        professionalTax: '₹2,400' as any,
        otherAllowances: '₹1,00,000' as any,
      });

      const result = calculateSalary(inputs);

      expect(result).toBeDefined();
      expect(result.ctc).toBeGreaterThan(0);
      expect(result.basicSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeGreaterThan(0);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createSalaryInputs({
        ctc: 1e10, // Very large CTC
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 1e6,
      });

      const result = calculateSalary(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.ctc)).toBe(true);
      expect(isFinite(result.netSalary)).toBe(true);
      expect(isFinite(result.totalDeductions)).toBe(true);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000.123456789,
        basicPercent: 40.987654321,
        hraPercent: 50.123456789,
        pfContribution: 12.345678901,
        professionalTax: 2400.987654321,
        otherAllowances: 100000.123456789,
      });

      const result = calculateSalary(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.basicSalary)).toBe(true);
      expect(Number.isFinite(result.hra)).toBe(true);
      expect(Number.isFinite(result.netSalary)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify basic salary calculation', () => {
      const inputs = createSalaryInputs({
        ctc: 1500000,
        basicPercent: 45,
      });

      const result = calculateSalary(inputs);

      const expectedBasic = 1500000 * 0.45;
      expectCloseTo(result.basicSalary, expectedBasic, 2);
    });

    test('should verify HRA calculation', () => {
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 60,
      });

      const result = calculateSalary(inputs);

      const expectedHRA = result.basicSalary * 0.60;
      expectCloseTo(result.hra, expectedHRA, 2);
    });

    test('should verify PF calculation', () => {
      const inputs = createSalaryInputs({
        ctc: 1000000,
        basicPercent: 50,
        pfContribution: 15,
      });

      const result = calculateSalary(inputs);

      const expectedPF = result.basicSalary * 0.15;
      expectCloseTo(result.pfDeduction, expectedPF, 2);
    });

    test('should verify gross salary calculation', () => {
      const inputs = createSalaryInputs({
        ctc: 1800000,
        basicPercent: 35,
        hraPercent: 45,
        otherAllowances: 200000,
      });

      const result = calculateSalary(inputs);

      const expectedGross = result.basicSalary + result.hra + result.otherAllowances;
      expectCloseTo(result.grossSalary, expectedGross, 2);
    });

    test('should verify net salary calculation', () => {
      const inputs = createSalaryInputs({
        ctc: 1500000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 3600,
        otherAllowances: 150000,
      });

      const result = calculateSalary(inputs);

      const expectedNet = result.grossSalary - result.totalDeductions;
      expectCloseTo(result.netSalary, expectedNet, 2);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        ctc: 500000 + i * 1000,
        basicPercent: 30 + i % 30,
        hraPercent: 40 + i % 20,
        pfContribution: 10 + i % 5,
        professionalTax: 1200 + i * 10,
        otherAllowances: 50000 + i * 100,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateSalary(inputs);
        expect(result).toBeDefined();
        expect(result.netSalary).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle high CTC calculations efficiently', () => {
      const inputs = createSalaryInputs({
        ctc: 50000000, // 5 crores
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 1000000,
      });

      const startTime = Date.now();
      const result = calculateSalary(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.netSalary).toBeGreaterThan(10000000);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createSalaryInputs({
        ctc: 1200000,
        basicPercent: 40,
        hraPercent: 50,
        pfContribution: 12,
        professionalTax: 2400,
        otherAllowances: 100000,
      });

      const result = calculateSalary(inputs);

      // These values should remain consistent across code changes
      expect(result.ctc).toBe(1200000);
      expectCloseTo(result.basicSalary, 480000, 2);
      expectCloseTo(result.hra, 240000, 2);
      expect(result.otherAllowances).toBe(100000);
      expectCloseTo(result.grossSalary, 820000, 2);
      expectCloseTo(result.pfDeduction, 57600, 2);
      expectCloseTo(result.professionalTax, 2400, 2);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { ctc: 0, basicPercent: 40, hraPercent: 50, pfContribution: 12 },
        { ctc: 10000000, basicPercent: 0, hraPercent: 0, pfContribution: 0 },
        { ctc: 1500000, basicPercent: 100, hraPercent: 100, pfContribution: 20 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateSalary(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.ctc).toBe('number');
        expect(typeof result.basicSalary).toBe('number');
        expect(typeof result.hra).toBe('number');
        expect(typeof result.grossSalary).toBe('number');
        expect(typeof result.netSalary).toBe('number');
        
        expect(isFinite(result.ctc)).toBe(true);
        expect(isFinite(result.basicSalary)).toBe(true);
        expect(isFinite(result.hra)).toBe(true);
        expect(isFinite(result.grossSalary)).toBe(true);
        expect(isFinite(result.netSalary)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createSalaryInputs({
        ctc: 1800000,
        basicPercent: 45,
        hraPercent: 55,
        pfContribution: 12,
        professionalTax: 3600,
        otherAllowances: 180000,
      });

      const result = calculateSalary(inputs);

      // Mathematical relationships that should always hold
      expect(result.basicSalary).toBe(inputs.ctc * inputs.basicPercent / 100);
      expect(result.hra).toBe(result.basicSalary * inputs.hraPercent / 100);
      expect(result.pfDeduction).toBe(result.basicSalary * inputs.pfContribution / 100);
      expect(result.professionalTax).toBe(inputs.professionalTax);
      expect(result.grossSalary).toBe(result.basicSalary + result.hra + result.otherAllowances);
      expect(result.totalDeductions).toBe(result.pfDeduction + result.professionalTax + result.incomeTax);
      expect(result.netSalary).toBe(result.grossSalary - result.totalDeductions);
      expect(result.monthlySalary).toBeCloseTo(result.netSalary / 12);
      
      // Logical relationships
      expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
      expect(result.grossSalary).toBeLessThanOrEqual(result.ctc);
      expect(result.totalDeductions).toBeGreaterThanOrEqual(0);
    });
  });
});