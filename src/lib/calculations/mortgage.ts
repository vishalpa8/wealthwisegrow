import type { MortgageInputs } from "../validations/calculator";

export interface MortgageResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  loanToValue: number;
  paymentSchedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  // Use explicit type assertions for input values
  const principal = Number(inputs.principal);
  const rate = Number(inputs.rate);
  const years = Number(inputs.years);
  const downPayment = Number(inputs.downPayment || 0);
  const propertyTax = Number(inputs.propertyTax || 0);
  const insurance = Number(inputs.insurance || 0);
  const pmi = Number(inputs.pmi || 0);

  const loanAmount = principal - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;

  // Calculate monthly principal and interest payment
  const monthlyPrincipalAndInterest = monthlyRate === 0 
    ? loanAmount / numberOfPayments
    : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  // Calculate other monthly costs
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyPMI = pmi / 12;

  // Total monthly payment
  const monthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI;

  // Calculate totals
  const totalPayment = monthlyPrincipalAndInterest * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Calculate loan-to-value ratio
  const loanToValue = (loanAmount / principal) * 100;

  // Generate payment schedule
  const paymentSchedule = generatePaymentSchedule(loanAmount, monthlyRate, numberOfPayments, monthlyPrincipalAndInterest);

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    loanToValue,
    paymentSchedule,
  };
}

function generatePaymentSchedule(
  loanAmount: number,
  monthlyRate: number,
  numberOfPayments: number,
  monthlyPayment: number
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    cumulativeInterest += interestPayment;

    // Ensure balance doesn't go negative due to rounding
    if (balance < 0) balance = 0;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      cumulativeInterest,
    });

    if (balance === 0) break;
  }

  return schedule;
}