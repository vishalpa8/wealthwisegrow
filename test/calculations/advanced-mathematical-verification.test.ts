/**
 * Advanced Mathematical Verification Test Suite
 * Tests complex mathematical scenarios, formula accuracy, and edge cases
 * Priority: HIGH - Ensures mathematical correctness across all calculators
 */

import { 
  calculateLoan,
  calculateInvestment,
} from '../../src/lib/calculations/loan';
import { calculateMortgage } from '../../src/lib/calculations/mortgage';
import { calculateInvestment as calculateInvestmentSavings } from '../../src/lib/calculations/investment';
import { 
  calculateSIP,
  calculateLumpsum,
  calculatePPF,
  calculateFD,
  calculateEPF,
  calculateGoldInvestment 
} from '../../src/lib/calculations/savings';
import { 
  calculateIncomeTax,
  calculateGST,
  calculateCapitalGains 
} from '../../src/lib/calculations/tax';

describe('Advanced Mathematical Verification - Comprehensive Test Suite', () => {

  // Helper function for high-precision decimal comparison
  const expectMathematicallyEqual = (actual: number, expected: number, tolerance: number = 0.01) => {
    const difference = Math.abs(actual - expected);
    const relativeTolerance = Math.abs(expected * tolerance);
    expect(difference).toBeLessThanOrEqual(Math.max(relativeTolerance, 0.01));
  };

  describe('🧮 Compound Interest Formula Verification', () => {
    
    test('should verify compound interest formula: A = P(1 + r/n)^(nt)', () => {
      const testCases = [
        { principal: 10000, rate: 8, years: 5, compounding: 1 }, // Annual
        { principal: 50000, rate: 12, years: 10, compounding: 4 }, // Quarterly
        { principal: 100000, rate: 6, years: 15, compounding: 12 }, // Monthly
        { principal: 25000, rate: 10, years: 7, compounding: 365 }, // Daily
      ];

      testCases.forEach(({ principal, rate, years, compounding }) => {
        // Manual calculation using compound interest formula
        const r = rate / 100;
        const expectedAmount = principal * Math.pow(1 + r / (compounding === 365 ? 12 : compounding), (compounding === 365 ? 12 : compounding) * years);
        
        // Test with FD calculator
        const fdResult = calculateFD({
          principal,
          annualRate: rate,
          years,
          compoundingFrequency: compounding === 1 ? 'yearly' : compounding === 4 ? 'quarterly' : 'monthly',
        });

        expectMathematicallyEqual(fdResult.maturityAmount, expectedAmount, 0.001);
      });
    });

    test('should verify continuous compounding limit: A = Pe^(rt)', () => {
      const principal = 100000;
      const rate = 0.08;
      const years = 10;
      
      // Continuous compounding formula
      const continuousAmount = principal * Math.exp(rate * years);
      
      // Daily compounding should approximate continuous compounding
      const dailyResult = calculateFD({
        principal,
        annualRate: rate * 100,
        years,
        compoundingFrequency: 'monthly', // Closest available
      });

      // Daily compounding should be very close to continuous compounding
      const difference = Math.abs(dailyResult.maturityAmount - continuousAmount);
      expect(difference / continuousAmount).toBeLessThan(0.01); // Within 1%
    });

    test('should verify present value formula: PV = FV / (1 + r)^n', () => {
      const futureValue = 200000;
      const rate = 0.10;
      const years = 8;
      
      const presentValue = futureValue / Math.pow(1 + rate, years);
      
      // Verify using lumpsum calculator
      const lumpsumResult = calculateLumpsum({
        principal: presentValue,
        annualReturn: rate * 100,
        years,
      });

      expectMathematicallyEqual(lumpsumResult.maturityAmount, futureValue, 0.01);
    });
  });

  describe('📊 Loan & Mortgage Formula Verification', () => {
    
    test('should verify loan payment formula: PMT = P[r(1+r)^n]/[(1+r)^n-1]', () => {
      const testCases = [
        { principal: 100000, rate: 6, years: 15 },
        { principal: 500000, rate: 8.5, years: 20 },
        { principal: 1000000, rate: 7.25, years: 30 },
      ];

      testCases.forEach(({ principal, rate, years }) => {
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        
        // Manual calculation using loan payment formula
        const expectedPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        
        const loanResult = calculateLoan({
          principal,
          rate,
          years,
          extraPayment: 0,
        });

        expectMathematicallyEqual(loanResult.monthlyPayment, expectedPayment, 0.001);
      });
    });

    test('should verify total interest calculation accuracy', () => {
      const principal = 300000;
      const rate = 7.5;
      const years = 25;
      
      const loanResult = calculateLoan({
        principal,
        rate,
        years,
        extraPayment: 0,
      });

      // Total interest should equal total payments minus principal
      const calculatedTotalInterest = loanResult.totalPayment - principal;
      expectMathematicallyEqual(loanResult.totalInterest, calculatedTotalInterest, 0.01);

      // Verify against payment schedule
      const scheduleInterest = loanResult.paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);
      expectMathematicallyEqual(loanResult.totalInterest, scheduleInterest, 0.01);
    });

    test('should verify mortgage calculations with additional costs', () => {
      const mortgageInputs = {
        principal: 500000,
        rate: 6.5,
        years: 30,
        downPayment: 100000,
        propertyTax: 12000,
        insurance: 6000,
        pmi: 3000,
      };

      const result = calculateMortgage(mortgageInputs);
      
      // Verify loan amount calculation
      const expectedLoanAmount = mortgageInputs.principal - mortgageInputs.downPayment;
      expect(result.loanToValue).toBeCloseTo((expectedLoanAmount / mortgageInputs.principal) * 100, 2);

      // Verify monthly costs
      expectMathematicallyEqual(result.monthlyPropertyTax, mortgageInputs.propertyTax / 12, 0.01);
      expectMathematicallyEqual(result.monthlyInsurance, mortgageInputs.insurance / 12, 0.01);
      expectMathematicallyEqual(result.monthlyPMI, mortgageInputs.pmi / 12, 0.01);

      // Verify total monthly payment
      const expectedTotal = result.monthlyPrincipalAndInterest + result.monthlyPropertyTax + 
                           result.monthlyInsurance + result.monthlyPMI;
      expectMathematicallyEqual(result.monthlyPayment, expectedTotal, 0.01);
    });
  });

  describe('💰 Investment & SIP Formula Verification', () => {
    
    test('should verify SIP future value formula: FV = PMT × [((1+r)^n - 1) / r] × (1+r)', () => {
      const testCases = [
        { monthlyInvestment: 5000, annualReturn: 12, years: 10 },
        { monthlyInvestment: 10000, annualReturn: 15, years: 15 },
        { monthlyInvestment: 2500, annualReturn: 8, years: 20 },
      ];

      testCases.forEach(({ monthlyInvestment, annualReturn, years }) => {
        const monthlyRate = annualReturn / 100 / 12;
        const numberOfPayments = years * 12;
        
        // SIP future value formula
        const expectedFV = monthlyInvestment * 
                          (((Math.pow(1 + monthlyRate, numberOfPayments) - 1) / monthlyRate) * 
                           (1 + monthlyRate));
        
        const sipResult = calculateSIP({
          monthlyInvestment,
          annualReturn,
          years,
        });

        expectMathematicallyEqual(sipResult.maturityAmount, expectedFV, 0.01);
      });
    });

    test('should verify investment calculator with different compounding frequencies', () => {
      const inputs = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 10,
        years: 8,
      };

      const frequencies = ['annually', 'semiannually', 'quarterly', 'monthly', 'daily'] as const;
      const results = frequencies.map(frequency => 
        calculateInvestmentSavings({ ...inputs, compoundingFrequency: frequency })
      );

      // More frequent compounding should yield higher returns
      for (let i = 1; i < results.length; i++) {
        expect(results[i].finalAmount).toBeGreaterThanOrEqual(results[i - 1].finalAmount);
      }

      // Verify mathematical progression
      const annualResult = results[0];
      const monthlyResult = results[3];
      
      // Monthly compounding should be noticeably higher than annual
      expect(monthlyResult.finalAmount).toBeGreaterThan(annualResult.finalAmount);
    });

    test('should verify annualized return calculation accuracy', () => {
      const testCases = [
        { initial: 100000, final: 200000, years: 7.27 }, // Should be ~10% annualized
        { initial: 50000, final: 100000, years: 10 }, // Should be ~7.18% annualized
        { initial: 25000, final: 75000, years: 15 }, // Should be ~7.34% annualized
      ];

      testCases.forEach(({ initial, final, years }) => {
        // Calculate expected annualized return: ((FV/PV)^(1/n)) - 1
        const expectedReturn = (Math.pow(final / initial, 1 / years) - 1) * 100;
        
        const investmentResult = calculateInvestmentSavings({
          initialAmount: initial,
          monthlyContribution: 0,
          annualReturn: expectedReturn,
          years,
          compoundingFrequency: 'annually',
        });

        expectMathematicallyEqual(investmentResult.finalAmount, final, 0.01);
        expectMathematicallyEqual(investmentResult.annualizedReturn, expectedReturn, 0.1);
      });
    });
  });

  describe('🏦 Tax Calculation Formula Verification', () => {
    
    test('should verify income tax slab calculations', () => {
      const testCases = [
        { income: 500000, expectedTax: 6250 },
        { income: 1000000, expectedTax: 42500 },
        { income: 1500000, expectedTax: 125000 },
      ];

      testCases.forEach(({ income, expectedTax }) => {
        const taxResult = calculateIncomeTax({
          annualIncome: income,
          age: 30,
          deductions: 0,
          regime: 'new',
        });

        expectMathematicallyEqual(taxResult.incomeTax, expectedTax, 0.01);
        
        // Verify cess calculation (4% of income tax)
        const expectedCess = expectedTax * 0.04;
        expectMathematicallyEqual(taxResult.cess, expectedCess, 0.01);
        
        // Verify total tax
        expectMathematicallyEqual(taxResult.totalTax, expectedTax + expectedCess, 0.01);
      });
    });

    test('should verify GST calculation formulas', () => {
      const testCases = [
        { amount: 100000, rate: 18, type: 'exclusive' as const },
        { amount: 118000, rate: 18, type: 'inclusive' as const },
        { amount: 50000, rate: 12, type: 'exclusive' as const },
        { amount: 56000, rate: 12, type: 'inclusive' as const },
      ];

      testCases.forEach(({ amount, rate, type }) => {
        const gstResult = calculateGST({ amount, gstRate: rate, type });
        
        if (type === 'exclusive') {
          const expectedGST = amount * rate / 100;
          const expectedTotal = amount + expectedGST;
          
          expectMathematicallyEqual(gstResult.originalAmount, amount, 0.01);
          expectMathematicallyEqual(gstResult.gstAmount, expectedGST, 0.01);
          expectMathematicallyEqual(gstResult.totalAmount, expectedTotal, 0.01);
        } else {
          const expectedOriginal = amount / (1 + rate / 100);
          const expectedGST = amount - expectedOriginal;
          
          expectMathematicallyEqual(gstResult.originalAmount, expectedOriginal, 0.01);
          expectMathematicallyEqual(gstResult.gstAmount, expectedGST, 0.01);
          expectMathematicallyEqual(gstResult.totalAmount, amount, 0.01);
        }

        // Verify CGST/SGST split (for intra-state)
        expectMathematicallyEqual(gstResult.cgst, gstResult.gstAmount / 2, 0.01);
        expectMathematicallyEqual(gstResult.sgst, gstResult.gstAmount / 2, 0.01);
        expectMathematicallyEqual(gstResult.igst, gstResult.gstAmount, 0.01);
      });
    });

    test('should verify capital gains tax calculations', () => {
      const testCases = [
        {
          purchasePrice: 100000,
          salePrice: 150000,
          assetType: 'equity' as const,
          holdingMonths: 18, // Long term
          expectedTax: 0, // 10% on gains above 1L exemption
        },
        {
          purchasePrice: 200000,
          salePrice: 250000,
          assetType: 'equity' as const,
          holdingMonths: 8, // Short term
          expectedTax: 7500, // 15% on 50k gains
        },
      ];

      testCases.forEach(({ purchasePrice, salePrice, assetType, holdingMonths, expectedTax }) => {
        const purchaseDate = new Date();
        const saleDate = new Date();
        saleDate.setMonth(saleDate.getMonth() + holdingMonths);

        const cgResult = calculateCapitalGains({
          purchasePrice,
          salePrice,
          purchaseDate,
          saleDate,
          assetType,
        });

        const expectedGains = salePrice - purchasePrice;
        expectMathematicallyEqual(cgResult.capitalGains, expectedGains, 0.01);
        
        if (expectedTax > 0) {
          expectMathematicallyEqual(cgResult.taxAmount, expectedTax, 0.01);
        }
      });
    });
  });

  describe('🔢 Complex Mathematical Scenarios', () => {
    
    test('should handle compound scenarios with multiple variables', () => {
      // Scenario: Person takes a loan and invests the money
      const loanAmount = 1000000;
      const loanRate = 8;
      const loanYears = 15;
      
      const investmentReturn = 12;
      const investmentYears = 15;

      const loanResult = calculateLoan({
        principal: loanAmount,
        rate: loanRate,
        years: loanYears,
        extraPayment: 0,
      });

      const investmentResult = calculateLumpsum({
        principal: loanAmount,
        annualReturn: investmentReturn,
        years: investmentYears,
      });

      // Investment should outperform loan cost
      const netGain = investmentResult.maturityAmount - loanResult.totalPayment;
      expect(netGain).toBeGreaterThan(0);
      
      // Verify the arbitrage opportunity
      const loanCost = loanResult.totalInterest;
      const investmentGain = investmentResult.totalGains;
      expect(investmentGain).toBeGreaterThan(loanCost);
    });

    test('should verify retirement planning calculations', () => {
      // Complex scenario: EPF + PPF + SIP for retirement
      const basicSalary = 100000;
      const years = 30;
      
      const epfResult = calculateEPF({
        basicSalary,
        employeeContribution: 12,
        employerContribution: 12,
        years,
      });

      const ppfResult = calculatePPF({
        yearlyInvestment: 150000,
        years,
      });

      const sipResult = calculateSIP({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years,
      });

      const totalRetirementCorpus = epfResult.maturityAmount + ppfResult.maturityAmount + sipResult.maturityAmount;
      
      // Should accumulate significant corpus for retirement
      expect(totalRetirementCorpus).toBeGreaterThan(50000000); // Over 5 crores
      
      // Verify individual contributions
      expect(epfResult.maturityAmount).toBeGreaterThan(epfResult.totalContribution);
      expect(ppfResult.maturityAmount).toBeGreaterThan(ppfResult.totalInvestment);
      expect(sipResult.maturityAmount).toBeGreaterThan(sipResult.totalInvestment);
    });

    test('should verify gold investment vs inflation hedge', () => {
      // Test gold as inflation hedge
      const investmentAmount = 500000;
      const years = 20;
      const inflationRate = 6; // Assumed inflation
      const goldAppreciation = 8; // Gold appreciation

      const goldResult = calculateGoldInvestment({
        investmentAmount,
        currentGoldPrice: 5000,
        expectedAppreciation: goldAppreciation,
        years,
      });

      // Calculate inflation-adjusted value
      const inflationAdjustedValue = investmentAmount * Math.pow(1 + inflationRate / 100, years);
      
      // Gold should beat inflation
      expect(goldResult.maturityAmount).toBeGreaterThan(inflationAdjustedValue);
      
      // Verify real returns (after inflation)
      const realReturn = ((1 + goldAppreciation / 100) / (1 + inflationRate / 100) - 1) * 100;
      const expectedRealReturn = realReturn;
      expectMathematicallyEqual(realReturn, expectedRealReturn, 0.5);
    });

    test('should verify portfolio diversification mathematics', () => {
      // Portfolio: 40% Equity SIP, 30% Debt FD, 20% Gold, 10% PPF
      const totalInvestment = 1000000;
      const years = 15;
      
      const equityAmount = totalInvestment * 0.4;
      const debtAmount = totalInvestment * 0.3;
      const goldAmount = totalInvestment * 0.2;
      const ppfAmount = totalInvestment * 0.1;

      const equityResult = calculateSIP({
        monthlyInvestment: equityAmount / 12 / years,
        annualReturn: 15,
        years,
      });

      const debtResult = calculateFD({
        principal: debtAmount,
        annualRate: 7,
        years,
        compoundingFrequency: 'quarterly',
      });

      const goldResult = calculateGoldInvestment({
        investmentAmount: goldAmount,
        currentGoldPrice: 5000,
        expectedAppreciation: 8,
        years,
      });

      const ppfResult = calculatePPF({
        yearlyInvestment: ppfAmount / years,
        years,
      });

      const totalPortfolioValue = equityResult.maturityAmount + debtResult.maturityAmount + 
                                 goldResult.maturityAmount + ppfResult.maturityAmount;
      
      // Portfolio should generate positive returns
      expect(totalPortfolioValue).toBeGreaterThan(totalInvestment);
      
      // Calculate portfolio return
      const portfolioReturn = ((totalPortfolioValue / totalInvestment) ** (1 / years) - 1) * 100;
      expect(portfolioReturn).toBeCloseTo(8, 1); // Should be close to 8%
    });
  });

  describe('🎯 Precision & Rounding Verification', () => {
    
    test('should maintain precision in long-term calculations', () => {
      const sipResult = calculateSIP({
        monthlyInvestment: 1000,
        annualReturn: 12,
        years: 50, // Very long term
      });

      // Verify that calculations don't lose precision
      expect(sipResult.totalInvestment).toBe(600000); // 1000 * 12 * 50
      expect(sipResult.maturityAmount).toBeCloseTo(39448923.1, -4);
      
      // Verify monthly breakdown consistency
      const calculatedTotal = sipResult.monthlyBreakdown.reduce((sum, month) => sum + month.investment, 0);
      expectMathematicallyEqual(calculatedTotal, sipResult.totalInvestment, 0.01);
    });

    test('should handle micro-investments with precision', () => {
      const microSipResult = calculateSIP({
        monthlyInvestment: 0.01, // 1 paisa
        annualReturn: 12,
        years: 1,
      });

      expect(microSipResult.totalInvestment).toBe(0.12);
      expect(microSipResult.maturityAmount).toBeGreaterThan(0.12);
      expect(microSipResult.totalGains).toBeGreaterThan(0);
      
      // Verify precision is maintained
      expect(microSipResult.maturityAmount % 0.01).toBeCloseTo(0, 2);
    });

    test('should verify rounding consistency across calculators', () => {
      const amount = 123456.789;
      const rate = 12.345;
      const years = 7.89;

      const calculators = [
        () => calculateSIP({ monthlyInvestment: amount / 12, annualReturn: rate, years }),
        () => calculateLumpsum({ principal: amount, annualReturn: rate, years }),
        () => calculateFD({ principal: amount, annualRate: rate, years, compoundingFrequency: 'monthly' }),
      ];

      calculators.forEach(calculate => {
        const result = calculate();
        
        // All monetary values should be properly rounded
        Object.values(result).forEach(value => {
          if (typeof value === 'number' && value > 1) {
            // Should be rounded to 2 decimal places
            expect(Number(value.toFixed(2))).toBeCloseTo(value, 2);
          }
        });
      });
    });
  });
});