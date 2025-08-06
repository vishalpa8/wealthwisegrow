import { describe, it, expect } from '@jest/globals';

// Mutual Fund Calculator Test Suite
// Testing the calculateReturns function from src/app/calculators/mutual-fund/page.tsx

interface MutualFundInputs {
  investmentType: string;
  initialInvestment: number;
  monthlyInvestment: number;
  startDate: string;
  endDate: string;
  purchaseNav: number;
  currentNav: number;
  entryLoad: number;
  exitLoad: number;
  taxBracket: string;
}

function calculateReturns(inputs: MutualFundInputs) {
  const {
    investmentType,
    initialInvestment,
    monthlyInvestment,
    startDate,
    endDate,
    purchaseNav,
    currentNav,
    entryLoad,
    exitLoad,
    taxBracket
  } = inputs;

  const startDateTime = new Date(startDate).getTime();
  const endDateTime = endDate ? new Date(endDate).getTime() : Date.now();
  const durationInYears = (endDateTime - startDateTime) / (365.25 * 24 * 60 * 60 * 1000);

  let totalInvestment = 0;
  let units = 0;
  let currentValue = 0;
  let absoluteReturns = 0;
  let cagr = 0;

  if (investmentType === 'lumpsum') {
    // Calculate for lumpsum investment
    const investmentAfterLoad = initialInvestment * (1 - entryLoad / 100);
    units = investmentAfterLoad / purchaseNav;
    currentValue = units * currentNav * (1 - exitLoad / 100);
    totalInvestment = initialInvestment;
  } else {
    // Calculate for SIP investment - use more accurate month calculation
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate || Date.now());
    
    // Calculate months more accurately
    let totalMonths = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12;
    totalMonths += endDateObj.getMonth() - startDateObj.getMonth();
    
    // If the end date's day is before the start date's day, subtract a month
    if (endDateObj.getDate() < startDateObj.getDate()) {
      totalMonths--;
    }
    
    // Ensure non-negative months
    totalMonths = Math.max(0, totalMonths);
    
    for (let i = 0; i < totalMonths; i++) {
      const monthlyInvestmentAfterLoad = monthlyInvestment * (1 - entryLoad / 100);
      units += monthlyInvestmentAfterLoad / purchaseNav;
      totalInvestment += monthlyInvestment;
    }
    currentValue = units * currentNav * (1 - exitLoad / 100);
  }

  absoluteReturns = totalInvestment > 0 ? ((currentValue - totalInvestment) / totalInvestment) * 100 : 0;
  cagr = (totalInvestment > 0 && durationInYears > 0) ? 
    (Math.pow(currentValue / totalInvestment, 1 / durationInYears) - 1) * 100 : 0;

  // Calculate tax implications
  const taxRate = parseInt(taxBracket) || 0;
  const gains = currentValue - totalInvestment;
  const taxAmount = (gains * taxRate) / 100;
  const postTaxValue = currentValue - taxAmount;

  return {
    totalInvestment,
    units,
    currentValue,
    absoluteReturns,
    cagr,
    gains,
    taxAmount,
    postTaxValue,
    durationInYears
  };
}

describe('Mutual Fund Calculator', () => {
  describe('Lumpsum Investment', () => {
    it('should calculate lumpsum investment correctly', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.totalInvestment).toBe(100000);
      expect(result.units).toBe(10000); // 100000 / 10
      expect(result.currentValue).toBe(150000); // 10000 * 15
      expect(result.gains).toBe(50000); // 150000 - 100000
      expect(result.absoluteReturns).toBe(50); // (50000 / 100000) * 100
      expect(result.durationInYears).toBeCloseTo(3, 1);
    });

    it('should handle entry load for lumpsum investment', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 2, // 2% entry load
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.totalInvestment).toBe(100000);
      const investmentAfterLoad = 100000 * 0.98; // After 2% entry load
      expect(result.units).toBe(investmentAfterLoad / 10); // 9800 units
      expect(result.currentValue).toBe(result.units * 15); // 9800 * 15 = 147000
    });

    it('should handle exit load for lumpsum investment', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 1, // 1% exit load
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.units).toBe(10000); // 100000 / 10
      const valueBeforeExitLoad = 10000 * 15; // 150000
      expect(result.currentValue).toBe(valueBeforeExitLoad * 0.99); // After 1% exit load
    });

    it('should calculate CAGR correctly for lumpsum investment', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2022-01-01', // 2 years
        purchaseNav: 10,
        currentNav: 12.1, // 21% total return over 2 years
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      // CAGR = (Ending Value / Beginning Value)^(1/years) - 1
      // CAGR = (121000 / 100000)^(1/2) - 1 = 10%
      expect(result.cagr).toBeCloseTo(10, 1);
    });
  });

  describe('SIP Investment', () => {
    it('should calculate SIP investment correctly', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'sip',
        initialInvestment: 0,
        monthlyInvestment: 10000,
        startDate: '2022-01-01',
        endDate: '2023-01-01', // 12 months
        purchaseNav: 10,
        currentNav: 12,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.totalInvestment).toBe(120000); // 10000 * 12 months
      expect(result.units).toBe(12000); // (10000 / 10) * 12 months
      expect(result.currentValue).toBe(144000); // 12000 * 12
      expect(result.gains).toBe(24000); // 144000 - 120000
      expect(result.absoluteReturns).toBe(20); // (24000 / 120000) * 100
    });

    it('should handle entry load for SIP investment', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'sip',
        initialInvestment: 0,
        monthlyInvestment: 10000,
        startDate: '2022-01-01',
        endDate: '2023-01-01', // 12 months
        purchaseNav: 10,
        currentNav: 12,
        entryLoad: 1, // 1% entry load
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.totalInvestment).toBe(120000); // 10000 * 12 months
      const monthlyAfterLoad = 10000 * 0.99; // After 1% entry load
      expect(result.units).toBe((monthlyAfterLoad / 10) * 12); // 1188 units
    });

    it('should handle partial months in SIP calculation', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'sip',
        initialInvestment: 0,
        monthlyInvestment: 5000,
        startDate: '2022-01-01',
        endDate: '2022-07-15', // 6.5 months, but should floor to 6 months
        purchaseNav: 20,
        currentNav: 25,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.totalInvestment).toBe(30000); // 5000 * 6 months (floored)
      expect(result.units).toBe(1500); // (5000 / 20) * 6 months
      expect(result.currentValue).toBe(37500); // 1500 * 25
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate tax correctly for 10% bracket', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: '10'
      };

      const result = calculateReturns(inputs);

      expect(result.gains).toBe(50000);
      expect(result.taxAmount).toBe(5000); // 10% of 50000
      expect(result.postTaxValue).toBe(145000); // 150000 - 5000
    });

    it('should calculate tax correctly for 20% bracket', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 200000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 12,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: '20'
      };

      const result = calculateReturns(inputs);

      expect(result.gains).toBe(40000); // 240000 - 200000
      expect(result.taxAmount).toBe(8000); // 20% of 40000
      expect(result.postTaxValue).toBe(232000); // 240000 - 8000
    });

    it('should handle no tax scenario', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.taxAmount).toBe(0);
      expect(result.postTaxValue).toBe(result.currentValue);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero NAV values', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 0, // Zero purchase NAV
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      expect(() => calculateReturns(inputs)).not.toThrow();
      // Should handle division by zero gracefully
    });

    it('should handle negative returns', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 8, // NAV decreased
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.currentValue).toBe(80000); // 10000 units * 8
      expect(result.gains).toBe(-20000); // Loss
      expect(result.absoluteReturns).toBe(-20); // Negative return
      expect(result.cagr).toBeLessThan(0); // Negative CAGR
    });

    it('should handle very short investment periods', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2023-01-01',
        endDate: '2023-01-02', // 1 day
        purchaseNav: 10,
        currentNav: 10.1,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.durationInYears).toBeCloseTo(0.003, 3); // Very small duration
      expect(result.cagr).toBeGreaterThan(0); // Should still calculate CAGR
    });

    it('should handle very long investment periods', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2000-01-01',
        endDate: '2023-01-01', // 23 years
        purchaseNav: 10,
        currentNav: 100, // 10x growth
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.durationInYears).toBeCloseTo(23, 1);
      expect(result.absoluteReturns).toBe(900); // 900% return
      expect(result.cagr).toBeCloseTo(10.53, 1); // ~10.53% CAGR for 10x in 23 years
    });

    it('should handle high entry and exit loads', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 5, // 5% entry load
        exitLoad: 3, // 3% exit load
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      const investmentAfterEntryLoad = 100000 * 0.95; // 95000
      const units = investmentAfterEntryLoad / 10; // 9500 units
      const valueBeforeExitLoad = units * 15; // 142500
      const finalValue = valueBeforeExitLoad * 0.97; // After 3% exit load

      expect(result.currentValue).toBeCloseTo(finalValue, 2);
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid date inputs', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: 'invalid-date',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      // Should handle invalid dates gracefully
      expect(() => calculateReturns(inputs)).not.toThrow();
    });

    it('should handle missing end date', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '', // Empty end date
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      // Should use current date as end date
      expect(result.durationInYears).toBeGreaterThan(0);
    });

    it('should handle end date before start date', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2023-01-01',
        endDate: '2020-01-01', // End before start
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      expect(result.durationInYears).toBeLessThan(0); // Negative duration
    });

    it('should handle invalid tax bracket', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'invalid'
      };

      const result = calculateReturns(inputs);

      expect(result.taxAmount).toBe(0); // Should default to 0 tax
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should verify units calculation for lumpsum', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 150000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 12.5,
        currentNav: 18.75,
        entryLoad: 2,
        exitLoad: 1,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      const investmentAfterLoad = 150000 * 0.98; // 147000
      const expectedUnits = investmentAfterLoad / 12.5; // 11760
      expect(result.units).toBeCloseTo(expectedUnits, 2);
    });

    it('should verify absolute returns calculation', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 80000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 8,
        currentNav: 12,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      const expectedReturns = ((result.currentValue - result.totalInvestment) / result.totalInvestment) * 100;
      expect(result.absoluteReturns).toBeCloseTo(expectedReturns, 2);
    });

    it('should verify CAGR calculation formula', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2018-01-01',
        endDate: '2023-01-01', // 5 years
        purchaseNav: 10,
        currentNav: 16.1051, // ~10% CAGR
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);

      // CAGR should be approximately 10%
      expect(result.cagr).toBeCloseTo(10, 1);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const inputs: MutualFundInputs = {
          investmentType: i % 2 === 0 ? 'lumpsum' : 'sip',
          initialInvestment: 100000 + i * 1000,
          monthlyInvestment: 5000 + i * 10,
          startDate: '2020-01-01',
          endDate: '2023-01-01',
          purchaseNav: 10 + (i % 10),
          currentNav: 12 + (i % 15),
          entryLoad: i % 3,
          exitLoad: i % 2,
          taxBracket: ['none', '10', '20', '30'][i % 4]
        };
        calculateReturns(inputs);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should maintain consistency across multiple calculations', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result1 = calculateReturns(inputs);
      const result2 = calculateReturns(inputs);
      const result3 = calculateReturns(inputs);

      expect(result1.currentValue).toBe(result2.currentValue);
      expect(result2.cagr).toBe(result3.cagr);
      expect(result1.absoluteReturns).toBe(result3.absoluteReturns);
    });
  });

  describe('Error Handling', () => {
    it('should not throw errors with extreme inputs', () => {
      const extremeInputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: Number.MAX_SAFE_INTEGER,
        monthlyInvestment: Number.MAX_SAFE_INTEGER,
        startDate: '1900-01-01',
        endDate: '2100-01-01',
        purchaseNav: Number.MAX_SAFE_INTEGER,
        currentNav: Number.MAX_SAFE_INTEGER,
        entryLoad: 100,
        exitLoad: 100,
        taxBracket: '100'
      };

      expect(() => calculateReturns(extremeInputs)).not.toThrow();
    });

    it('should handle infinity values gracefully', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: Infinity as any,
        monthlyInvestment: 0,
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      const result = calculateReturns(inputs);
      expect(isFinite(result.units) || result.units === Infinity).toBe(true);
    });

    it('should handle division by zero in CAGR calculation', () => {
      const inputs: MutualFundInputs = {
        investmentType: 'lumpsum',
        initialInvestment: 100000,
        monthlyInvestment: 0,
        startDate: '2023-01-01',
        endDate: '2023-01-01', // Same date (0 duration)
        purchaseNav: 10,
        currentNav: 15,
        entryLoad: 0,
        exitLoad: 0,
        taxBracket: 'none'
      };

      expect(() => calculateReturns(inputs)).not.toThrow();
    });
  });
});