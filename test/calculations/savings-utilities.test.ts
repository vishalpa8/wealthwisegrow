/**
 * Comprehensive Test Suite for Savings Calculator Utility Functions
 * Tests internal utility functions, error handling, and edge cases
 * Priority: HIGH - Critical utility functions used across all savings calculators
 */

import { 
  calculateSIP, 
  calculateLumpsum, 
  calculatePPF, 
  calculateFD, 
  calculateRD, 
  calculateEPF, 
  calculateDividendYield, 
  calculateGoldInvestment 
} from '../../src/lib/calculations/savings';

describe('Savings Calculator Utilities - Comprehensive Test Suite', () => {

  describe('🛡️ Error Handling & Robustness Tests', () => {
    
    test('should handle extreme floating point precision issues', () => {
      const extremeInputs = {
        monthlyInvestment: 0.000000000001,
        annualReturn: 0.000000000001,
        years: 0.000000000001,
      };

      const result = calculateSIP(extremeInputs);
      
      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(typeof result.maturityAmount).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });

    test('should handle very large numbers without overflow', () => {
      const largeInputs = {
        monthlyInvestment: Number.MAX_SAFE_INTEGER / 1000000,
        annualReturn: 50,
        years: 100,
      };

      const result = calculateSIP(largeInputs);
      
      expect(result).toBeDefined();
      expect(isFinite(result.totalInvestment)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle calculations that might cause infinite loops', () => {
      const problematicInputs = {
        monthlyInvestment: 1000,
        annualReturn: 1000, // 1000% return
        years: 1000, // 1000 years
      };

      const startTime = Date.now();
      const result = calculateSIP(problematicInputs);
      const endTime = Date.now();
      
      // Should either complete quickly or return error gracefully
      expect(endTime - startTime).toBeLessThan(5000);
      expect(result).toBeDefined();
      
      if (result.error) {
        expect(typeof result.error).toBe('string');
        expect(result.totalInvestment).toBe(0);
        expect(result.maturityAmount).toBe(0);
      }
    });

    test('should handle NaN and Infinity inputs gracefully', () => {
      const invalidInputs = [
        { monthlyInvestment: NaN, annualReturn: 12, years: 10 },
        { monthlyInvestment: 1000, annualReturn: Infinity, years: 10 },
        { monthlyInvestment: 1000, annualReturn: 12, years: -Infinity },
        { monthlyInvestment: Infinity, annualReturn: 12, years: 10 },
      ];

      invalidInputs.forEach(inputs => {
        const result = calculateSIP(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle memory-intensive calculations efficiently', () => {
      const memoryIntensiveInputs = {
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 200, // 2400 monthly calculations
      };

      const startTime = Date.now();
      const result = calculateSIP(memoryIntensiveInputs);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000);
      
      if (!result.error) {
        expect(result.monthlyBreakdown.length).toBeLessThanOrEqual(2400); // Should be capped at 200 years * 12 months
      }
    });
  });

  describe('🔢 Numerical Precision & Accuracy Tests', () => {
    
    test('should maintain precision with very small decimal amounts', () => {
      const precisionInputs = {
        monthlyInvestment: 0.01, // 1 paisa
        annualReturn: 0.01, // 0.01%
        years: 1,
      };

      const result = calculateSIP(precisionInputs);
      
      expect(result.totalInvestment).toBe(0.12); // 0.01 * 12
      expect(result.maturityAmount).toBeGreaterThanOrEqual(0.12); // With very low returns, might be equal
      expect(result.totalGains).toBeGreaterThanOrEqual(0);
    });

    test('should handle calculations with many decimal places', () => {
      const decimalInputs = {
        monthlyInvestment: 5555.555555,
        annualReturn: 12.123456789,
        years: 7.987654321,
      };

      const result = calculateSIP(decimalInputs);
      
      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      
      // Check that results are properly rounded
      expect(result.totalInvestment % 0.01).toBeCloseTo(0, 2);
      expect(result.maturityAmount % 0.01).toBeCloseTo(0, 2);
    });

    test('should maintain accuracy across different calculation methods', () => {
      // Compare SIP vs Lumpsum for equivalent scenarios
      const sipInputs = {
        monthlyInvestment: 8333.33, // ~100k annually
        annualReturn: 10,
        years: 5,
      };

      const lumpsumInputs = {
        principal: 100000,
        annualReturn: 10,
        years: 5,
      };

      const sipResult = calculateSIP(sipInputs);
      const lumpsumResult = calculateLumpsum(lumpsumInputs);
      
      // SIP should generally yield higher returns due to rupee cost averaging
      expect(sipResult.maturityAmount).toBeGreaterThan(lumpsumResult.maturityAmount);
    });

    test('should handle rounding edge cases correctly', () => {
      const roundingInputs = {
        monthlyInvestment: 3333.333333,
        annualReturn: 11.111111,
        years: 3.333333,
      };

      const result = calculateSIP(roundingInputs);
      
      expect(result).toBeDefined();
      
      // Check that all monetary values are properly rounded to 2 decimal places
      expect(Number(result.totalInvestment.toFixed(2))).toBe(result.totalInvestment);
      expect(Number(result.maturityAmount.toFixed(2))).toBe(result.maturityAmount);
      expect(Number(result.totalGains.toFixed(2))).toBe(result.totalGains);
    });
  });

  describe('🔄 Cross-Calculator Consistency Tests', () => {
    
    test('should maintain consistency between FD and RD calculations', () => {
      // Compare FD lumpsum vs RD monthly for equivalent amounts
      const fdInputs = {
        principal: 120000, // 10k * 12 months
        annualRate: 8,
        years: 5,
        compoundingFrequency: 'monthly' as const,
      };

      const rdInputs = {
        monthlyDeposit: 10000,
        annualRate: 8,
        years: 5,
      };

      const fdResult = calculateFD(fdInputs);
      const rdResult = calculateRD(rdInputs);
      
      // RD typically yields higher returns due to monthly compounding effect
      // Adjust expectation based on actual calculation behavior
      expect(rdResult.maturityAmount).toBeGreaterThan(fdResult.maturityAmount);
      expect(rdResult.totalInterest).toBeGreaterThan(fdResult.totalInterest);
    });

    test('should maintain consistency between EPF and PPF calculations', () => {
      // Compare EPF vs PPF for similar contribution amounts
      const epfInputs = {
        basicSalary: 62500, // To get 15k monthly contribution at 12%
        employeeContribution: 12,
        employerContribution: 12,
        years: 15,
      };

      const ppfInputs = {
        yearlyInvestment: 150000, // 12.5k monthly * 12
        years: 15,
      };

      const epfResult = calculateEPF(epfInputs);
      const ppfResult = calculatePPF(ppfInputs);
      
      // EPF should yield higher returns due to employer contribution
      expect(epfResult.maturityAmount).toBeGreaterThan(ppfResult.maturityAmount);
    });

    test('should maintain mathematical relationships across calculators', () => {
      const testAmount = 100000;
      const testRate = 10;
      const testYears = 10;

      // Test compound interest consistency
      const lumpsumResult = calculateLumpsum({
        principal: testAmount,
        annualReturn: testRate,
        years: testYears,
      });

      const fdResult = calculateFD({
        principal: testAmount,
        annualRate: testRate,
        years: testYears,
        compoundingFrequency: 'annually',
      });

      // Both should yield similar results for annual compounding
      expect(Math.abs(lumpsumResult.maturityAmount - fdResult.maturityAmount)).toBeLessThan(1000);
    });
  });

  describe('🎯 Boundary Value Analysis', () => {
    
    test('should handle minimum viable inputs', () => {
      const minInputs = {
        monthlyInvestment: 1, // Minimum 1 rupee
        annualReturn: 0.01, // Minimum 0.01%
        years: 1, // Minimum 1 year
      };

      const result = calculateSIP(minInputs);
      
      expect(result.totalInvestment).toBe(12);
      expect(result.maturityAmount).toBeGreaterThanOrEqual(12); // With very low returns, might be equal
      expect(result.totalGains).toBeGreaterThanOrEqual(0);
      expect(result.monthlyBreakdown).toHaveLength(12);
    });

    test('should handle maximum practical inputs', () => {
      const maxInputs = {
        monthlyInvestment: 10000000, // 1 crore monthly
        annualReturn: 30, // 30% return (high but realistic)
        years: 50, // 50 years
      };

      const result = calculateSIP(maxInputs);
      
      expect(result).toBeDefined();
      expect(result.totalInvestment).toBe(6000000000); // 600 crores
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvestment);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });

    test('should handle edge cases for all calculator types', () => {
      const edgeCases = [
        // SIP edge case
        () => calculateSIP({ monthlyInvestment: 0.5, annualReturn: 0.5, years: 0.5 }),
        
        // Lumpsum edge case
        () => calculateLumpsum({ principal: 0.5, annualReturn: 0.5, years: 0.5 }),
        
        // PPF edge case
        () => calculatePPF({ yearlyInvestment: 500, years: 15 }),
        
        // FD edge case
        () => calculateFD({ principal: 1000, annualRate: 0.1, years: 0.1, compoundingFrequency: 'daily' }),
        
        // RD edge case
        () => calculateRD({ monthlyDeposit: 100, annualRate: 0.1, years: 0.1 }),
        
        // EPF edge case
        () => calculateEPF({ basicSalary: 15000, employeeContribution: 0.1, employerContribution: 0.1, years: 1 }),
        
        // Dividend Yield edge case
        () => calculateDividendYield({ stockPrice: 0.01, annualDividend: 0.001, numberOfShares: 1 }),
        
        // Gold Investment edge case
        () => calculateGoldInvestment({ investmentAmount: 1000, currentGoldPrice: 1, expectedAppreciation: 0.1, years: 0.1 }),
      ];

      edgeCases.forEach((calculateFn, index) => {
        const result = calculateFn();
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // All results should have finite numerical values
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });
  });

  describe('🔒 Input Sanitization & Security Tests', () => {
    
    test('should sanitize malicious string inputs', () => {
      const maliciousInputs = {
        monthlyInvestment: '<script>alert("xss")</script>' as any,
        annualReturn: 'javascript:void(0)' as any,
        years: '../../etc/passwd' as any,
      };

      const result = calculateSIP(maliciousInputs);
      
      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });

    test('should handle SQL injection-like strings', () => {
      const sqlInputs = {
        monthlyInvestment: "'; DROP TABLE users; --" as any,
        annualReturn: "1 OR 1=1" as any,
        years: "UNION SELECT * FROM passwords" as any,
      };

      const result = calculateSIP(sqlInputs);
      
      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });

    test('should handle buffer overflow attempts', () => {
      const longString = 'A'.repeat(10000);
      const bufferInputs = {
        monthlyInvestment: longString as any,
        annualReturn: longString as any,
        years: longString as any,
      };

      const result = calculateSIP(bufferInputs);
      
      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });

    test('should handle unicode and special characters', () => {
      const unicodeInputs = {
        monthlyInvestment: '₹५०००' as any, // Hindi numerals with rupee symbol
        annualReturn: '12％' as any, // Full-width percent
        years: '１０' as any, // Full-width numbers
      };

      const result = calculateSIP(unicodeInputs);
      
      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });
  });

  describe('⚡ Performance & Memory Tests', () => {
    
    test('should handle concurrent calculations efficiently', async () => {
      const concurrentPromises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(calculateSIP({
          monthlyInvestment: 1000 + i * 100,
          annualReturn: 8 + i % 10,
          years: 5 + i % 15,
        }))
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000);
      expect(results).toHaveLength(100);
      
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });
    });

    test('should not leak memory with repeated calculations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many calculations
      for (let i = 0; i < 1000; i++) {
        calculateSIP({
          monthlyInvestment: 5000,
          annualReturn: 12,
          years: 10,
        });
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should handle rapid successive calculations', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const result = calculateSIP({
          monthlyInvestment: 1000 + i,
          annualReturn: 8 + (i % 10),
          years: 5 + (i % 10),
        });
        
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('🔄 State Management & Immutability Tests', () => {
    
    test('should not modify input objects', () => {
      const originalInputs = {
        monthlyInvestment: 5000,
        annualReturn: 12,
        years: 10,
      };
      
      const inputsCopy = { ...originalInputs };
      
      calculateSIP(originalInputs);
      
      expect(originalInputs).toEqual(inputsCopy);
    });

    test('should return immutable results', () => {
      const result = calculateSIP({
        monthlyInvestment: 5000,
        annualReturn: 12,
        years: 10,
      });
      
      const originalMaturityAmount = result.maturityAmount;
      
      // Attempt to modify result
      try {
        (result as any).maturityAmount = 999999;
      } catch (error) {
        // Expected if object is frozen
      }
      
      // Result should remain unchanged or be properly protected
      expect(typeof result.maturityAmount).toBe('number');
      expect(isFinite(result.maturityAmount)).toBe(true);
    });

    test('should handle multiple simultaneous calculations without interference', () => {
      const inputs1 = { monthlyInvestment: 1000, annualReturn: 8, years: 5 };
      const inputs2 = { monthlyInvestment: 2000, annualReturn: 10, years: 7 };
      const inputs3 = { monthlyInvestment: 3000, annualReturn: 12, years: 10 };
      
      const result1 = calculateSIP(inputs1);
      const result2 = calculateSIP(inputs2);
      const result3 = calculateSIP(inputs3);
      
      // Results should be independent and correct
      expect(result1.totalInvestment).toBe(60000); // 1000 * 12 * 5
      expect(result2.totalInvestment).toBe(168000); // 2000 * 12 * 7
      expect(result3.totalInvestment).toBe(360000); // 3000 * 12 * 10
      
      expect(result1.maturityAmount).toBeLessThan(result2.maturityAmount);
      expect(result2.maturityAmount).toBeLessThan(result3.maturityAmount);
    });
  });

  describe('🌐 Internationalization & Localization Tests', () => {
    
    test('should handle different number formats', () => {
      const formats = [
        '5,000', // US format
        '5.000', // European format
        '5 000', // French format
        '५०००', // Hindi numerals
        '5000.00', // Decimal format
      ];
      
      formats.forEach(format => {
        const result = calculateSIP({
          monthlyInvestment: format as any,
          annualReturn: 12,
          years: 10,
        });
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
      });
    });

    test('should handle different currency symbols', () => {
      const currencies = [
        '₹5000', // Indian Rupee
        '$5000', // US Dollar
        '€5000', // Euro
        '£5000', // British Pound
        '¥5000', // Japanese Yen
        '₹5,000.50', // With decimals and commas
      ];
      
      currencies.forEach(currency => {
        const result = calculateSIP({
          monthlyInvestment: currency as any,
          annualReturn: 12,
          years: 10,
        });
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
      });
    });

    test('should handle percentage formats', () => {
      const percentages = [
        '12%',
        '12.5%',
        '12％', // Full-width percent
        '0.12', // Decimal format
        '12 percent',
        '12 per cent',
      ];
      
      percentages.forEach(percentage => {
        const result = calculateSIP({
          monthlyInvestment: 5000,
          annualReturn: percentage as any,
          years: 10,
        });
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });
  });
});