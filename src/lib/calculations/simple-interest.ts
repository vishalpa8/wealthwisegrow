/**
 * Simple Interest Calculator Logic
 */

// Helper functions copied from the test file to ensure self-contained logic.
// In a real application, these would likely live in a shared utils module.
const parseRobustNumber = (value: any): number => {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0;
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
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

const safeAdd = (a: number, b: number): number => {
  const result = a + b;
  return isFinite(result) ? result : 0;
};

const roundToPrecision = (value: number, precision: number = 2): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

export interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

export interface SimpleInterestResult {
  principal: number;
  simpleInterest: number;
  totalAmount: number;
  effectiveRate: number;
  monthlyInterest: number;
  error?: string;
}


function createErrorResult(error: string): SimpleInterestResult {
  return {
    principal: 0,
    simpleInterest: 0,
    totalAmount: 0,
    effectiveRate: 0,
    monthlyInterest: 0,
    error,
  };
}

export function calculateSimpleInterest(inputs: SimpleInterestInputs): SimpleInterestResult {
  if (!inputs) {
    return createErrorResult("Inputs are required.");
  }

  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const time = parseRobustNumber(inputs.time);

  if (principal < 0) {
    return createErrorResult("Principal amount cannot be negative.");
  }
  if (rate < 0) {
    return createErrorResult("Interest rate cannot be negative.");
  }
  if (time < 0) {
    return createErrorResult("Time period cannot be negative.");
  }

  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const totalAmount = safeAdd(principal, simpleInterest);

  return {
    principal: roundToPrecision(principal),
    simpleInterest: roundToPrecision(simpleInterest),
    totalAmount: roundToPrecision(totalAmount),
    effectiveRate: roundToPrecision(safeDivide(safeMultiply(simpleInterest, 100), principal)),
    monthlyInterest: roundToPrecision(safeDivide(simpleInterest, safeMultiply(time, 12)))
  };
}
