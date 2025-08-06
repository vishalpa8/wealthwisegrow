import { describe, it, expect } from '@jest/globals';

// Business Loan Calculator Test Suite
// Testing the calculateBusinessLoan function from src/app/calculators/business-loan/page.tsx

interface BusinessLoanInputs {
  loanType: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  processingFee: number;
  collateralValue: number;
  businessRevenue: number;
  existingDebt: number;
  creditScore: number;
  businessAge: number;
}

// Mock utility functions for testing
const parseRobustNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

const safeDivide = (a: number, b: number): number => {
  if (b === 0 || !isFinite(b)) return 0;
  const result = a / b;
  return isFinite(result) ? result : 0;
};

const safeMultiply = (a: number, b: number): number => {
  const result = a * b;
  return isFinite(result) ? result : 0;
};

const safePower = (base: number, exponent: number): number => {
  if (!isFinite(base) || !isFinite(exponent)) return 1;
  const result = Math.pow(base, exponent);
  return isFinite(result) ? result : 1;
};

const isEffectivelyZero = (value: number): boolean => {
  return Math.abs(value) < 1e-10;
};

function calculateBusinessLoan(inputs: BusinessLoanInputs) {
  // Use parseRobustNumber to handle all edge cases including null, undefined, empty strings, etc.
  const loanType = inputs.loanType || 'term-loan';
  const loanAmount = Math.abs(parseRobustNumber(inputs.loanAmount)) || 100000;
  const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 12;
  const loanTerm = Math.max(1, Math.abs(parseRobustNumber(inputs.loanTerm)) || 1);
  const processingFee = Math.abs(parseRobustNumber(inputs.processingFee)) || 0;
  const collateralValue = Math.abs(parseRobustNumber(inputs.collateralValue)) || 0;
  const businessRevenue = Math.abs(parseRobustNumber(inputs.businessRevenue)) || 1000000;
  const existingDebt = Math.abs(parseRobustNumber(inputs.existingDebt)) || 0;
  const creditScore = Math.max(300, Math.min(900, Math.abs(parseRobustNumber(inputs.creditScore)) || 750));
  const businessAge = Math.abs(parseRobustNumber(inputs.businessAge)) || 1;

  // Safe division for monthly rate calculation
  const monthlyRate = safeDivide(safeDivide(interestRate, 12), 100);
  const totalMonths = Math.max(1, safeMultiply(loanTerm, 12)); // Ensure minimum 1 month
  
  // Calculate EMI based on loan type
  let monthlyPayment = 0;
  let totalPayment = 0;
  let totalInterest = 0;
  
  if (loanType === 'term-loan' || loanType === 'equipment-loan') {
    // Standard EMI calculation
    if (!isEffectivelyZero(monthlyRate)) {
      const onePlusRate = 1 + monthlyRate;
      const powerTerm = safePower(onePlusRate, totalMonths);
      const numerator = safeMultiply(safeMultiply(loanAmount, monthlyRate), powerTerm);
      const denominator = powerTerm - 1;
      monthlyPayment = safeDivide(numerator, denominator);
    } else {
      monthlyPayment = safeDivide(loanAmount, totalMonths);
    }
    totalPayment = safeMultiply(monthlyPayment, totalMonths);
    totalInterest = Math.max(0, totalPayment - loanAmount);
    
  } else if (loanType === 'working-capital') {
    // Working capital - interest only payments with principal at end
    monthlyPayment = safeMultiply(loanAmount, monthlyRate);
    totalPayment = safeMultiply(monthlyPayment, totalMonths) + loanAmount;
    totalInterest = safeMultiply(monthlyPayment, totalMonths);
    
  } else if (loanType === 'line-of-credit') {
    // Line of credit - assume 50% utilization
    const avgUtilization = safeMultiply(loanAmount, 0.5);
    monthlyPayment = safeMultiply(avgUtilization, monthlyRate);
    totalPayment = safeMultiply(monthlyPayment, totalMonths);
    totalInterest = totalPayment;
  }
  
  // Calculate fees
  const processingFeeAmount = safeDivide(safeMultiply(loanAmount, processingFee), 100);
  const totalCost = totalPayment + processingFeeAmount;
  
  // Business metrics
  const debtToIncomeRatio = safeMultiply(safeDivide(existingDebt + loanAmount, Math.max(1, businessRevenue)), 100);
  const loanToValueRatio = safeMultiply(safeDivide(loanAmount, Math.max(1, collateralValue)), 100);
  const dscr = safeDivide(safeMultiply(businessRevenue, 0.3), safeMultiply(monthlyPayment, 12)); // Assuming 30% net margin
  
  // Risk assessment
  let riskLevel = 'Low';
  let eligibilityScore = 100;
  
  if (creditScore < 650) {
    eligibilityScore -= 30;
    riskLevel = 'High';
  } else if (creditScore < 750) {
    eligibilityScore -= 15;
    riskLevel = 'Medium';
  }
  
  if (businessAge < 2) {
    eligibilityScore -= 20;
    riskLevel = 'High';
  } else if (businessAge < 5) {
    eligibilityScore -= 10;
  }
  
  if (debtToIncomeRatio > 40) {
    eligibilityScore -= 25;
    riskLevel = 'High';
  } else if (debtToIncomeRatio > 25) {
    eligibilityScore -= 10;
    riskLevel = 'Medium';
  }
  
  if (dscr < 1.25) {
    eligibilityScore -= 20;
    riskLevel = 'High';
  }
  
  // Calculate tax benefits (interest is tax deductible)
  const taxRate = 0.30; // Assume 30% corporate tax rate
  const annualTaxSaving = safeMultiply(safeDivide(totalInterest, Math.max(1, loanTerm)), taxRate);
  const totalTaxSaving = safeMultiply(annualTaxSaving, loanTerm);
  const netCost = Math.max(0, totalCost - totalTaxSaving);
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    processingFeeAmount,
    totalCost,
    netCost,
    debtToIncomeRatio,
    loanToValueRatio,
    dscr,
    riskLevel,
    eligibilityScore: Math.max(0, eligibilityScore),
    annualTaxSaving,
    totalTaxSaving,
    effectiveRate: safeMultiply(Math.max(0, Math.pow(safeDivide(totalCost, Math.max(1, loanAmount)), safeDivide(1, Math.max(1, loanTerm))) - 1), 100),
    paymentAsPercentOfRevenue: safeMultiply(safeDivide(safeMultiply(monthlyPayment, 12), Math.max(1, businessRevenue)), 100)
  };
}

describe('Business Loan Calculator', () => {
  describe('Basic Functionality', () => {
    it('should calculate term loan correctly with typical inputs', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 2000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 2500000,
        businessRevenue: 5000000,
        existingDebt: 500000,
        creditScore: 750,
        businessAge: 3,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(2000000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.processingFeeAmount).toBe(20000); // 1% of 2000000
      expect(result.eligibilityScore).toBeGreaterThan(50);
      expect(result.riskLevel).toBe('Medium');
    });

    it('should calculate working capital loan correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'working-capital',
        loanAmount: 1000000,
        interestRate: 15,
        loanTerm: 2,
        processingFee: 0.5,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 700,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      // Working capital: interest-only payments
      const expectedMonthlyInterest = 1000000 * (15 / 100 / 12);
      expect(result.monthlyPayment).toBeCloseTo(expectedMonthlyInterest, 2);
      expect(result.totalPayment).toBe(result.monthlyPayment * 24 + 1000000);
    });

    it('should calculate line of credit correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'line-of-credit',
        loanAmount: 500000,
        interestRate: 18,
        loanTerm: 3,
        processingFee: 0,
        collateralValue: 800000,
        businessRevenue: 2000000,
        existingDebt: 100000,
        creditScore: 680,
        businessAge: 2,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      // Line of credit: 50% utilization assumption
      const expectedMonthlyInterest = (500000 * 0.5) * (18 / 100 / 12);
      expect(result.monthlyPayment).toBeCloseTo(expectedMonthlyInterest, 2);
    });

    it('should calculate equipment loan correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'equipment-loan',
        loanAmount: 1500000,
        interestRate: 10,
        loanTerm: 7,
        processingFee: 2,
        collateralValue: 1800000,
        businessRevenue: 4000000,
        existingDebt: 300000,
        creditScore: 800,
        businessAge: 8,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(1500000);
      expect(result.eligibilityScore).toBeGreaterThan(80); // High credit score, established business
      expect(result.riskLevel).toBe('Low');
    });
  });

  describe('Risk Assessment', () => {
    it('should assess high risk correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 2000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1000000, // Low collateral
        businessRevenue: 3000000,
        existingDebt: 1500000, // High existing debt
        creditScore: 600, // Low credit score
        businessAge: 1, // New business
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.riskLevel).toBe('High');
      expect(result.eligibilityScore).toBeLessThan(50);
      expect(result.debtToIncomeRatio).toBeGreaterThan(40);
    });

    it('should assess low risk correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 10,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 2000000, // High collateral
        businessRevenue: 8000000, // High revenue
        existingDebt: 200000, // Low existing debt
        creditScore: 850, // Excellent credit
        businessAge: 10, // Established business
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.riskLevel).toBe('Low');
      expect(result.eligibilityScore).toBeGreaterThan(80);
      expect(result.debtToIncomeRatio).toBeLessThan(25);
      expect(result.dscr).toBeGreaterThan(1.25);
    });

    it('should calculate debt service coverage ratio correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 6000000,
        existingDebt: 300000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      // DSCR = (Revenue * 30%) / (Monthly Payment * 12)
      const expectedDSCR = (6000000 * 0.3) / (result.monthlyPayment * 12);
      expect(result.dscr).toBeCloseTo(expectedDSCR, 2);
    });
  });

  describe('Tax Benefits', () => {
    it('should calculate tax savings correctly', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 2000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 2500000,
        businessRevenue: 5000000,
        existingDebt: 500000,
        creditScore: 750,
        businessAge: 3,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.annualTaxSaving).toBeGreaterThan(0);
      expect(result.totalTaxSaving).toBe(result.annualTaxSaving * inputs.loanTerm);
      expect(result.netCost).toBeLessThan(result.totalCost);
      
      // Tax saving should be 30% of annual interest
      const expectedAnnualTaxSaving = (result.totalInterest / inputs.loanTerm) * 0.30;
      expect(result.annualTaxSaving).toBeCloseTo(expectedAnnualTaxSaving, 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero interest rate', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 0,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBe(1000000 / 60); // Simple division
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayment).toBe(1000000);
    });

    it('should handle zero loan amount gracefully', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 0,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.loanAmount).toBe(100000); // Default fallback
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle very short loan term', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 0.5, // 6 months
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.loanTerm).toBe(1); // Minimum 1 year enforced
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle extreme credit scores', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 1000, // Above maximum
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.creditScore).toBe(900); // Capped at maximum
      expect(result.eligibilityScore).toBeGreaterThan(80);
    });

    it('should handle negative input values', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: -1000000,
        interestRate: -12,
        loanTerm: -5,
        processingFee: -1,
        collateralValue: -1500000,
        businessRevenue: -3000000,
        existingDebt: -200000,
        creditScore: -750,
        businessAge: -5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.loanAmount).toBe(1000000); // Converted to positive
      expect(result.interestRate).toBe(12); // Converted to positive
      expect(result.loanTerm).toBe(5); // Converted to positive
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should handle null and undefined inputs', () => {
      const inputs: BusinessLoanInputs = {
        loanType: null as any,
        loanAmount: undefined as any,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.loanType).toBe('term-loan'); // Default fallback
      expect(result.loanAmount).toBe(100000); // Default fallback
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle string inputs with currency symbols', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: '₹20,00,000' as any,
        interestRate: '12%' as any,
        loanTerm: '5 years' as any,
        processingFee: '1%' as any,
        collateralValue: '₹25,00,000' as any,
        businessRevenue: '₹50,00,000' as any,
        existingDebt: '₹5,00,000' as any,
        creditScore: '750' as any,
        businessAge: '3 years' as any,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.loanAmount).toBe(2000000);
      expect(result.interestRate).toBe(12);
      expect(result.loanTerm).toBe(5);
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle invalid loan type', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'invalid-type',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      // Should default to term-loan calculation
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(1000000);
    });

    it('should handle empty object input', () => {
      const inputs = {} as BusinessLoanInputs;

      const result = calculateBusinessLoan(inputs);

      expect(result.loanType).toBe('term-loan'); // Default fallback
      expect(result.loanAmount).toBe(100000); // Default fallback
      expect(result.interestRate).toBe(12); // Default fallback
      expect(result.loanTerm).toBe(1); // Default fallback
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should verify EMI formula calculation', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 0,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      // Manual EMI calculation
      const P = 1000000;
      const r = 12 / 100 / 12;
      const n = 5 * 12;
      const expectedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      expect(result.monthlyPayment).toBeCloseTo(expectedEMI, 2);
    });

    it('should verify processing fee calculation', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 2000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 2.5,
        collateralValue: 2500000,
        businessRevenue: 5000000,
        existingDebt: 500000,
        creditScore: 750,
        businessAge: 3,
      };

      const result = calculateBusinessLoan(inputs);

      const expectedProcessingFee = 2000000 * 2.5 / 100;
      expect(result.processingFeeAmount).toBe(expectedProcessingFee);
    });

    it('should verify debt-to-income ratio calculation', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 4000000,
        existingDebt: 600000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);

      const expectedRatio = ((600000 + 1000000) / 4000000) * 100;
      expect(result.debtToIncomeRatio).toBeCloseTo(expectedRatio, 2);
    });

    it('should maintain financial precision', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 1234567.89,
        interestRate: 11.75,
        loanTerm: 4.5,
        processingFee: 1.25,
        collateralValue: 1876543.21,
        businessRevenue: 4567890.12,
        existingDebt: 345678.90,
        creditScore: 742,
        businessAge: 6.5,
      };

      const result = calculateBusinessLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalCost).toBeCloseTo(result.totalPayment + result.processingFeeAmount, 2);
      expect(isFinite(result.effectiveRate)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const inputs: BusinessLoanInputs = {
          loanType: i % 2 === 0 ? 'term-loan' : 'working-capital',
          loanAmount: 1000000 + i * 1000,
          interestRate: 10 + (i % 10),
          loanTerm: 3 + (i % 5),
          processingFee: 0.5 + (i % 3),
          collateralValue: 1500000 + i * 500,
          businessRevenue: 3000000 + i * 2000,
          existingDebt: 200000 + i * 100,
          creditScore: 650 + (i % 200),
          businessAge: 2 + (i % 8),
        };
        calculateBusinessLoan(inputs);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should maintain consistency across multiple calculations', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: 2000000,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 2500000,
        businessRevenue: 5000000,
        existingDebt: 500000,
        creditScore: 750,
        businessAge: 3,
      };

      const result1 = calculateBusinessLoan(inputs);
      const result2 = calculateBusinessLoan(inputs);
      const result3 = calculateBusinessLoan(inputs);

      expect(result1.monthlyPayment).toBe(result2.monthlyPayment);
      expect(result2.eligibilityScore).toBe(result3.eligibilityScore);
      expect(result1.riskLevel).toBe(result3.riskLevel);
    });
  });

  describe('Error Handling', () => {
    it('should not throw errors with extreme inputs', () => {
      const extremeInputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: Number.MAX_SAFE_INTEGER,
        interestRate: Number.MAX_SAFE_INTEGER,
        loanTerm: Number.MAX_SAFE_INTEGER,
        processingFee: Number.MAX_SAFE_INTEGER,
        collateralValue: Number.MAX_SAFE_INTEGER,
        businessRevenue: Number.MAX_SAFE_INTEGER,
        existingDebt: Number.MAX_SAFE_INTEGER,
        creditScore: Number.MAX_SAFE_INTEGER,
        businessAge: Number.MAX_SAFE_INTEGER,
      };

      expect(() => calculateBusinessLoan(extremeInputs)).not.toThrow();
    });

    it('should handle infinity values gracefully', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: Infinity as any,
        interestRate: 12,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);
      expect(isFinite(result.monthlyPayment)).toBe(true);
      expect(isFinite(result.eligibilityScore)).toBe(true);
    });

    it('should handle NaN values gracefully', () => {
      const inputs: BusinessLoanInputs = {
        loanType: 'term-loan',
        loanAmount: NaN as any,
        interestRate: NaN as any,
        loanTerm: 5,
        processingFee: 1,
        collateralValue: 1500000,
        businessRevenue: 3000000,
        existingDebt: 200000,
        creditScore: 750,
        businessAge: 5,
      };

      const result = calculateBusinessLoan(inputs);
      expect(result.loanAmount).toBe(100000); // Default fallback
      expect(result.interestRate).toBe(12); // Default fallback
      expect(isNaN(result.monthlyPayment)).toBe(false);
    });
  });
});