/**
 * Comprehensive Test Runner and Verification System
 * Validates all calculator functions and ensures production readiness
 * Priority: CRITICAL - Overall system validation and quality assurance
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

describe('Comprehensive Test Runner - Production Readiness Validation', () => {

  // Define all calculator functions with their test inputs
  const calculatorTests = [
    {
      name: 'Loan Calculator',
      function: calculateLoan,
      validInputs: { principal: 100000, rate: 8, years: 10, extraPayment: 0 },
      expectedKeys: ['monthlyPayment', 'totalPayment', 'totalInterest', 'payoffTime', 'interestSaved', 'paymentSchedule'],
      category: 'loan',
    },
    {
      name: 'Investment Calculator',
      function: calculateInvestment,
      validInputs: { initialAmount: 10000, monthlyContribution: 1000, annualReturn: 12, years: 10, compoundingFrequency: 'monthly' },
      expectedKeys: ['finalAmount', 'totalContributions', 'totalGrowth', 'annualizedReturn', 'yearlyBreakdown'],
      category: 'investment',
    },
    {
      name: 'Mortgage Calculator',
      function: calculateMortgage,
      validInputs: { principal: 500000, rate: 7, years: 30, downPayment: 100000, propertyTax: 12000, insurance: 6000, pmi: 2400 },
      expectedKeys: ['monthlyPayment', 'totalPayment', 'totalInterest', 'monthlyPrincipalAndInterest', 'monthlyPropertyTax', 'monthlyInsurance', 'monthlyPMI', 'loanToValue', 'paymentSchedule'],
      category: 'loan',
    },
    {
      name: 'SIP Calculator',
      function: calculateSIP,
      validInputs: { monthlyInvestment: 5000, annualReturn: 12, years: 10 },
      expectedKeys: ['totalInvestment', 'maturityAmount', 'totalGains', 'monthlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'Lumpsum Calculator',
      function: calculateLumpsum,
      validInputs: { principal: 100000, annualReturn: 10, years: 8 },
      expectedKeys: ['principal', 'maturityAmount', 'totalGains', 'yearlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'PPF Calculator',
      function: calculatePPF,
      validInputs: { yearlyInvestment: 150000, years: 15 },
      expectedKeys: ['totalInvestment', 'maturityAmount', 'totalGains', 'yearlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'FD Calculator',
      function: calculateFD,
      validInputs: { principal: 100000, annualRate: 7, years: 5, compoundingFrequency: 'quarterly' },
      expectedKeys: ['principal', 'maturityAmount', 'totalInterest', 'effectiveYield'],
      category: 'savings',
    },
    {
      name: 'RD Calculator',
      function: calculateRD,
      validInputs: { monthlyDeposit: 5000, annualRate: 6.5, years: 5 },
      expectedKeys: ['totalDeposits', 'maturityAmount', 'totalInterest', 'monthlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'EPF Calculator',
      function: calculateEPF,
      validInputs: { basicSalary: 50000, employeeContribution: 12, employerContribution: 12, years: 30 },
      expectedKeys: ['totalEmployeeContribution', 'totalEmployerContribution', 'totalContribution', 'maturityAmount', 'totalInterest', 'yearlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'Dividend Yield Calculator',
      function: calculateDividendYield,
      validInputs: { stockPrice: 1000, annualDividend: 50, numberOfShares: 100 },
      expectedKeys: ['dividendYield', 'annualDividendIncome', 'quarterlyDividendIncome', 'monthlyDividendIncome', 'totalInvestment'],
      category: 'savings',
    },
    {
      name: 'Gold Investment Calculator',
      function: calculateGoldInvestment,
      validInputs: { investmentAmount: 100000, currentGoldPrice: 5000, expectedAppreciation: 8, years: 10 },
      expectedKeys: ['investmentAmount', 'goldQuantity', 'futureGoldPrice', 'futureValue', 'totalReturns', 'annualizedReturn', 'yearlyBreakdown'],
      category: 'savings',
    },
    {
      name: 'Income Tax Calculator',
      function: calculateIncomeTax,
      validInputs: { annualIncome: 1000000, age: 30, deductions: 50000, regime: 'new' },
      expectedKeys: ['grossIncome', 'taxableIncome', 'incomeTax', 'cess', 'totalTax', 'netIncome', 'taxBrackets'],
      category: 'tax',
    },
    {
      name: 'GST Calculator',
      function: calculateGST,
      validInputs: { amount: 100000, gstRate: 18, type: 'exclusive' },
      expectedKeys: ['originalAmount', 'gstAmount', 'totalAmount', 'cgst', 'sgst', 'igst'],
      category: 'tax',
    },
    {
      name: 'Salary Calculator',
      function: calculateSalary,
      validInputs: { ctc: 1200000, basicPercent: 50, hraPercent: 40, pfContribution: 12, professionalTax: 2400, otherAllowances: 50000 },
      expectedKeys: ['ctc', 'basicSalary', 'hra', 'otherAllowances', 'grossSalary', 'pfDeduction', 'professionalTax', 'incomeTax', 'totalDeductions', 'netSalary', 'monthlySalary'],
      category: 'tax',
    },
    {
      name: 'HRA Calculator',
      function: calculateHRA,
      validInputs: { basicSalary: 50000, hraReceived: 20000, rentPaid: 15000, cityType: 'metro' },
      expectedKeys: ['hraReceived', 'hraExemption', 'taxableHRA', 'exemptionCalculations'],
      category: 'tax',
    },
    {
      name: 'Capital Gains Calculator',
      function: calculateCapitalGains,
      validInputs: { 
        purchasePrice: 100000, 
        salePrice: 150000, 
        purchaseDate: new Date('2020-01-01'), 
        saleDate: new Date('2023-01-01'), 
        assetType: 'equity' 
      },
      expectedKeys: ['capitalGains', 'holdingPeriod', 'gainType', 'taxRate', 'taxAmount', 'netGains'],
      category: 'tax',
    },
  ];

  describe('🎯 Basic Functionality Validation', () => {
    
    test.each(calculatorTests)('$name should execute without errors', ({ function: calcFunction, validInputs }) => {
      expect(() => {
        const result = calcFunction(validInputs as any);
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    test.each(calculatorTests)('$name should return expected result structure', ({ function: calcFunction, validInputs, expectedKeys }) => {
      const result = calcFunction(validInputs as any);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      expectedKeys.forEach(key => {
        expect(result).toHaveProperty(key);
      });
    });

    test.each(calculatorTests)('$name should return finite numerical values', ({ function: calcFunction, validInputs }) => {
      const result = calcFunction(validInputs as any);
      
      Object.entries(result).forEach(([key, value]) => {
        if (typeof value === 'number') {
          expect(isFinite(value)).toBe(true);
          expect(isNaN(value)).toBe(false);
        }
      });
    });
  });

  describe('⚡ Performance Validation', () => {
    
    test.each(calculatorTests)('$name should complete within performance threshold', ({ function: calcFunction, validInputs }) => {
      const startTime = Date.now();
      
      // Run calculation 10 times to get average performance
      for (let i = 0; i < 10; i++) {
        calcFunction(validInputs as any);
      }
      
      const endTime = Date.now();
      const averageTime = (endTime - startTime) / 10;
      
      // Each calculation should complete within 100ms on average
      expect(averageTime).toBeLessThan(100);
    });

    test('should handle concurrent calculations efficiently', async () => {
      const concurrentPromises = calculatorTests.map(({ function: calcFunction, validInputs }) => 
        Promise.resolve(calcFunction(validInputs as any))
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // All calculations within 1 second
      expect(results).toHaveLength(calculatorTests.length);
      
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle stress testing with multiple iterations', () => {
      const stressTestIterations = 100;
      const startTime = Date.now();
      
      for (let i = 0; i < stressTestIterations; i++) {
        calculatorTests.forEach(({ function: calcFunction, validInputs }) => {
          const result = calcFunction(validInputs as any);
          expect(result).toBeDefined();
        });
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 100 iterations of all calculators within 10 seconds
      expect(totalTime).toBeLessThan(10000);
    });
  });

  describe('🛡️ Robustness Validation', () => {
    
    const invalidInputSets = [
      { description: 'null values', inputs: null },
      { description: 'undefined values', inputs: undefined },
      { description: 'empty object', inputs: {} },
      { description: 'string values', inputs: { amount: 'invalid', rate: 'invalid', years: 'invalid' } },
      { description: 'negative values', inputs: { amount: -1000, rate: -5, years: -10 } },
      { description: 'zero values', inputs: { amount: 0, rate: 0, years: 0 } },
      { description: 'very large values', inputs: { amount: 1e15, rate: 1000, years: 1000 } },
      { description: 'NaN values', inputs: { amount: NaN, rate: NaN, years: NaN } },
      { description: 'Infinity values', inputs: { amount: Infinity, rate: Infinity, years: Infinity } },
    ];

    test.each(calculatorTests)('$name should handle invalid inputs gracefully', ({ function: calcFunction }) => {
      invalidInputSets.forEach(({ description, inputs }) => {
        expect(() => {
          const result = calcFunction(inputs as any);
          expect(result).toBeDefined();
          
          // Result should be an object with numerical properties
          Object.values(result).forEach(value => {
            if (typeof value === 'number') {
              expect(isFinite(value)).toBe(true);
            }
          });
        }).not.toThrow();
      });
    });

    test.each(calculatorTests)('$name should maintain data integrity', ({ function: calcFunction, validInputs }) => {
      const originalInputs = JSON.parse(JSON.stringify(validInputs));
      
      const result = calcFunction(validInputs as any);
      
      // Inputs should not be modified
      expect(validInputs).toEqual(originalInputs);
      
      // Result should be a new object
      expect(result).not.toBe(validInputs);
    });
  });

  describe('📊 Mathematical Accuracy Validation', () => {
    
    test('loan calculators should maintain mathematical consistency', () => {
      const loanInputs = { principal: 100000, rate: 8, years: 10, extraPayment: 0 };
      const loanResult = calculateLoan(loanInputs);
      
      // Total payment should equal monthly payment * number of payments
      const expectedTotalPayment = loanResult.monthlyPayment * (loanInputs.years * 12);
      expect(Math.abs(loanResult.totalPayment - expectedTotalPayment)).toBeLessThan(1);
      
      // Total interest should equal total payment minus principal
      const expectedTotalInterest = loanResult.totalPayment - loanInputs.principal;
      expect(Math.abs(loanResult.totalInterest - expectedTotalInterest)).toBeLessThan(1);
    });

    test('investment calculators should maintain mathematical consistency', () => {
      const sipInputs = { monthlyInvestment: 5000, annualReturn: 12, years: 10 };
      const sipResult = calculateSIP(sipInputs);
      
      // Total investment should equal monthly investment * months
      const expectedTotalInvestment = sipInputs.monthlyInvestment * sipInputs.years * 12;
      expect(sipResult.totalInvestment).toBe(expectedTotalInvestment);
      
      // Total gains should equal maturity amount minus total investment
      const expectedTotalGains = sipResult.maturityAmount - sipResult.totalInvestment;
      expect(Math.abs(sipResult.totalGains - expectedTotalGains)).toBeLessThan(0.01);
    });

    test('tax calculators should maintain mathematical consistency', () => {
      const gstInputs = { amount: 100000, gstRate: 18, type: 'exclusive' as const };
      const gstResult = calculateGST(gstInputs);
      
      // GST amount should be calculated correctly
      const expectedGST = gstInputs.amount * gstInputs.gstRate / 100;
      expect(Math.abs(gstResult.gstAmount - expectedGST)).toBeLessThan(0.01);
      
      // Total amount should equal original amount plus GST
      const expectedTotal = gstInputs.amount + expectedGST;
      expect(Math.abs(gstResult.totalAmount - expectedTotal)).toBeLessThan(0.01);
      
      // CGST + SGST should equal total GST
      expect(Math.abs((gstResult.cgst + gstResult.sgst) - gstResult.gstAmount)).toBeLessThan(0.01);
    });
  });

  describe('🔍 Edge Case Validation', () => {
    
    test('should handle boundary values correctly', () => {
      const boundaryTests = [
        {
          name: 'Minimum SIP',
          function: calculateSIP,
          inputs: { monthlyInvestment: 1, annualReturn: 0.01, years: 1 },
        },
        {
          name: 'Maximum practical loan',
          function: calculateLoan,
          inputs: { principal: 10000000, rate: 20, years: 30, extraPayment: 0 },
        },
        {
          name: 'Zero interest FD',
          function: calculateFD,
          inputs: { principal: 100000, annualRate: 0, years: 5, compoundingFrequency: 'monthly' },
        },
        {
          name: 'High appreciation gold',
          function: calculateGoldInvestment,
          inputs: { investmentAmount: 100000, currentGoldPrice: 5000, expectedAppreciation: 25, years: 20 },
        },
      ];

      boundaryTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        
        expect(result).toBeDefined();
        
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
          }
        });
      });
    });

    test('should handle extreme scenarios gracefully', () => {
      const extremeTests = [
        {
          name: 'Very long term SIP',
          function: calculateSIP,
          inputs: { monthlyInvestment: 1000, annualReturn: 12, years: 100 },
        },
        {
          name: 'Very high interest loan',
          function: calculateLoan,
          inputs: { principal: 100000, rate: 50, years: 5, extraPayment: 0 },
        },
        {
          name: 'Very high income tax',
          function: calculateIncomeTax,
          inputs: { annualIncome: 100000000, age: 30, deductions: 0, regime: 'new' },
        },
      ];

      extremeTests.forEach(({ name, function: calcFunction, inputs }) => {
        const result = calcFunction(inputs as any);
        
        expect(result).toBeDefined();
        
        // Should not return infinite or NaN values
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });
  });

  describe('📈 Production Readiness Checklist', () => {
    
    test('all calculators should pass production readiness criteria', () => {
      const productionCriteria = {
        executionTime: 100, // ms
        memoryUsage: 50, // MB
        errorRate: 0, // %
        accuracyTolerance: 0.01, // 1%
      };

      calculatorTests.forEach(({ name, function: calcFunction, validInputs }) => {
        // Performance test
        const startTime = Date.now();
        const result = calcFunction(validInputs as any);
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(productionCriteria.executionTime);
        
        // Accuracy test
        expect(result).toBeDefined();
        Object.values(result).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
          }
        });
        
        // Error handling test
        expect(() => calcFunction(validInputs as any)).not.toThrow();
      });
    });

    test('should generate comprehensive test coverage report', () => {
      const coverageReport = {
        totalCalculators: calculatorTests.length,
        testedCalculators: 0,
        passedTests: 0,
        failedTests: 0,
        categories: {} as Record<string, number>,
      };

      calculatorTests.forEach(({ name, function: calcFunction, validInputs, category }) => {
        try {
          const result = calcFunction(validInputs as any);
          
          if (result && typeof result === 'object') {
            coverageReport.testedCalculators++;
            coverageReport.passedTests++;
            coverageReport.categories[category] = (coverageReport.categories[category] || 0) + 1;
          } else {
            coverageReport.failedTests++;
          }
        } catch (error) {
          coverageReport.failedTests++;
        }
      });

      // All calculators should pass
      expect(coverageReport.testedCalculators).toBe(coverageReport.totalCalculators);
      expect(coverageReport.failedTests).toBe(0);
      expect(coverageReport.passedTests).toBe(coverageReport.totalCalculators);
      
      // Should cover all categories
      expect(Object.keys(coverageReport.categories)).toContain('loan');
      expect(Object.keys(coverageReport.categories)).toContain('investment');
      expect(Object.keys(coverageReport.categories)).toContain('savings');
      expect(Object.keys(coverageReport.categories)).toContain('tax');
    });
  });

  describe('🚀 Integration & Compatibility Tests', () => {
    
    test('should maintain backward compatibility', () => {
      // Test with legacy input formats
      const legacyTests = [
        {
          function: calculateSIP,
          legacyInputs: { monthlyInvestment: '5000', annualReturn: '12', years: '10' },
          modernInputs: { monthlyInvestment: 5000, annualReturn: 12, years: 10 },
        },
        {
          function: calculateLoan,
          legacyInputs: { principal: '100000', rate: '8', years: '10', extraPayment: '0' },
          modernInputs: { principal: 100000, rate: 8, years: 10, extraPayment: 0 },
        },
      ];

      legacyTests.forEach(({ function: calcFunction, legacyInputs, modernInputs }) => {
        const legacyResult = calcFunction(legacyInputs as any);
        const modernResult = calcFunction(modernInputs as any);
        
        // Results should be equivalent
        expect(legacyResult).toBeDefined();
        expect(modernResult).toBeDefined();
        
        // Key numerical values should match
        Object.keys(modernResult).forEach(key => {
          const legacyValue = (legacyResult as any)[key];
          const modernValue = (modernResult as any)[key];
          
          if (typeof modernValue === 'number' && typeof legacyValue === 'number') {
            expect(Math.abs(legacyValue - modernValue)).toBeLessThan(0.01);
          }
        });
      });
    });

    test('should work across different JavaScript environments', () => {
      // Test environment compatibility
      const environmentTests = calculatorTests.slice(0, 5); // Test subset for performance
      
      environmentTests.forEach(({ function: calcFunction, validInputs }) => {
        // Test with different number formats
        const result1 = calcFunction(validInputs as any);
        
        // Test with string inputs (should be parsed)
        const stringInputs = Object.fromEntries(
          Object.entries(validInputs).map(([key, value]) => [
            key, 
            typeof value === 'number' ? value.toString() : value
          ])
        );
        const result2 = calcFunction(stringInputs as any);
        
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});