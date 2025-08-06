import { describe, it, expect } from '@jest/globals';
import { calculateSimpleInterest, SimpleInterestInputs } from '../../src/lib/calculations/simple-interest';

describe('Simple Interest Calculator', () => {
  describe('Basic Functionality', () => {
    it('should calculate simple interest correctly', () => {
      const inputs: SimpleInterestInputs = { principal: 100000, rate: 8, time: 3 };
      const result = calculateSimpleInterest(inputs);
      expect(result.error).toBeUndefined();
      expect(result.simpleInterest).toBe(24000);
      expect(result.totalAmount).toBe(124000);
    });

    it('should handle zero principal', () => {
      const inputs: SimpleInterestInputs = { principal: 0, rate: 8, time: 3 };
      const result = calculateSimpleInterest(inputs);
      expect(result.error).toBeUndefined();
      expect(result.simpleInterest).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should return error for negative principal', () => {
      const inputs: SimpleInterestInputs = { principal: -100, rate: 5, time: 1 };
      const result = calculateSimpleInterest(inputs);
      expect(result.error).toBe('Principal amount cannot be negative.');
    });

    it('should return error for negative rate', () => {
      const inputs: SimpleInterestInputs = { principal: 100, rate: -5, time: 1 };
      const result = calculateSimpleInterest(inputs);
      expect(result.error).toBe('Interest rate cannot be negative.');
    });

    it('should return error for negative time', () => {
      const inputs: SimpleInterestInputs = { principal: 100, rate: 5, time: -1 };
      const result = calculateSimpleInterest(inputs);
      expect(result.error).toBe('Time period cannot be negative.');
    });

    it('should return error for null input', () => {
      const result = calculateSimpleInterest(null as any);
      expect(result.error).toBe('Inputs are required.');
    });
  });
});