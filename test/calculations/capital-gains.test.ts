/**
 * Comprehensive Test Suite for Capital Gains Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: LOW - Capital gains tax calculations for investments
 */

import { calculateCapitalGains } from '../../src/lib/calculations/tax';
import type { CapitalGainsInputs, CapitalGainsResults } from '../../src/lib/calculations/tax';

describe('Capital Gains Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create capital gains inputs
  const createCapitalGainsInputs = (overrides: any = {}): CapitalGainsInputs => {
    const { holdingPeriod = 18, ...rest } = overrides;

    const saleDate = new Date();
    const purchaseDate = new Date(saleDate);
    if (typeof holdingPeriod === 'number' && isFinite(holdingPeriod)) {
      purchaseDate.setMonth(saleDate.getMonth() - holdingPeriod);
    }

    return {
      purchasePrice: 100000,
      salePrice: 150000,
      assetType: 'equity',
      purchaseDate,
      saleDate,
      ...rest,
    };
  };

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate short-term capital gains for equity correctly', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 150000,
        holdingPeriod: 8, // Less than 12 months for equity
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(50000); // 150000 - 100000
      expect(result.gainType).toBe('short-term');
      expect(result.taxRate).toBe(15); // STCG rate for equity
      expect(result.taxAmount).toBe(7500); // 50000 * 15%
      expect(result.netGains).toBe(42500); // 50000 - 7500
    });

    test('should calculate long-term capital gains for equity correctly', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 200000,
        holdingPeriod: 18, // More than 12 months for equity
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(100000); // 200000 - 100000
      expect(result.gainType).toBe('long-term');
      expect(result.taxRate).toBe(10); // LTCG rate for equity (above 1 lakh)
      expect(result.taxAmount).toBe(0); // First 1 lakh is exempt
      expect(result.netGains).toBe(100000); // No tax on 1 lakh gain
    });

    test('should calculate short-term capital gains for debt correctly', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 130000,
        holdingPeriod: 24, // Less than 36 months for debt
        assetType: 'debt',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(30000);
      expect(result.gainType).toBe('short-term');
      expect(result.taxRate).toBe(30); // STCG rate for debt (as per income tax slab)
      expect(result.taxAmount).toBe(9000); // 30000 * 30%
      expect(result.netGains).toBe(21000); // 30000 - 9000
    });

    test('should calculate long-term capital gains for debt correctly', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 140000,
        holdingPeriod: 40, // More than 36 months for debt
        assetType: 'debt',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(40000);
      expect(result.gainType).toBe('long-term');
      expect(result.taxRate).toBe(20); // LTCG rate for debt with indexation
      expect(result.taxAmount).toBe(8000); // 40000 * 20%
      expect(result.netGains).toBe(32000); // 40000 - 8000
    });
  });

  describe('📊 Asset Type and Holding Period Tests', () => {
    
    test('should determine gain type correctly for equity assets', () => {
      const testCases = [
        { holdingPeriod: 6, expectedGainType: 'short-term' },
        { holdingPeriod: 11, expectedGainType: 'short-term' },
        { holdingPeriod: 12, expectedGainType: 'long-term' },
        { holdingPeriod: 24, expectedGainType: 'long-term' },
      ];

      testCases.forEach(({ holdingPeriod, expectedGainType }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 150000,
          holdingPeriod,
          assetType: 'equity' 
        });
        const result = calculateCapitalGains(inputs);
        
        expect(result.gainType).toBe(expectedGainType);
      });
    });

    test('should determine gain type correctly for debt assets', () => {
      const testCases = [
        { holdingPeriod: 12, expectedGainType: 'short-term' },
        { holdingPeriod: 35, expectedGainType: 'short-term' },
        { holdingPeriod: 36, expectedGainType: 'long-term' },
        { holdingPeriod: 48, expectedGainType: 'long-term' },
      ];

      testCases.forEach(({ holdingPeriod, expectedGainType }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 150000,
          holdingPeriod,
          assetType: 'debt' 
        });
        const result = calculateCapitalGains(inputs);
        
        expect(result.gainType).toBe(expectedGainType);
      });
    });

    test('should apply correct tax rates for different asset types', () => {
      const testCases = [
        { assetType: 'equity' as const, holdingPeriod: 6, expectedRate: 15 },
        { assetType: 'equity' as const, holdingPeriod: 18, expectedRate: 10 },
        { assetType: 'debt' as const, holdingPeriod: 24, expectedRate: 30 },
        { assetType: 'debt' as const, holdingPeriod: 48, expectedRate: 20 },
      ];

      testCases.forEach(({ assetType, holdingPeriod, expectedRate }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 150000,
          holdingPeriod,
          assetType 
        });
        const result = calculateCapitalGains(inputs);
        
        expectCloseTo(result.taxRate, expectedRate, 2);
      });
    });
  });

  describe('💰 Tax Calculation Tests', () => {
    
    test('should handle LTCG exemption for equity correctly', () => {
      const testCases = [
        { gain: 50000, expectedTax: 0 }, // Below 1 lakh exemption
        { gain: 100000, expectedTax: 0 }, // Exactly 1 lakh exemption
        { gain: 150000, expectedTax: 5000 }, // 50000 above exemption * 10%
        { gain: 300000, expectedTax: 20000 }, // 200000 above exemption * 10%
      ];

      testCases.forEach(({ gain, expectedTax }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 100000 + gain,
          holdingPeriod: 18, // Long-term for equity
          assetType: 'equity' 
        });
        const result = calculateCapitalGains(inputs);
        
        expect(result.taxAmount).toBe(expectedTax);
      });
    });

    test('should calculate tax on full amount for short-term gains', () => {
      const testCases = [
        { assetType: 'equity' as const, gain: 25000, expectedTax: 3750 }, // 25000 * 15%
        { assetType: 'equity' as const, gain: 75000, expectedTax: 11250 }, // 75000 * 15%
        { assetType: 'debt' as const, gain: 40000, expectedTax: 12000 }, // 40000 * 30%
      ];

      testCases.forEach(({ assetType, gain, expectedTax }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 100000 + gain,
          holdingPeriod: 6, // Short-term
          assetType 
        });
        const result = calculateCapitalGains(inputs);
        
        expect(result.taxAmount).toBe(expectedTax);
      });
    });

    test('should calculate net gain correctly', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 200000,
        salePrice: 300000,
        holdingPeriod: 8, // Short-term equity
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      const expectedGain = 100000;
      const expectedTax = 15000; // 100000 * 15%
      const expectedNetGain = 85000; // 100000 - 15000

      expect(result.capitalGains).toBe(expectedGain);
      expect(result.taxAmount).toBe(expectedTax);
      expect(result.netGains).toBe(expectedNetGain);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero capital gains', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 100000, // Same price
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.netGains).toBe(0);
    });

    test('should handle capital losses', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 150000,
        salePrice: 100000, // Loss
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(-50000); // Loss
      expect(result.taxAmount).toBe(0); // No tax on losses
      expect(result.netGains).toBe(-50000); // Same as capital loss
    });

    test('should handle very small gains', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 100001, // ₹1 gain
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(1);
      expect(result.taxAmount).toBe(0); // Below LTCG exemption
      expect(result.netGains).toBe(1);
    });

    test('should handle very large gains', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 10000000, // Very large gain
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(9900000);
      expect(result.taxAmount).toBe(980000); // (9900000 - 100000) * 10%
      expect(result.netGains).toBe(8920000);
    });

    test('should handle boundary holding periods', () => {
      const testCases = [
        { assetType: 'equity' as const, holdingPeriod: 11.9, expectedType: 'short-term' },
        { assetType: 'equity' as const, holdingPeriod: 12.0, expectedType: 'long-term' },
        { assetType: 'debt' as const, holdingPeriod: 35.9, expectedType: 'short-term' },
        { assetType: 'debt' as const, holdingPeriod: 36.0, expectedType: 'long-term' },
      ];

      testCases.forEach(({ assetType, holdingPeriod, expectedType }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: 100000,
          salePrice: 150000,
          holdingPeriod,
          assetType 
        });
        const result = calculateCapitalGains(inputs);
        
        expect(result.gainType).toBe(expectedType);
      });
    });

    test('should handle zero purchase price', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 0,
        salePrice: 100000,
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(100000);
      expect(result.taxAmount).toBe(0); // Below LTCG exemption
      expect(result.netGains).toBe(100000);
    });

    test('should handle zero sale price', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 0,
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.capitalGains).toBe(-100000); // Total loss
      expect(result.taxAmount).toBe(0); // No tax on losses
      expect(result.netGains).toBe(-100000);
    });

    test('should handle fractional amounts', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 123456.78,
        salePrice: 234567.89,
        holdingPeriod: 15.5,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.capitalGains)).toBe(true);
      expect(Number.isFinite(result.taxAmount)).toBe(true);
      expect(Number.isFinite(result.netGains)).toBe(true);
    });

    test('should handle very short holding periods', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 120000,
        holdingPeriod: 0.1, // Very short holding
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.gainType).toBe('short-term');
      expect(result.taxAmount).toBe(3000); // 20000 * 15%
    });

    test('should handle very long holding periods', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 500000,
        holdingPeriod: 120, // 10 years
        assetType: 'debt',
      });

      const result = calculateCapitalGains(inputs);

      expect(result.gainType).toBe('long-term');
      expect(result.taxAmount).toBe(80000); // 400000 * 20%
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid purchase price inputs', () => {
      const testCases = [
        { purchasePrice: null },
        { purchasePrice: undefined },
        { purchasePrice: '' },
        { purchasePrice: 'invalid' },
        { purchasePrice: -100000 }, // Negative price
      ];

      testCases.forEach(({ purchasePrice }) => {
        const inputs = createCapitalGainsInputs({ purchasePrice: purchasePrice as any });
        const result = calculateCapitalGains(inputs);
        
        expect(result).toBeDefined();
        expect(isFinite(result.capitalGains)).toBe(true);
      });
    });

    test('should handle invalid sale price inputs', () => {
      const testCases = [
        { salePrice: null },
        { salePrice: undefined },
        { salePrice: '' },
        { salePrice: 'invalid' },
        { salePrice: -150000 }, // Negative price
      ];

      testCases.forEach(({ salePrice }) => {
        const inputs = createCapitalGainsInputs({ salePrice: salePrice as any });
        const result = calculateCapitalGains(inputs);
        
        expect(result).toBeDefined();
        expect(isFinite(result.capitalGains)).toBe(true);
      });
    });

    test('should handle invalid holding period inputs', () => {
      const testCases = [
        { holdingPeriod: null },
        { holdingPeriod: undefined },
        { holdingPeriod: '' },
        { holdingPeriod: 'invalid' },
        { holdingPeriod: -18 }, // Negative period
      ];

      testCases.forEach(({ holdingPeriod }) => {
        const inputs = createCapitalGainsInputs({ holdingPeriod: holdingPeriod as any });
        const result = calculateCapitalGains(inputs);
        
        expect(result).toBeDefined();
        expect(isFinite(result.holdingPeriod)).toBe(true);
        expect(isFinite(result.capitalGains)).toBe(true);
      });
    });

    test('should handle invalid asset type inputs', () => {
      const testCases = [
        { assetType: null },
        { assetType: undefined },
        { assetType: '' },
        { assetType: 'invalid' },
      ];

      testCases.forEach(({ assetType }) => {
        const inputs = createCapitalGainsInputs({ assetType: assetType as any });
        const result = calculateCapitalGains(inputs);
        
        expect(result).toBeDefined();
        expect(isFinite(result.taxRate)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: '₹1,00,000' as any,
        salePrice: '₹1,50,000' as any,
        holdingPeriod: '18 months' as any,
      });

      const result = calculateCapitalGains(inputs);

      expect(result).toBeDefined();
      expect(result.capitalGains).toBeGreaterThan(0);
      expect(result.taxAmount).toBeGreaterThanOrEqual(0);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000.123456789,
        salePrice: 150000.987654321,
        holdingPeriod: 18.123456789,
      });

      const result = calculateCapitalGains(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.capitalGains)).toBe(true);
      expect(Number.isFinite(result.taxAmount)).toBe(true);
      expect(Number.isFinite(result.netGains)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 1e10, // Very large purchase price
        salePrice: 2e10,
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.capitalGains)).toBe(true);
      expect(Number.isFinite(result.taxAmount)).toBe(true);
      expect(Number.isFinite(result.netGains)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify capital gain calculation accuracy', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 250000,
        salePrice: 400000,
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      // Manual calculation
      const expectedGain = 400000 - 250000; // 150000
      expect(result.capitalGains).toBe(expectedGain);
    });

    test('should verify tax calculation accuracy for LTCG equity', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 350000, // 250000 gain
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      // Manual calculation: (250000 - 100000) * 10% = 15000
      const expectedTax = (250000 - 100000) * 0.10;
      expect(result.taxAmount).toBe(expectedTax);
    });

    test('should verify tax calculation accuracy for STCG', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 180000,
        holdingPeriod: 8, // Short-term
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      // Manual calculation: 80000 * 15% = 12000
      const expectedTax = 80000 * 0.15;
      expect(result.taxAmount).toBe(expectedTax);
    });

    test('should verify net gain calculation', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 200000,
        salePrice: 300000,
        holdingPeriod: 24, // Short-term debt
        assetType: 'debt',
      });

      const result = calculateCapitalGains(inputs);

      // Manual calculation
      const expectedGain = 100000;
      const expectedTax = 30000; // 100000 * 30%
      const expectedNetGain = 70000; // 100000 - 30000

      expect(result.capitalGains).toBe(expectedGain);
      expect(result.taxAmount).toBe(expectedTax);
      expect(result.netGains).toBe(expectedNetGain);
    });

    test('should verify mathematical consistency', () => {
      const testCases = [
        { purchase: 50000, sale: 80000, holding: 6, asset: 'equity' as const },
        { purchase: 200000, sale: 350000, holding: 18, asset: 'equity' as const },
        { purchase: 100000, sale: 140000, holding: 24, asset: 'debt' as const },
        { purchase: 300000, sale: 450000, holding: 48, asset: 'debt' as const },
      ];

      testCases.forEach(({ purchase, sale, holding, asset }) => {
        const inputs = createCapitalGainsInputs({ 
          purchasePrice: purchase,
          salePrice: sale,
          holdingPeriod: holding,
          assetType: asset 
        });
        const result = calculateCapitalGains(inputs);
        
        // Basic consistency checks
        expect(result.capitalGains).toBe(sale - purchase);
        expect(result.netGains).toBe(result.capitalGains - result.taxAmount);
        
        // Tax should be non-negative
        expect(result.taxAmount).toBeGreaterThanOrEqual(0);
        
        // Gain type should be correct based on holding period and asset type
        const isLongTerm = (asset === 'equity' && holding >= 12) || 
                          (asset === 'debt' && holding >= 36);
        expect(result.gainType).toBe(isLongTerm ? 'long-term' : 'short-term');
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        purchasePrice: 50000 + i * 1000,
        salePrice: 75000 + i * 1500,
        holdingPeriod: 6 + i % 60,
        assetType: i % 2 === 0 ? 'equity' as const : 'debt' as const,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateCapitalGains(createCapitalGainsInputs(inputs));
        expect(result).toBeDefined();
        expect(result.taxAmount).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large transaction calculations efficiently', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 1000000000, // 100 crores
        salePrice: 1500000000, // 150 crores
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const startTime = Date.now();
      const result = calculateCapitalGains(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.capitalGains).toBe(500000000); // 50 crores gain
      expect(result.taxAmount).toBe(49990000); // (500,000,000 - 100,000) * 10%
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createCapitalGainsInputs({
        purchasePrice: 100000,
        salePrice: 150000,
        holdingPeriod: 18,
        assetType: 'equity',
      });

      const result = calculateCapitalGains(inputs);

      // These values should remain consistent across code changes
      expect(result.capitalGains).toBe(50000);
      expect(result.gainType).toBe('long-term');
      expect(result.taxRate).toBe(10);
      expect(result.taxAmount).toBe(0); // Below 1 lakh exemption
      expect(result.netGains).toBe(50000);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { purchasePrice: 100000, salePrice: 100000, holdingPeriod: 18, assetType: 'equity' as const },
        { purchasePrice: 150000, salePrice: 100000, holdingPeriod: 6, assetType: 'debt' as const },
        { purchasePrice: 0, salePrice: 100000, holdingPeriod: 48, assetType: 'debt' as const },
        { purchasePrice: 100000, salePrice: 1000000, holdingPeriod: 24, assetType: 'equity' as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateCapitalGains(createCapitalGainsInputs(inputs));
        
        expect(result).toBeDefined();
        expect(typeof result.capitalGains).toBe('number');
        expect(typeof result.gainType).toBe('string');
        expect(typeof result.taxRate).toBe('number');
        expect(typeof result.taxAmount).toBe('number');
        expect(typeof result.netGains).toBe('number');
        
        expect(isFinite(result.capitalGains)).toBe(true);
        expect(isFinite(result.taxRate)).toBe(true);
        expect(isFinite(result.taxAmount)).toBe(true);
        expect(isFinite(result.netGains)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createCapitalGainsInputs({
        purchasePrice: 300000,
        salePrice: 500000,
        holdingPeriod: 8,
        assetType: 'debt',
      });

      const result = calculateCapitalGains(inputs);

      // Mathematical relationships that should always hold
      expect(result.capitalGains).toBe(200000);
      expect(result.netGains).toBe(result.capitalGains - result.taxAmount);
      
      // Tax should be non-negative
      expect(result.taxAmount).toBeGreaterThanOrEqual(0);
      
      // For losses, tax should be zero
      if (result.capitalGains <= 0) {
        expect(result.taxAmount).toBe(0);
        expect(result.netGains).toBe(result.capitalGains);
      }
      
      // Gain type should be consistent with holding period and asset type
      const expectedGainType = (inputs.assetType === 'equity' && result.holdingPeriod >= 1) ||
                              (inputs.assetType === 'debt' && result.holdingPeriod >= 3) ?
                              'long-term' : 'short-term';
      expect(result.gainType).toBe(expectedGainType);
      
      // Tax rate should be appropriate for gain type and asset type
      if (result.gainType === 'short-term') {
        if (inputs.assetType === 'equity') {
          expect(result.taxRate).toBe(15);
        } else {
          expect(result.taxRate).toBe(30);
        }
      } else {
        if (inputs.assetType === 'equity') {
          expect(result.taxRate).toBe(10);
        } else {
          expect(result.taxRate).toBe(20);
        }
      }
    });
  });
});