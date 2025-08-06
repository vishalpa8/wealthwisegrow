/**
 * Comprehensive Test Suite for HRA Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - House Rent Allowance tax exemption calculations
 */

import { calculateHRA } from '../../src/lib/calculations/tax';
import type { HRAInputs, HRAResults } from '../../src/lib/calculations/tax';

describe('HRA Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create HRA inputs
  const createHRAInputs = (overrides: Partial<HRAInputs> = {}): HRAInputs => ({
    basicSalary: 50000,
    hraReceived: 25000,
    rentPaid: 20000,
    cityType: 'metro',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate HRA exemption for metro city correctly', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 25000,
        rentPaid: 20000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result.hraReceived).toBe(25000);
      
      // HRA exemption calculations for metro city
      const expectedHRAPercent = 50000 * 0.50; // 50% of basic for metro
      const expectedRentMinus10Percent = 20000 - (50000 * 0.10); // Rent - 10% of basic
      
      expect(result.exemptionCalculations.actualHRA).toBe(25000);
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
      expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10Percent, 2);
      
      // HRA exemption should be minimum of the three
      const expectedExemption = Math.min(25000, expectedHRAPercent, expectedRentMinus10Percent);
      expectCloseTo(result.hraExemption, expectedExemption, 2);
      expectCloseTo(result.taxableHRA, 25000 - expectedExemption, 2);
    });

    test('should calculate HRA exemption for non-metro city correctly', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 20000,
        rentPaid: 18000,
        cityType: 'non-metro',
      });

      const result = calculateHRA(inputs);

      expect(result.hraReceived).toBe(20000);
      
      // HRA exemption calculations for non-metro city
      const expectedHRAPercent = 50000 * 0.40; // 40% of basic for non-metro
      const expectedRentMinus10Percent = 18000 - (50000 * 0.10); // Rent - 10% of basic
      
      expect(result.exemptionCalculations.actualHRA).toBe(20000);
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
      expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10Percent, 2);
      
      // HRA exemption should be minimum of the three
      const expectedExemption = Math.min(20000, expectedHRAPercent, expectedRentMinus10Percent);
      expectCloseTo(result.hraExemption, expectedExemption, 2);
      expectCloseTo(result.taxableHRA, 20000 - expectedExemption, 2);
    });

    test('should calculate HRA with different basic salaries', () => {
      const testCases = [
        { basicSalary: 30000, expectedHRAPercent: 15000 }, // 30000 * 0.50
        { basicSalary: 60000, expectedHRAPercent: 30000 }, // 60000 * 0.50
        { basicSalary: 100000, expectedHRAPercent: 50000 }, // 100000 * 0.50
      ];

      testCases.forEach(({ basicSalary, expectedHRAPercent }) => {
        const inputs = createHRAInputs({ 
          basicSalary,
          hraReceived: 25000,
          rentPaid: 20000,
          cityType: 'metro' 
        });
        const result = calculateHRA(inputs);
        
        expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
        expect(result.exemptionCalculations.actualHRA).toBe(25000);
      });
    });

    test('should calculate HRA with different rent amounts', () => {
      const testCases = [
        { rentPaid: 15000, expectedRentMinus10: 10000 }, // 15000 - 5000
        { rentPaid: 25000, expectedRentMinus10: 20000 }, // 25000 - 5000
        { rentPaid: 35000, expectedRentMinus10: 30000 }, // 35000 - 5000
      ];

      testCases.forEach(({ rentPaid, expectedRentMinus10 }) => {
        const inputs = createHRAInputs({ 
          basicSalary: 50000,
          hraReceived: 25000,
          rentPaid,
          cityType: 'metro' 
        });
        const result = calculateHRA(inputs);
        
        expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10, 2);
      });
    });
  });

  describe('🏙️ City Type Tests', () => {
    
    test('should apply correct HRA percentage for metro cities', () => {
      const inputs = createHRAInputs({
        basicSalary: 60000,
        hraReceived: 30000,
        rentPaid: 25000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // Metro cities get 50% of basic salary
      const expectedHRAPercent = 60000 * 0.50;
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
    });

    test('should apply correct HRA percentage for non-metro cities', () => {
      const inputs = createHRAInputs({
        basicSalary: 60000,
        hraReceived: 30000,
        rentPaid: 25000,
        cityType: 'non-metro',
      });

      const result = calculateHRA(inputs);

      // Non-metro cities get 40% of basic salary
      const expectedHRAPercent = 60000 * 0.40;
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
    });

    test('should show difference between metro and non-metro calculations', () => {
      const baseInputs = {
        basicSalary: 50000,
        hraReceived: 25000,
        rentPaid: 20000,
      };

      const metroResult = calculateHRA({ ...baseInputs, cityType: 'metro' });
      const nonMetroResult = calculateHRA({ ...baseInputs, cityType: 'non-metro' });

      // Metro should have higher HRA percentage allowance
      expect(metroResult.exemptionCalculations.hraPercent).toBeGreaterThan(
        nonMetroResult.exemptionCalculations.hraPercent
      );

      // This might result in different exemptions
      expect(metroResult.hraExemption).toBeGreaterThanOrEqual(nonMetroResult.hraExemption);
    });
  });

  describe('📊 Exemption Calculation Tests', () => {
    
    test('should calculate minimum exemption correctly', () => {
      const inputs = createHRAInputs({
        basicSalary: 40000,
        hraReceived: 30000, // High HRA received
        rentPaid: 12000, // Low rent paid
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      const actualHRA = 30000;
      const hraPercent = 40000 * 0.50; // 20000
      const rentMinus10Percent = 12000 - (40000 * 0.10); // 8000

      // Exemption should be minimum of the three (8000)
      const expectedExemption = Math.min(actualHRA, hraPercent, rentMinus10Percent);
      expectCloseTo(result.hraExemption, expectedExemption, 2);
      expectCloseTo(result.taxableHRA, 30000 - expectedExemption, 2);
    });

    test('should handle case where actual HRA is the limiting factor', () => {
      const inputs = createHRAInputs({
        basicSalary: 40000,
        hraReceived: 15000, // Low HRA received
        rentPaid: 25000, // High rent paid
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // Actual HRA (15000) should be the limiting factor
      expect(result.hraExemption).toBe(15000);
      expect(result.taxableHRA).toBe(0);
    });

    test('should handle case where HRA percentage is the limiting factor', () => {
      const inputs = createHRAInputs({
        basicSalary: 30000,
        hraReceived: 25000,
        rentPaid: 20000,
        cityType: 'non-metro', // 40% of basic = 12000
      });

      const result = calculateHRA(inputs);

      const hraPercent = 30000 * 0.40; // 12000
      // HRA percentage (12000) should be the limiting factor
      expectCloseTo(result.hraExemption, hraPercent, 2);
      expectCloseTo(result.taxableHRA, 25000 - hraPercent, 2);
    });

    test('should handle case where rent minus 10% is the limiting factor', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 30000,
        rentPaid: 12000, // Low rent
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      const rentMinus10Percent = 12000 - (50000 * 0.10); // 7000
      // Rent minus 10% (7000) should be the limiting factor
      expectCloseTo(result.hraExemption, rentMinus10Percent, 2);
      expectCloseTo(result.taxableHRA, 30000 - rentMinus10Percent, 2);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero basic salary', () => {
      const inputs = createHRAInputs({
        basicSalary: 0,
        hraReceived: 15000,
        rentPaid: 12000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result.exemptionCalculations.hraPercent).toBe(0);
      expect(result.exemptionCalculations.rentMinus10Percent).toBe(12000); // 12000 - 0
      expect(result.hraExemption).toBe(0); // Minimum will be 0
      expect(result.taxableHRA).toBe(15000);
    });

    test('should handle zero HRA received', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 0,
        rentPaid: 20000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result.hraReceived).toBe(0);
      expect(result.hraExemption).toBe(0);
      expect(result.taxableHRA).toBe(0);
    });

    test('should handle zero rent paid', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 25000,
        rentPaid: 0,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result.exemptionCalculations.rentMinus10Percent).toBe(0);
      expect(result.hraExemption).toBe(0);
      expect(result.taxableHRA).toBe(25000);
    });

    test('should handle rent less than 10% of basic salary', () => {
      const inputs = createHRAInputs({
        basicSalary: 100000,
        hraReceived: 30000,
        rentPaid: 8000, // Less than 10% of basic (10000)
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      const rentMinus10Percent = 8000 - (100000 * 0.10); // -2000
    expect(result.exemptionCalculations.rentMinus10Percent).toBe(0);
    expect(result.hraExemption).toBe(0);
    });

    test('should handle very high HRA received', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 100000, // Very high HRA
        rentPaid: 30000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result.hraReceived).toBe(100000);
      // Exemption will be limited by other factors
      expect(result.hraExemption).toBeLessThan(100000);
      expect(result.taxableHRA).toBeGreaterThan(0);
    });

    test('should handle very high rent paid', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 25000,
        rentPaid: 100000, // Very high rent
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      const rentMinus10Percent = 100000 - (50000 * 0.10); // 95000
      expect(result.exemptionCalculations.rentMinus10Percent).toBe(rentMinus10Percent);
      // Exemption will be limited by actual HRA received (25000)
      expect(result.hraExemption).toBe(25000);
      expect(result.taxableHRA).toBe(0);
    });

    test('should handle fractional amounts', () => {
      const inputs = createHRAInputs({
        basicSalary: 55555.55,
        hraReceived: 27777.77,
        rentPaid: 22222.22,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.hraExemption)).toBe(true);
      expect(Number.isFinite(result.taxableHRA)).toBe(true);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid basic salary inputs', () => {
      const testCases = [
        { basicSalary: null },
        { basicSalary: undefined },
        { basicSalary: '' },
        { basicSalary: 'invalid' },
        { basicSalary: -50000 }, // Negative salary
      ];

      testCases.forEach(({ basicSalary }) => {
        const inputs = createHRAInputs({ basicSalary: basicSalary as any });
        const result = calculateHRA(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.hraExemption).toBe('number');
        expect(typeof result.taxableHRA).toBe('number');
        expect(isFinite(result.hraExemption)).toBe(true);
        expect(isFinite(result.taxableHRA)).toBe(true);
      });
    });

    test('should handle invalid HRA received inputs', () => {
      const testCases = [
        { hraReceived: null },
        { hraReceived: undefined },
        { hraReceived: '' },
        { hraReceived: 'invalid' },
        { hraReceived: -25000 }, // Negative HRA
      ];

      testCases.forEach(({ hraReceived }) => {
        const inputs = createHRAInputs({ hraReceived: hraReceived as any });
        const result = calculateHRA(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.hraExemption).toBe('number');
        expect(isFinite(result.hraExemption)).toBe(true);
      });
    });

    test('should handle invalid rent paid inputs', () => {
      const testCases = [
        { rentPaid: null },
        { rentPaid: undefined },
        { rentPaid: '' },
        { rentPaid: 'invalid' },
        { rentPaid: -20000 }, // Negative rent
      ];

      testCases.forEach(({ rentPaid }) => {
        const inputs = createHRAInputs({ rentPaid: rentPaid as any });
        const result = calculateHRA(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.hraExemption).toBe('number');
        expect(isFinite(result.hraExemption)).toBe(true);
      });
    });

    test('should handle invalid city type inputs', () => {
      const testCases = [
        { cityType: null },
        { cityType: undefined },
        { cityType: '' },
        { cityType: 'invalid' },
      ];

      testCases.forEach(({ cityType }) => {
        const inputs = createHRAInputs({ cityType: cityType as any });
        const result = calculateHRA(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.hraExemption).toBe('number');
        expect(isFinite(result.hraExemption)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createHRAInputs({
        basicSalary: '₹50,000' as any,
        hraReceived: '₹25,000' as any,
        rentPaid: '₹20,000' as any,
      });

      const result = calculateHRA(inputs);

      expect(result).toBeDefined();
      expect(result.hraReceived).toBeGreaterThan(0);
      expect(result.hraExemption).toBeGreaterThanOrEqual(0);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000.123456789,
        hraReceived: 25000.987654321,
        rentPaid: 20000.555555555,
      });

      const result = calculateHRA(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.hraExemption)).toBe(true);
      expect(Number.isFinite(result.taxableHRA)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createHRAInputs({
        basicSalary: 1e7, // Very large salary
        hraReceived: 5e6,
        rentPaid: 3e6,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.hraExemption)).toBe(true);
      expect(isFinite(result.taxableHRA)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify HRA percentage calculation accuracy', () => {
      const inputs = createHRAInputs({
        basicSalary: 80000,
        hraReceived: 40000,
        rentPaid: 35000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // Manual calculation
      const expectedHRAPercent = 80000 * 0.50; // 40000 for metro
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
    });

    test('should verify rent minus 10% calculation accuracy', () => {
      const inputs = createHRAInputs({
        basicSalary: 60000,
        hraReceived: 30000,
        rentPaid: 25000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // Manual calculation
      const expectedRentMinus10 = 25000 - (60000 * 0.10); // 19000
      expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10, 2);
    });

    test('should verify minimum exemption calculation', () => {
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 30000,
        rentPaid: 18000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // Manual calculation of all three components
      const actualHRA = 30000;
      const hraPercent = 50000 * 0.50; // 25000
      const rentMinus10 = 18000 - (50000 * 0.10); // 13000

      const expectedExemption = Math.min(actualHRA, hraPercent, rentMinus10); // 13000
      expectCloseTo(result.hraExemption, expectedExemption, 2);
    });

    test('should verify taxable HRA calculation', () => {
      const inputs = createHRAInputs({
        basicSalary: 40000,
        hraReceived: 25000,
        rentPaid: 15000,
        cityType: 'non-metro',
      });

      const result = calculateHRA(inputs);

      // Taxable HRA should be HRA received minus exemption
      const expectedTaxableHRA = result.hraReceived - result.hraExemption;
      expectCloseTo(result.taxableHRA, expectedTaxableHRA, 2);
    });

    test('should verify calculations for different scenarios', () => {
      const testCases = [
        {
          basicSalary: 70000,
          hraReceived: 35000,
          rentPaid: 30000,
          cityType: 'metro' as const,
          expectedHRAPercent: 35000, // 70000 * 0.50
          expectedRentMinus10: 23000, // 30000 - 7000
        },
        {
          basicSalary: 60000,
          hraReceived: 24000,
          rentPaid: 20000,
          cityType: 'non-metro' as const,
          expectedHRAPercent: 24000, // 60000 * 0.40
          expectedRentMinus10: 14000, // 20000 - 6000
        },
      ];

      testCases.forEach(({ basicSalary, hraReceived, rentPaid, cityType, expectedHRAPercent, expectedRentMinus10 }) => {
        const inputs = createHRAInputs({ basicSalary, hraReceived, rentPaid, cityType });
        const result = calculateHRA(inputs);
        
        expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
        expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10, 2);
        
        const expectedExemption = Math.min(hraReceived, expectedHRAPercent, expectedRentMinus10);
        expectCloseTo(result.hraExemption, expectedExemption, 2);
        expectCloseTo(result.taxableHRA, hraReceived - expectedExemption, 2);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        basicSalary: 30000 + i * 100,
        hraReceived: 15000 + i * 50,
        rentPaid: 12000 + i * 40,
        cityType: i % 2 === 0 ? 'metro' as const : 'non-metro' as const,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateHRA(inputs);
        expect(result).toBeDefined();
        expect(result.hraExemption).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large salary calculations efficiently', () => {
      const inputs = createHRAInputs({
        basicSalary: 10000000, // 1 crore per month
        hraReceived: 5000000,
        rentPaid: 3000000,
        cityType: 'metro',
      });

      const startTime = Date.now();
      const result = calculateHRA(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.hraExemption).toBeGreaterThan(0);
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createHRAInputs({
        basicSalary: 50000,
        hraReceived: 25000,
        rentPaid: 20000,
        cityType: 'metro',
      });

      const result = calculateHRA(inputs);

      // These values should remain consistent across code changes
      expect(result.hraReceived).toBe(25000);
      expect(result.exemptionCalculations.actualHRA).toBe(25000);
      expect(result.exemptionCalculations.hraPercent).toBe(25000); // 50% of 50000
      expect(result.exemptionCalculations.rentMinus10Percent).toBe(15000); // 20000 - 5000
      expect(result.hraExemption).toBe(15000); // Minimum of the three
      expect(result.taxableHRA).toBe(10000); // 25000 - 15000
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { basicSalary: 0, hraReceived: 15000, rentPaid: 12000, cityType: 'metro' as const },
        { basicSalary: 100000, hraReceived: 0, rentPaid: 50000, cityType: 'non-metro' as const },
        { basicSalary: 75000, hraReceived: 50000, rentPaid: 5000, cityType: 'metro' as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateHRA(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.hraReceived).toBe('number');
        expect(typeof result.hraExemption).toBe('number');
        expect(typeof result.taxableHRA).toBe('number');
        
        expect(isFinite(result.hraReceived)).toBe(true);
        expect(isFinite(result.hraExemption)).toBe(true);
        expect(isFinite(result.taxableHRA)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createHRAInputs({
        basicSalary: 80000,
        hraReceived: 40000,
        rentPaid: 35000,
        cityType: 'non-metro',
      });

      const result = calculateHRA(inputs);

      // Mathematical relationships that should always hold
      expect(result.taxableHRA).toBe(result.hraReceived - result.hraExemption);
      expect(result.exemptionCalculations.actualHRA).toBe(result.hraReceived);
      
      // HRA percentage should be correct based on city type
      const expectedHRAPercent = inputs.cityType === 'metro' ? 
        inputs.basicSalary * 0.50 : inputs.basicSalary * 0.40;
      expect(result.exemptionCalculations.hraPercent).toBe(expectedHRAPercent);
      
      // Rent minus 10% calculation
      const expectedRentMinus10 = inputs.rentPaid - (inputs.basicSalary * 0.10);
      expectCloseTo(result.exemptionCalculations.rentMinus10Percent, expectedRentMinus10, 2);
      
      // Exemption should be minimum of the three components
      const expectedExemption = Math.min(
        result.exemptionCalculations.actualHRA,
        result.exemptionCalculations.hraPercent,
        result.exemptionCalculations.rentMinus10Percent
      );
      expectCloseTo(result.hraExemption, expectedExemption, 2);
      
      // Logical relationships
      expect(result.hraExemption).toBeLessThanOrEqual(result.hraReceived);
      expect(result.taxableHRA).toBeGreaterThanOrEqual(0);
      expect(result.taxableHRA).toBeLessThanOrEqual(result.hraReceived);
    });
  });
});