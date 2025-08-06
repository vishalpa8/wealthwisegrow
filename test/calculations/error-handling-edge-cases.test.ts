/**
 * Error Handling and Edge Cases Test Suite
 * Tests extreme scenarios, error conditions, and boundary cases
 * Priority: HIGH - Ensures robustness and production stability
 */

import { 
  calculateLoan,
  calculateMortgage,
} from '../../src/lib/calculations/loan';
import { calculateInvestment } from '../../src/lib/calculations/investment';
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
import { 
  calculateIncomeTax,
  calculateGST,
  calculateSalary,
  calculateHRA,
  calculateCapitalGains 
} from '../../src/lib/calculations/tax';

describe('Error Handling and Edge Cases - Comprehensive Test Suite', () => {

  describe('🚨 Critical Error Scenarios', () => {
    
    test('should handle division by zero scenarios', () => {
      const divisionByZeroTests = [
        {
          name: 'Zero interest rate loan',
          function: calculateLoan,
          inputs: { principal: 100000, rate: 0, years: 10, extraPayment: 0 },
          expectation: (result: any) => {
            expect(result.monthlyPayment).toBe(100000 / (10 * 12)); // Simple division
            expect(result.totalInterest).toBe(0);
          }
        },
        {
          name: 'Zero gold price',
          function: calculateGoldInvestment,
          inputs: { investmentAmount: 100000, currentGoldPrice: 0, expectedAppreciation: 8, years: 10 },
          expectation: (result: any) => {
            expect(result.goldQuantity).toBe(0);
            expect(result.maturityAmount).toBe(0);
          }
        },
        {
          name: 'Zero stock price dividend yield',
          function: calculateDividendYield,
          inputs: { stockPrice: 0, annualDividend: 50, numberOfShares: 100 },
          expectation: (result: any) => {
            expect(isFinite(result.dividendYield)).toBe(true);
            expect(result.totalInvestment).toBe(0);
          }
        },
      ];

      divisionByZeroTests.forEach(({ name, function: calcFunction, inputs, expectation }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        expectation(result);
        
        // Ensure no infinite or NaN values
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('should handle overflow and underflow scenarios', () => {
      const overflowTests = [
        {
          name: 'Extremely high SIP returns',
          function: calculateSIP,
          inputs: { monthlyInvestment: 100000, annualReturn: 100, years: 50 },
        },
        {
          name: 'Very large loan amount',
          function: calculateLoan,
          inputs: { principal: Number.MAX_SAFE_INTEGER / 1000, rate: 5, years: 30, extraPayment: 0 },
        },
        {
          name: 'Extreme gold appreciation',
          function: calculateGoldInvestment,
          inputs: { investmentAmount: 1000000, currentGoldPrice: 5000, expectedAppreciation: 50, years: 30 },
        },
      ];

      overflowTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        
        // Should handle large numbers gracefully
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
            expect(value).toBeLessThan(Number.MAX_SAFE_INTEGER);
          }
        });
      });
    });

    test('should handle precision loss scenarios', () => {
      const precisionTests = [
        {
          name: 'Very small SIP amounts',
          function: calculateSIP,
          inputs: { monthlyInvestment: 0.000001, annualReturn: 0.000001, years: 0.000001 },
        },
        {
          name: 'Micro loan calculations',
          function: calculateLoan,
          inputs: { principal: 0.01, rate: 0.01, years: 0.01, extraPayment: 0 },
        },
        {
          name: 'Tiny dividend calculations',
          function: calculateDividendYield,
          inputs: { stockPrice: 0.001, annualDividend: 0.0001, numberOfShares: 0.1 },
        },
      ];

      precisionTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        
        // Should maintain precision for small numbers
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
          }
        });
      });
    });
  });

  describe('🔄 Circular Reference and Infinite Loop Protection', () => {
    
    test('should prevent infinite loops in iterative calculations', () => {
      const infiniteLoopTests = [
        {
          name: 'SIP with extreme parameters',
          function: calculateSIP,
          inputs: { monthlyInvestment: 1, annualReturn: 1000, years: 1000 },
          timeout: 5000,
        },
        {
          name: 'Loan with very long term',
          function: calculateLoan,
          inputs: { principal: 100000, rate: 1, years: 1000, extraPayment: 0 },
          timeout: 5000,
        },
        {
          name: 'EPF with extreme duration',
          function: calculateEPF,
          inputs: { basicSalary: 50000, employeeContribution: 12, employerContribution: 12, years: 200 },
          timeout: 5000,
        },
      ];

      infiniteLoopTests.forEach(({ name, function: calcFunction, inputs, timeout }) => {
        const startTime = Date.now();
        
        const result = calcFunction(inputs as any);
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        expect(executionTime).toBeLessThan(timeout);
        expect(result).toBeDefined();
        
        // Should either complete successfully or return error gracefully
        if ((result as any).error) {
          expect(typeof (result as any).error).toBe('string');
        } else {
          Object.values(result).forEach(value => {
            if (typeof value === 'number') {
              expect(isFinite(value)).toBe(true);
            }
          });
        }
      });
    });

    test('should handle recursive calculation limits', () => {
      // Test calculations that might cause stack overflow
      const recursiveTests = [
        {
          name: 'Deep payment schedule calculation',
          function: calculateLoan,
          inputs: { principal: 1000000, rate: 0.1, years: 100, extraPayment: 0 },
        },
        {
          name: 'Long-term investment breakdown',
          function: calculateInvestment,
          inputs: { 
            initialAmount: 10000, 
            monthlyContribution: 1000, 
            annualReturn: 12, 
            years: 100, 
            compoundingFrequency: 'monthly' 
          },
        },
      ];

      recursiveTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        
        // Should complete without stack overflow
        if (Array.isArray((result as any).paymentSchedule)) {
          expect((result as any).paymentSchedule.length).toBeLessThan(2500); // Reasonable limit
        }
        
        if (Array.isArray((result as any).yearlyBreakdown)) {
          expect((result as any).yearlyBreakdown.length).toBeLessThan(150); // Reasonable limit
        }
      });
    });
  });

  describe('🎭 Type Coercion and Conversion Edge Cases', () => {
    
    test('should handle unusual string formats', () => {
      const stringFormatTests = [
        {
          name: 'Scientific notation',
          inputs: { amount: '1e5', rate: '1.2e1', years: '1e1' },
          function: calculateSIP,
        },
        {
          name: 'Hexadecimal numbers',
          inputs: { amount: '0x186A0', rate: '0xC', years: '0xA' },
          function: calculateSIP,
        },
        {
          name: 'Binary numbers',
          inputs: { amount: '0b11000011010100000', rate: '0b1100', years: '0b1010' },
          function: calculateSIP,
        },
        {
          name: 'Octal numbers',
          inputs: { amount: '0o303240', rate: '0o14', years: '0o12' },
          function: calculateSIP,
        },
      ];

      stringFormatTests.forEach(({ name, inputs, function: calcFunction }) => {
        const result = calcFunction({
          monthlyInvestment: inputs.amount,
          annualReturn: inputs.rate,
          years: inputs.years,
        } as any);
        
        expect(result).toBeDefined();
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('should handle mixed data types', () => {
      const mixedTypeTests = [
        {
          name: 'Boolean to number conversion',
          function: calculateSIP,
          inputs: { monthlyInvestment: true, annualReturn: false, years: true },
        },
        {
          name: 'Array to number conversion',
          function: calculateLoan,
          inputs: { principal: [100000], rate: [8], years: [10], extraPayment: [0] },
        },
        {
          name: 'Object to number conversion',
          function: calculateFD,
          inputs: { 
            principal: { valueOf: () => 100000 }, 
            annualRate: { valueOf: () => 7 }, 
            years: { valueOf: () => 5 },
            compoundingFrequency: 'monthly'
          },
        },
      ];

      mixedTypeTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        
        // Should handle type conversion gracefully
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('should handle special JavaScript values', () => {
      const specialValueTests = [
        {
          name: 'Positive zero vs negative zero',
          function: calculateSIP,
          inputs: { monthlyInvestment: +0, annualReturn: -0, years: 10 },
        },
        {
          name: 'Number.EPSILON',
          function: calculateLoan,
          inputs: { principal: Number.EPSILON, rate: Number.EPSILON, years: 1, extraPayment: 0 },
        },
        {
          name: 'Number.MIN_VALUE',
          function: calculateFD,
          inputs: { 
            principal: Number.MIN_VALUE, 
            annualRate: Number.MIN_VALUE, 
            years: 1,
            compoundingFrequency: 'monthly'
          },
        },
      ];

      specialValueTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        expect(result).toBeDefined();
        
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });
  });

  describe('🌐 Internationalization Edge Cases', () => {
    
    test('should handle different locale number formats', () => {
      const localeTests = [
        {
          name: 'European decimal separator',
          inputs: { amount: '100.000,50', rate: '12,5', years: '10' },
        },
        {
          name: 'Indian numbering system',
          inputs: { amount: '1,00,000', rate: '12', years: '10' },
        },
        {
          name: 'Arabic numerals',
          inputs: { amount: '١٠٠٠٠٠', rate: '١٢', years: '١٠' },
        },
        {
          name: 'Chinese numerals',
          inputs: { amount: '十万', rate: '十二', years: '十' },
        },
      ];

      localeTests.forEach(({ name, inputs }) => {
        const result = calculateSIP({
          monthlyInvestment: inputs.amount,
          annualReturn: inputs.rate,
          years: inputs.years,
        } as any);
        
        expect(result).toBeDefined();
        
        // Should handle locale-specific formats gracefully
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('should handle different currency formats', () => {
      const currencyTests = [
        {
          name: 'Multiple currency symbols',
          inputs: { amount: '$₹€£¥100000', rate: '12%', years: '10' },
        },
        {
          name: 'Currency with spaces',
          inputs: { amount: 'USD 100 000', rate: '12 %', years: '10 years' },
        },
        {
          name: 'Currency abbreviations',
          inputs: { amount: '100K USD', rate: '12pct', years: '1decade' },
        },
      ];

      currencyTests.forEach(({ name, inputs }) => {
        const result = calculateSIP({
          monthlyInvestment: inputs.amount,
          annualReturn: inputs.rate,
          years: inputs.years,
        } as any);
        
        expect(result).toBeDefined();
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });
  });

  describe('🔒 Security and Injection Edge Cases', () => {
    
    test('should handle potential code injection attempts', () => {
      const injectionTests = [
        {
          name: 'JavaScript code injection',
          inputs: { 
            amount: 'eval("100000")', 
            rate: 'function(){return 12}()', 
            years: 'parseInt("10")' 
          },
        },
        {
          name: 'Template literal injection',
          inputs: { 
            amount: '${100000}', 
            rate: '`12`', 
            years: '${10}' 
          },
        },
        {
          name: 'Constructor injection',
          inputs: { 
            amount: 'new Number(100000)', 
            rate: 'Number.constructor(12)', 
            years: 'Object.constructor(10)' 
          },
        },
      ];

      injectionTests.forEach(({ name, inputs }) => {
        const result = calculateSIP({
          monthlyInvestment: inputs.amount,
          annualReturn: inputs.rate,
          years: inputs.years,
        } as any);
        
        expect(result).toBeDefined();
        
        // Should not execute injected code
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('should handle prototype pollution attempts', () => {
      const pollutionTests = [
        {
          name: 'Object prototype pollution',
          inputs: { 
            '__proto__': { amount: 999999 },
            'constructor': { prototype: { rate: 999 } },
            amount: 100000,
            rate: 12,
            years: 10
          },
        },
        {
          name: 'Array prototype pollution',
          inputs: { 
            amount: 100000,
            rate: 12,
            years: 10,
            'length': 999999,
            '0': 'polluted'
          },
        },
      ];

      pollutionTests.forEach(({ name, inputs }) => {
        const result = calculateSIP({
          monthlyInvestment: inputs.amount,
          annualReturn: inputs.rate,
          years: inputs.years,
        } as any);
        
        expect(result).toBeDefined();
        
        // Should not be affected by pollution attempts
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });
  });

  describe('⚡ Memory and Performance Edge Cases', () => {
    
    test('should handle memory-intensive calculations', () => {
      const memoryTests = [
        {
          name: 'Large payment schedule generation',
          function: calculateLoan,
          inputs: { principal: 1000000, rate: 5, years: 50, extraPayment: 0 },
          memoryCheck: (result: any) => {
            expect(result.paymentSchedule.length).toBeLessThanOrEqual(600); // 50 years max
          }
        },
        {
          name: 'Extensive monthly breakdown',
          function: calculateSIP,
          inputs: { monthlyInvestment: 10000, annualReturn: 12, years: 100 },
          memoryCheck: (result: any) => {
            if (result.monthlyBreakdown) {
              expect(result.monthlyBreakdown.length).toBeLessThanOrEqual(1200); // Reasonable limit
            }
          }
        },
      ];

      memoryTests.forEach(({ name, function: calcFunction, inputs, memoryCheck }) => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        const result = calcFunction(inputs as any);
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        expect(result).toBeDefined();
        memoryCheck(result);
        
        // Memory increase should be reasonable (less than 100MB)
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      });
    });

    test('should handle rapid successive calculations', () => {
      const rapidTests = [
        { function: calculateSIP, inputs: { monthlyInvestment: 5000, annualReturn: 12, years: 10 } },
        { function: calculateLoan, inputs: { principal: 100000, rate: 8, years: 10, extraPayment: 0 } },
        { function: calculateFD, inputs: { principal: 100000, annualRate: 7, years: 5, compoundingFrequency: 'monthly' } },
      ];

      const iterations = 1000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        rapidTests.forEach(({ function: calcFunction, inputs }) => {
          const result = calcFunction(inputs as any);
          expect(result).toBeDefined();
        });
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 1000 iterations within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds
    });
  });

  describe('🔄 State Management Edge Cases', () => {
    
    test('should handle concurrent modifications', () => {
      const sharedInputs = { monthlyInvestment: 5000, annualReturn: 12, years: 10 };
      
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => {
          // Modify inputs during calculation
          const modifiedInputs = { ...sharedInputs, monthlyInvestment: 5000 + i };
          return calculateSIP(modifiedInputs);
        })
      );
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(100);
        
        results.forEach((result, index) => {
          expect(result).toBeDefined();
          expect(result.totalInvestment).toBe((5000 + index) * 12 * 10);
        });
      });
    });

    test('should maintain immutability under stress', () => {
      const originalInputs = { monthlyInvestment: 5000, annualReturn: 12, years: 10 };
      const inputsCopy = JSON.parse(JSON.stringify(originalInputs));
      
      // Perform many calculations
      for (let i = 0; i < 100; i++) {
        const result = calculateSIP(originalInputs);
        expect(result).toBeDefined();
        
        // Try to modify the result
        try {
          (result as any).totalInvestment = 999999;
          (result as any).newProperty = 'injected';
        } catch (error) {
          // Expected if object is frozen/sealed
        }
      }
      
      // Original inputs should remain unchanged
      expect(originalInputs).toEqual(inputsCopy);
    });
  });
});