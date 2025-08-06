// Mock calculation function for debugging
function testLoanCalculation() {
  const principal = 100000;
  const rate = 5;
  const years = 10;
  
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  
  // Standard loan formula
  const onePlusRate = 1 + monthlyRate;
  const powerTerm = Math.pow(onePlusRate, numberOfPayments);
  const numerator = principal * monthlyRate * powerTerm;
  const denominator = powerTerm - 1;
  const monthlyPayment = numerator / denominator;
  
  console.log('Manual calculation:');
  console.log('Monthly Rate:', monthlyRate);
  console.log('Number of Payments:', numberOfPayments);
  console.log('Monthly Payment:', monthlyPayment);
  console.log('Total Payment:', monthlyPayment * numberOfPayments);
  console.log('Total Interest:', (monthlyPayment * numberOfPayments) - principal);
  
  // Test first payment breakdown
  const firstInterest = principal * monthlyRate;
  const firstPrincipal = monthlyPayment - firstInterest;
  console.log('First Payment - Interest:', firstInterest);
  console.log('First Payment - Principal:', firstPrincipal);
}

testLoanCalculation();
