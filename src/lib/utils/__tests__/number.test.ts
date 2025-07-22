/**
 * Tests for robust number utilities
 */

import {
  parseRobustNumber,
  validateSafeNumber,
  formatLargeNumber,
  formatIndianNumber,
  safeDivide,
  safeMultiply,
  safeAdd,
  safePower,
  isEffectivelyZero,
  parseAndValidate,
  MAX_SAFE_CALCULATION_VALUE
} from '../number';

describe('parseRobustNumber', () => {
  test('handles null and undefined', () => {
    expect(parseRobustNumber(null)).toBe(0);
    expect(parseRobustNumber(undefined)).toBe(0);
  });

  test('handles empty strings', () => {
    expect(parseRobustNumber('')).toBe(0);
    expect(parseRobustNumber('   ')).toBe(0);
  });

  test('handles NaN and Infinity', () => {
    expect(parseRobustNumber(NaN)).toBe(0);
    expect(parseRobustNumber(Infinity)).toBe(0);
    expect(parseRobustNumber(-Infinity)).toBe(0);
  });

  test('handles boolean values', () => {
    expect(parseRobustNumber(true)).toBe(1);
    expect(parseRobustNumber(false)).toBe(0);
  });

  test('handles valid numbers', () => {
    expect(parseRobustNumber(42)).toBe(42);
    expect(parseRobustNumber(0)).toBe(0);
    expect(parseRobustNumber(-10)).toBe(-10);
    expect(parseRobustNumber(3.14159)).toBe(3.14159);
  });

  test('handles string numbers with currency symbols', () => {
    expect(parseRobustNumber('₹1,000')).toBe(1000);
    expect(parseRobustNumber('$1,234.56')).toBe(1234.56);
    expect(parseRobustNumber('€500')).toBe(500);
    expect(parseRobustNumber('£999.99')).toBe(999.99);
  });

  test('handles large numbers', () => {
    expect(parseRobustNumber('1000000')).toBe(1000000);
    expect(parseRobustNumber('1,000,000')).toBe(1000000);
    expect(parseRobustNumber('₹10,00,000')).toBe(1000000);
  });

  test('handles arrays', () => {
    expect(parseRobustNumber([42])).toBe(42);
    expect(parseRobustNumber([])).toBe(0);
    expect(parseRobustNumber([1, 2, 3])).toBe(1);
  });

  test('handles objects', () => {
    expect(parseRobustNumber({ value: 42 })).toBe(42);
    expect(parseRobustNumber({ amount: 100 })).toBe(100);
    expect(parseRobustNumber({})).toBe(0);
  });
});

describe('validateSafeNumber', () => {
  test('validates normal numbers', () => {
    const result = validateSafeNumber(1000);
    expect(result.isValid).toBe(true);
    expect(result.number).toBe(1000);
    expect(result.error).toBeUndefined();
  });

  test('handles very large numbers', () => {
    const result = validateSafeNumber(MAX_SAFE_CALCULATION_VALUE + 1);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('too large');
  });

  test('handles zero', () => {
    const result = validateSafeNumber(0);
    expect(result.isValid).toBe(true);
    expect(result.number).toBe(0);
  });
});

describe('formatLargeNumber', () => {
  test('formats thousands', () => {
    expect(formatLargeNumber(1500)).toBe('1.50K');
    expect(formatLargeNumber(999)).toBe('999.00');
  });

  test('formats millions', () => {
    expect(formatLargeNumber(1500000)).toBe('1.50M');
    expect(formatLargeNumber(2500000)).toBe('2.50M');
  });

  test('formats billions', () => {
    expect(formatLargeNumber(1500000000)).toBe('1.50B');
  });

  test('formats trillions', () => {
    expect(formatLargeNumber(1500000000000)).toBe('1.50T');
  });

  test('handles negative numbers', () => {
    expect(formatLargeNumber(-1500000)).toBe('-1.50M');
  });

  test('handles zero', () => {
    expect(formatLargeNumber(0)).toBe('0.00');
  });
});

describe('formatIndianNumber', () => {
  test('formats thousands', () => {
    expect(formatIndianNumber(1500)).toBe('1.50 K');
  });

  test('formats lakhs', () => {
    expect(formatIndianNumber(150000)).toBe('1.50 L');
    expect(formatIndianNumber(1000000)).toBe('10.00 L');
  });

  test('formats crores', () => {
    expect(formatIndianNumber(15000000)).toBe('1.50 Cr');
    expect(formatIndianNumber(100000000)).toBe('10.00 Cr');
  });
});

describe('safeDivide', () => {
  test('handles normal division', () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(7, 3)).toBeCloseTo(2.333, 3);
  });

  test('handles division by zero', () => {
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(10, null)).toBe(0);
    expect(safeDivide(10, undefined)).toBe(0);
  });

  test('handles custom fallback', () => {
    expect(safeDivide(10, 0, 999)).toBe(999);
  });

  test('handles string inputs', () => {
    expect(safeDivide('10', '2')).toBe(5);
    expect(safeDivide('₹1,000', '₹100')).toBe(10);
  });
});

describe('safeMultiply', () => {
  test('handles normal multiplication', () => {
    expect(safeMultiply(5, 3)).toBe(15);
    expect(safeMultiply(2.5, 4)).toBe(10);
  });

  test('handles zero multiplication', () => {
    expect(safeMultiply(5, 0)).toBe(0);
    expect(safeMultiply(0, 100)).toBe(0);
  });

  test('handles string inputs', () => {
    expect(safeMultiply('5', '3')).toBe(15);
    expect(safeMultiply('₹100', '2')).toBe(200);
  });

  test('handles overflow protection', () => {
    const result = safeMultiply(MAX_SAFE_CALCULATION_VALUE, 2);
    expect(result).toBe(MAX_SAFE_CALCULATION_VALUE);
  });
});

describe('safeAdd', () => {
  test('handles normal addition', () => {
    expect(safeAdd(1, 2, 3)).toBe(6);
    expect(safeAdd(10.5, 20.3)).toBeCloseTo(30.8, 1);
  });

  test('handles zero addition', () => {
    expect(safeAdd(0, 0, 0)).toBe(0);
    expect(safeAdd(5, 0)).toBe(5);
  });

  test('handles string inputs', () => {
    expect(safeAdd('10', '20', '30')).toBe(60);
    expect(safeAdd('₹100', '₹200')).toBe(300);
  });

  test('handles null/undefined inputs', () => {
    expect(safeAdd(10, null, undefined, 20)).toBe(30);
  });
});

describe('safePower', () => {
  test('handles normal exponentiation', () => {
    expect(safePower(2, 3)).toBe(8);
    expect(safePower(5, 2)).toBe(25);
  });

  test('handles zero base', () => {
    expect(safePower(0, 5)).toBe(0);
    expect(safePower(0, 0)).toBe(1);
  });

  test('handles zero exponent', () => {
    expect(safePower(5, 0)).toBe(1);
    expect(safePower(100, 0)).toBe(1);
  });

  test('handles string inputs', () => {
    expect(safePower('2', '3')).toBe(8);
    expect(safePower('₹10', '2')).toBe(100);
  });
});

describe('isEffectivelyZero', () => {
  test('identifies zero', () => {
    expect(isEffectivelyZero(0)).toBe(true);
    expect(isEffectivelyZero(0.0)).toBe(true);
  });

  test('identifies very small numbers as zero', () => {
    expect(isEffectivelyZero(0.0000000001)).toBe(true);
    expect(isEffectivelyZero(-0.0000000001)).toBe(true);
  });

  test('identifies normal numbers as non-zero', () => {
    expect(isEffectivelyZero(0.01)).toBe(false);
    expect(isEffectivelyZero(1)).toBe(false);
    expect(isEffectivelyZero(-1)).toBe(false);
  });
});

describe('parseAndValidate', () => {
  test('validates positive numbers', () => {
    const result = parseAndValidate(100, { min: 1, allowZero: false });
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(100);
  });

  test('rejects zero when not allowed', () => {
    const result = parseAndValidate(0, { allowZero: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Zero is not allowed');
  });

  test('allows zero when permitted', () => {
    const result = parseAndValidate(0, { allowZero: true });
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('rejects negative numbers when not allowed', () => {
    const result = parseAndValidate(-10, { allowNegative: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Negative numbers are not allowed');
  });

  test('validates range constraints', () => {
    const result = parseAndValidate(150, { min: 100, max: 200 });
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(150);

    const tooSmall = parseAndValidate(50, { min: 100, max: 200 });
    expect(tooSmall.isValid).toBe(false);

    const tooLarge = parseAndValidate(250, { min: 100, max: 200 });
    expect(tooLarge.isValid).toBe(false);
  });

  test('handles string inputs with validation', () => {
    const result = parseAndValidate('₹1,000', { min: 500, max: 2000 });
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(1000);
  });
});

describe('Edge cases for trillion-scale numbers', () => {
  test('handles trillion-scale inputs', () => {
    expect(parseRobustNumber('1000000000000')).toBe(1000000000000); // 1 trillion
    expect(parseRobustNumber('₹5,00,00,00,00,000')).toBe(500000000000); // 5 lakh crores
  });

  test('formats trillion-scale numbers', () => {
    expect(formatLargeNumber(1000000000000)).toBe('1.00T');
    expect(formatLargeNumber(2500000000000)).toBe('2.50T');
  });

  test('validates trillion-scale numbers within limits', () => {
    const result = validateSafeNumber(1000000000000);
    expect(result.isValid).toBe(true);
    expect(result.number).toBe(1000000000000);
  });
});