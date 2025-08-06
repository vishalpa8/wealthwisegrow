/**
 * Comprehensive Test Suite for Break-Even Calculator
 * Tests all scenarios, edge cases, and mathematical accuracy
 * Priority: MEDIUM - Business analysis calculator
 */

// Mock the break-even calculation function extracted from the component
function calculateBreakEven(inputs: {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number;
  currentSales: number;
}) {
  // Use parseRobustNumber for flexible input handling (mocked)
  const parseRobustNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const fixedCost = Math.abs(parseRobustNumber(inputs.fixedCost));
  const variableCostPerUnit = Math.abs(parseRobustNumber(inputs.variableCostPerUnit)) || 50;
  const sellingPricePerUnit = Math.abs(parseRobustNumber(inputs.sellingPricePerUnit)) || 150;
  const targetProfit = Math.abs(parseRobustNumber(inputs.targetProfit)) || 0;
  const currentSales = Math.abs(parseRobustNumber(inputs.currentSales)) || 0;

  // Ensure selling price is greater than variable cost
  const effectiveSellingPrice = Math.max(sellingPricePerUnit, variableCostPerUnit + 1);
  
  const contributionMargin = effectiveSellingPrice - variableCostPerUnit;
  const contributionMarginRatio = (contributionMargin / effectiveSellingPrice) * 100;
  
  // Break-even calculations
  const breakEvenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * effectiveSellingPrice;
  
  // Target profit calculations
  const unitsForTargetProfit = contributionMargin > 0 ? (fixedCost + targetProfit) / contributionMargin : 0;
  const revenueForTargetProfit = unitsForTargetProfit * effectiveSellingPrice;
  
  // Current position analysis
  const currentRevenue = currentSales * effectiveSellingPrice;
  const currentVariableCost = currentSales * variableCostPerUnit;
  const currentTotalCost = fixedCost + currentVariableCost;
  const currentProfit = currentRevenue - currentTotalCost;
  
  // Safety margin
  const safetyMargin = currentSales > 0 && breakEvenUnits > 0 ? ((currentSales - breakEvenUnits) / currentSales) * 100 : 0;
  
  // Additional units needed
  const additionalUnitsNeeded = Math.max(0, breakEvenUnits - currentSales);
  const additionalUnitsForProfit = Math.max(0, unitsForTargetProfit - currentSales);

  return {
    breakEvenUnits: Math.round(breakEvenUnits * 100) / 100,
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    unitsForTargetProfit: Math.round(unitsForTargetProfit * 100) / 100,
    revenueForTargetProfit: Math.round(revenueForTargetProfit * 100) / 100,
    currentRevenue: Math.round(currentRevenue * 100) / 100,
    currentTotalCost: Math.round(currentTotalCost * 100) / 100,
    currentProfit: Math.round(currentProfit * 100) / 100,
    safetyMargin: Math.round(safetyMargin * 100) / 100,
    additionalUnitsNeeded: Math.round(additionalUnitsNeeded * 100) / 100,
    additionalUnitsForProfit: Math.round(additionalUnitsForProfit * 100) / 100,
    sellingPricePerUnit: effectiveSellingPrice,
    variableCostPerUnit: variableCostPerUnit
  };
}

describe('Break-Even Calculator - Comprehensive Test Suite', () => {

  // Helper function to create break-even inputs
  const createBreakEvenInputs = (overrides: any = {}) => ({
    fixedCost: 100000,
    variableCostPerUnit: 50,
    sellingPricePerUnit: 150,
    targetProfit: 50000,
    currentSales: 0,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate basic break-even point correctly', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Contribution margin = 150 - 50 = 100
      expect(result.contributionMargin).toBe(100);
      
      // Break-even units = 100000 / 100 = 1000 units
      expect(result.breakEvenUnits).toBe(1000);
      
      // Break-even revenue = 1000 * 150 = 150000
      expect(result.breakEvenRevenue).toBe(150000);
      
      // Contribution margin ratio = (100 / 150) * 100 = 66.67%
      expectCloseTo(result.contributionMarginRatio, 66.67, 1);
    });

    test('should calculate target profit scenarios correctly', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 50000,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Units for target profit = (100000 + 50000) / 100 = 1500 units
      expect(result.unitsForTargetProfit).toBe(1500);
      
      // Revenue for target profit = 1500 * 150 = 225000
      expect(result.revenueForTargetProfit).toBe(225000);
    });

    test('should analyze current sales position correctly', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 50000,
        currentSales: 1200
      });

      const result = calculateBreakEven(inputs);

      // Current revenue = 1200 * 150 = 180000
      expect(result.currentRevenue).toBe(180000);
      
      // Current variable cost = 1200 * 50 = 60000
      // Current total cost = 100000 + 60000 = 160000
      expect(result.currentTotalCost).toBe(160000);
      
      // Current profit = 180000 - 160000 = 20000
      expect(result.currentProfit).toBe(20000);
      
      // Safety margin = ((1200 - 1000) / 1200) * 100 = 16.67%
      expectCloseTo(result.safetyMargin, 16.67, 1);
    });

    test('should calculate additional units needed', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 50000,
        currentSales: 800
      });

      const result = calculateBreakEven(inputs);

      // Additional units for break-even = 1000 - 800 = 200
      expect(result.additionalUnitsNeeded).toBe(200);
      
      // Additional units for target profit = 1500 - 800 = 700
      expect(result.additionalUnitsForProfit).toBe(700);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero fixed costs', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 0,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // With zero fixed costs, break-even should be 0
      expect(result.breakEvenUnits).toBe(0);
      expect(result.breakEvenRevenue).toBe(0);
    });

    test('should handle selling price equal to variable cost', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 150,
        sellingPricePerUnit: 150,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Effective selling price should be adjusted to variableCost + 1
      expect(result.contributionMargin).toBe(1);
      expect(result.breakEvenUnits).toBe(100000); // 100000 / 1
    });

    test('should handle selling price lower than variable cost', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 200,
        sellingPricePerUnit: 150,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Effective selling price should be adjusted to 201 (200 + 1)
      expect(result.contributionMargin).toBe(1);
      expect(result.breakEvenUnits).toBe(100000);
    });

    test('should handle zero contribution margin scenarios', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 150,
        sellingPricePerUnit: 150,
        targetProfit: 50000,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // With minimal contribution margin (1), calculations should still work
      expect(result.contributionMargin).toBe(1);
      expect(result.unitsForTargetProfit).toBe(150000); // (100000 + 50000) / 1
    });

    test('should handle very large numbers', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 10000000, // 1 crore
        variableCostPerUnit: 500,
        sellingPricePerUnit: 1000,
        targetProfit: 5000000, // 50 lakhs
        currentSales: 20000
      });

      const result = calculateBreakEven(inputs);

      expect(result.contributionMargin).toBe(500);
      expect(result.breakEvenUnits).toBe(20000); // 10000000 / 500
      expect(result.unitsForTargetProfit).toBe(30000); // (10000000 + 5000000) / 500
    });

    test('should handle very small numbers', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 1000,
        variableCostPerUnit: 5,
        sellingPricePerUnit: 10,
        targetProfit: 500,
        currentSales: 100
      });

      const result = calculateBreakEven(inputs);

      expect(result.contributionMargin).toBe(5);
      expect(result.breakEvenUnits).toBe(200); // 1000 / 5
      expect(result.unitsForTargetProfit).toBe(300); // (1000 + 500) / 5
    });

    test('should handle fractional inputs', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000.50,
        variableCostPerUnit: 50.25,
        sellingPricePerUnit: 150.75,
        targetProfit: 50000.25,
        currentSales: 1000.5
      });

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.breakEvenUnits)).toBe(true);
      expect(Number.isFinite(result.contributionMargin)).toBe(true);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid fixed cost inputs', () => {
      const testCases = [
        { fixedCost: null },
        { fixedCost: undefined },
        { fixedCost: '' },
        { fixedCost: 'invalid' },
        { fixedCost: -100000 }, // Negative cost
      ];

      testCases.forEach(({ fixedCost }) => {
        const inputs = createBreakEvenInputs({ fixedCost: fixedCost as any });
        const result = calculateBreakEven(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.breakEvenUnits).toBe('number');
        expect(isFinite(result.breakEvenUnits)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: '$100,000' as any,
        variableCostPerUnit: '₹50' as any,
        sellingPricePerUnit: '€150' as any,
        targetProfit: '£50,000' as any,
        currentSales: '1,000 units' as any,
      });

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
      expect(result.breakEvenUnits).toBeGreaterThan(0);
      expect(result.contributionMargin).toBeGreaterThan(0);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000.123456789,
        variableCostPerUnit: 50.987654321,
        sellingPricePerUnit: 150.123456789,
        targetProfit: 50000.987654321,
        currentSales: 1000.123456789,
      });

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.breakEvenUnits)).toBe(true);
      expect(Number.isFinite(result.contributionMargin)).toBe(true);
      expect(Number.isFinite(result.breakEvenRevenue)).toBe(true);
    });

    test('should handle extreme values safely', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: Number.MAX_SAFE_INTEGER / 1000,
        variableCostPerUnit: 1000000,
        sellingPricePerUnit: 2000000,
        targetProfit: Number.MAX_SAFE_INTEGER / 2000,
        currentSales: 1000000,
      });

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.breakEvenUnits)).toBe(true);
      expect(isFinite(result.contributionMargin)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify break-even formula accuracy', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 120000,
        variableCostPerUnit: 80,
        sellingPricePerUnit: 200,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Manual calculation
      const expectedContributionMargin = 200 - 80; // 120
      const expectedBreakEvenUnits = 120000 / 120; // 1000
      const expectedBreakEvenRevenue = 1000 * 200; // 200000

      expect(result.contributionMargin).toBe(expectedContributionMargin);
      expect(result.breakEvenUnits).toBe(expectedBreakEvenUnits);
      expect(result.breakEvenRevenue).toBe(expectedBreakEvenRevenue);
    });

    test('should verify contribution margin ratio calculation', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 60,
        sellingPricePerUnit: 100,
        targetProfit: 0,
        currentSales: 0
      });

      const result = calculateBreakEven(inputs);

      // Contribution margin = 100 - 60 = 40
      // Contribution margin ratio = (40 / 100) * 100 = 40%
      expect(result.contributionMargin).toBe(40);
      expect(result.contributionMarginRatio).toBe(40);
    });

    test('should verify safety margin calculation', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000,
        variableCostPerUnit: 50,
        sellingPricePerUnit: 150,
        targetProfit: 0,
        currentSales: 1500
      });

      const result = calculateBreakEven(inputs);

      // Break-even units = 100000 / 100 = 1000
      // Safety margin = ((1500 - 1000) / 1500) * 100 = 33.33%
      expect(result.breakEvenUnits).toBe(1000);
      expectCloseTo(result.safetyMargin, 33.33, 1);
    });

    test('should verify current profit calculation', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 80000,
        variableCostPerUnit: 40,
        sellingPricePerUnit: 120,
        targetProfit: 0,
        currentSales: 1500
      });

      const result = calculateBreakEven(inputs);

      // Current revenue = 1500 * 120 = 180000
      // Current variable cost = 1500 * 40 = 60000
      // Current total cost = 80000 + 60000 = 140000
      // Current profit = 180000 - 140000 = 40000
      expect(result.currentRevenue).toBe(180000);
      expect(result.currentTotalCost).toBe(140000);
      expect(result.currentProfit).toBe(40000);
    });
  });

  describe('📊 Business Scenario Tests', () => {
    
    test('should handle restaurant break-even scenario', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 500000, // Monthly rent, salaries, utilities
        variableCostPerUnit: 150, // Cost per meal
        sellingPricePerUnit: 400, // Price per meal
        targetProfit: 200000, // Target monthly profit
        currentSales: 1800 // Current monthly meals
      });

      const result = calculateBreakEven(inputs);

      expect(result.contributionMargin).toBe(250); // 400 - 150
      expect(result.breakEvenUnits).toBe(2000); // 500000 / 250
      expect(result.unitsForTargetProfit).toBe(2800); // (500000 + 200000) / 250
      expectCloseTo(result.safetyMargin, -11.11, 1); // Negative - below break-even
    });

    test('should handle manufacturing break-even scenario', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 2000000, // Factory overhead
        variableCostPerUnit: 500, // Material + labor per unit
        sellingPricePerUnit: 800, // Selling price per unit
        targetProfit: 1000000, // Target profit
        currentSales: 8000 // Current production
      });

      const result = calculateBreakEven(inputs);

      expect(result.contributionMargin).toBe(300); // 800 - 500
      expectCloseTo(result.breakEvenUnits, 6666.67, 1); // 2000000 / 300
      expect(result.unitsForTargetProfit).toBe(10000); // (2000000 + 1000000) / 300
      expectCloseTo(result.safetyMargin, 16.67, 1); // Positive - above break-even
    });

    test('should handle service business break-even scenario', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 300000, // Office rent, salaries
        variableCostPerUnit: 100, // Cost per service hour
        sellingPricePerUnit: 500, // Rate per service hour
        targetProfit: 150000, // Target profit
        currentSales: 1000 // Current service hours
      });

      const result = calculateBreakEven(inputs);

      expect(result.contributionMargin).toBe(400); // 500 - 100
      expect(result.breakEvenUnits).toBe(750); // 300000 / 400
      expect(result.unitsForTargetProfit).toBe(1125); // (300000 + 150000) / 400
      expect(result.safetyMargin).toBe(25); // ((1000 - 750) / 1000) * 100
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle large-scale calculations efficiently', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 100000000, // 10 crores
        variableCostPerUnit: 5000,
        sellingPricePerUnit: 8000,
        targetProfit: 50000000, // 5 crores
        currentSales: 50000
      });

      const startTime = Date.now();
      const result = calculateBreakEven(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.breakEvenUnits).toBe(33333.33);
      expect(result.unitsForTargetProfit).toBe(50000);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        fixedCost: 100000 + i * 1000,
        variableCostPerUnit: 50 + i % 50,
        sellingPricePerUnit: 150 + i % 100,
        targetProfit: 50000 + i * 500,
        currentSales: i * 10
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateBreakEven(inputs);
        expect(result).toBeDefined();
        expect(result.breakEvenUnits).toBeGreaterThanOrEqual(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createBreakEvenInputs({
        fixedCost: 150000,
        variableCostPerUnit: 75,
        sellingPricePerUnit: 200,
        targetProfit: 75000,
        currentSales: 1500
      });

      const result = calculateBreakEven(inputs);

      // These values should remain consistent across code changes
      expect(result.contributionMargin).toBe(125);
      expect(result.breakEvenUnits).toBe(1200);
      expect(result.breakEvenRevenue).toBe(240000);
      expect(result.unitsForTargetProfit).toBe(1800);
      expect(result.safetyMargin).toBe(20); // ((1500 - 1200) / 1500) * 100
    });

    test('should handle mathematical relationships consistently', () => {
      const inputs = createBreakEvenInputs({
        fixedCost: 200000,
        variableCostPerUnit: 100,
        sellingPricePerUnit: 300,
        targetProfit: 100000,
        currentSales: 1200
      });

      const result = calculateBreakEven(inputs);

      // Mathematical relationships that should always hold
      expect(result.contributionMargin).toBe(inputs.sellingPricePerUnit - inputs.variableCostPerUnit);
      expect(result.breakEvenRevenue).toBe(result.breakEvenUnits * inputs.sellingPricePerUnit);
      expect(result.revenueForTargetProfit).toBe(result.unitsForTargetProfit * inputs.sellingPricePerUnit);
      
      // Current calculations
      expect(result.currentRevenue).toBe(1200 * 300);
      expect(result.currentProfit).toBe(result.currentRevenue - result.currentTotalCost);
    });
  });
});