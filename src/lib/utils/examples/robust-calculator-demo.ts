/**
 * Demonstration of robust calculator handling
 * Shows how the system handles various edge cases
 */

import { calculateMortgage } from '../../calculations/mortgage';
import { calculateLoan } from '../../calculations/loan';
import { parseRobustNumber, formatCurrencyIndian, formatLargeNumber } from '../number';

// Example 1: Handling zero and null inputs
export function demoZeroAndNullHandling() {
  console.log('=== Demo: Zero and Null Input Handling ===');
  
  // Test mortgage calculation with zero down payment
  const mortgageWithZeroDown = calculateMortgage({
    principal: 1000000, // ₹10 lakh
    rate: 8.5,
    years: 20,
    downPayment: 0, // Zero down payment
    propertyTax: null as any, // Null input
    insurance: undefined as any, // Undefined input
    pmi: '' as any // Empty string
  });
  
  console.log('Mortgage with zero/null inputs:');
  console.log(`Monthly Payment: ${formatCurrencyIndian(mortgageWithZeroDown.monthlyPayment)}`);
  console.log(`Total Payment: ${formatCurrencyIndian(mortgageWithZeroDown.totalPayment)}`);
  console.log(`Property Tax: ${formatCurrencyIndian(mortgageWithZeroDown.monthlyPropertyTax)}`);
  console.log('');
  
  return mortgageWithZeroDown;
}

// Example 2: Handling very large numbers (trillions)
export function demoLargeNumberHandling() {
  console.log('=== Demo: Large Number Handling (Trillions) ===');
  
  // Test with trillion-scale loan
  const largeLoan = calculateLoan({
    principal: 1000000000000, // ₹1 trillion
    rate: 5,
    years: 30,
    extraPayment: 0
  });
  
  console.log('Trillion-scale loan calculation:');
  console.log(`Principal: ${formatLargeNumber(1000000000000)}`);
  console.log(`Monthly Payment: ${formatLargeNumber(largeLoan.monthlyPayment)}`);
  console.log(`Total Payment: ${formatLargeNumber(largeLoan.totalPayment)}`);
  console.log(`Total Interest: ${formatLargeNumber(largeLoan.totalInterest)}`);
  console.log('');
  
  return largeLoan;
}

// Example 3: Handling string inputs with currency symbols
export function demoStringInputHandling() {
  console.log('=== Demo: String Input with Currency Symbols ===');
  
  // Test with various string formats
  const stringInputs = [
    '₹10,00,000', // Indian format
    '$100,000', // US format
    '€50,000', // Euro format
    '1,50,000', // Just commas
    '2.5 lakh', // This will be parsed as 2.5
    'Rs. 75,000' // Rs prefix
  ];
  
  stringInputs.forEach(input => {
    const parsed = parseRobustNumber(input);
    console.log(`"${input}" → ${formatCurrencyIndian(parsed)}`);
  });
  
  // Test mortgage with string inputs
  const mortgageWithStrings = calculateMortgage({
    principal: '₹25,00,000' as any, // ₹25 lakh as string
    rate: '8.75' as any, // Rate as string
    years: '25' as any, // Years as string
    downPayment: '₹5,00,000' as any, // ₹5 lakh down payment as string
    propertyTax: '₹50,000' as any,
    insurance: '₹25,000' as any,
    pmi: '0' as any
  });
  
  console.log('\\nMortgage calculation with string inputs:');
  console.log(`Monthly Payment: ${formatCurrencyIndian(mortgageWithStrings.monthlyPayment)}`);
  console.log(`Loan Amount: ${formatCurrencyIndian(2500000 - 500000)}`);
  console.log('');
  
  return mortgageWithStrings;
}

// Example 4: Handling zero interest rate
export function demoZeroInterestRate() {
  console.log('=== Demo: Zero Interest Rate Handling ===');
  
  // Test with 0% interest rate
  const zeroInterestLoan = calculateLoan({
    principal: 500000, // ₹5 lakh
    rate: 0, // 0% interest
    years: 5,
    extraPayment: 0
  });
  
  console.log('Zero interest loan:');
  console.log(`Principal: ${formatCurrencyIndian(500000)}`);
  console.log(`Interest Rate: 0%`);
  console.log(`Monthly Payment: ${formatCurrencyIndian(zeroInterestLoan.monthlyPayment)}`);
  console.log(`Total Interest: ${formatCurrencyIndian(zeroInterestLoan.totalInterest)}`);
  console.log('');
  
  return zeroInterestLoan;
}

// Example 5: Handling edge case arrays and objects
export function demoComplexInputHandling() {
  console.log('=== Demo: Complex Input Types ===');
  
  // Test with array inputs (takes first element)
  const arrayInput = [1000000, 500000, 250000];
  const parsedArray = parseRobustNumber(arrayInput);
  console.log(`Array [${arrayInput.join(', ')}] → ${formatCurrencyIndian(parsedArray)}`);
  
  // Test with object inputs (looks for common properties)
  const objectInputs = [
    { value: 750000 },
    { amount: 1250000 },
    { number: 300000 },
    { price: 450000, value: 600000 }, // Should pick 'value'
    { random: 999999 } // Should default to 0
  ];
  
  objectInputs.forEach(obj => {
    const parsed = parseRobustNumber(obj);
    console.log(`${JSON.stringify(obj)} → ${formatCurrencyIndian(parsed)}`);
  });
  
  console.log('');
}

// Example 6: Comprehensive mortgage calculation with all edge cases
export function demoComprehensiveMortgage() {
  console.log('=== Demo: Comprehensive Mortgage with Edge Cases ===');
  
  const edgeCaseMortgage = calculateMortgage({
    principal: '₹1,50,00,000' as any, // ₹1.5 crore as string
    rate: 0 as any, // Zero interest rate
    years: null as any, // Null years (should default through validation)
    downPayment: undefined as any, // Undefined down payment
    propertyTax: '' as any, // Empty property tax
    insurance: false as any, // Boolean false
    pmi: [25000] as any // Array input
  });
  
  console.log('Edge case mortgage results:');
  console.log(`Principal: ${formatCurrencyIndian(15000000)}`);
  console.log(`Monthly Payment: ${formatCurrencyIndian(edgeCaseMortgage.monthlyPayment)}`);
  console.log(`Property Tax: ${formatCurrencyIndian(edgeCaseMortgage.monthlyPropertyTax)}`);
  console.log(`Insurance: ${formatCurrencyIndian(edgeCaseMortgage.monthlyInsurance)}`);
  console.log(`PMI: ${formatCurrencyIndian(edgeCaseMortgage.monthlyPMI)}`);
  console.log('');
  
  return edgeCaseMortgage;
}

// Example 7: Performance test with large calculations
export function demoPerformanceWithLargeNumbers() {
  console.log('=== Demo: Performance with Large Numbers ===');
  
  const startTime = performance.now();
  
  // Calculate multiple large mortgages
  const largeMortgages = [];
  for (let i = 1; i <= 100; i++) {
    const mortgage = calculateMortgage({
      principal: i * 10000000, // ₹1 crore to ₹100 crore
      rate: 7.5 + (i * 0.01), // Varying rates
      years: 20 + (i % 10), // Varying terms
      downPayment: i * 1000000, // ₹10 lakh to ₹100 lakh
      propertyTax: i * 50000,
      insurance: i * 25000,
      pmi: i * 10000
    });
    largeMortgages.push(mortgage);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  console.log(`Calculated 100 large mortgages in ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per calculation: ${(totalTime / 100).toFixed(2)}ms`);
  
  // Show some sample results
  const sampleMortgage = largeMortgages[49]; // 50th mortgage
  console.log('\nSample result (₹50 crore mortgage):');
  if (sampleMortgage) {
    console.log(`Monthly Payment: ${formatLargeNumber(sampleMortgage.monthlyPayment)}`);
    console.log(`Total Interest: ${formatLargeNumber(sampleMortgage.totalInterest)}`);
  } else {
    console.log('Sample mortgage not available');
  }
  console.log('');
  
  return { largeMortgages, totalTime };
}

// Run all demos
export function runAllDemos() {
  console.log('🧮 ROBUST CALCULATOR DEMONSTRATION 🧮\\n');
  
  demoZeroAndNullHandling();
  demoLargeNumberHandling();
  demoStringInputHandling();
  demoZeroInterestRate();
  demoComplexInputHandling();
  demoComprehensiveMortgage();
  demoPerformanceWithLargeNumbers();
  
  console.log('✅ All demos completed successfully!');
  console.log('\\n📊 Key Features Demonstrated:');
  console.log('• Zero, null, undefined, and empty string handling');
  console.log('• Trillion-scale number support');
  console.log('• Currency symbol parsing');
  console.log('• Zero interest rate calculations');
  console.log('• Complex input type handling');
  console.log('• Performance with large datasets');
  console.log('• Comprehensive error handling and fallbacks');
}

// Export for use in applications
export const robustCalculatorExamples = {
  demoZeroAndNullHandling,
  demoLargeNumberHandling,
  demoStringInputHandling,
  demoZeroInterestRate,
  demoComplexInputHandling,
  demoComprehensiveMortgage,
  demoPerformanceWithLargeNumbers,
  runAllDemos
};