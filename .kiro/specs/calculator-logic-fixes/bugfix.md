# Bugfix Requirements Document: Calculator Logic Fixes

## Introduction

This document outlines the requirements for fixing verified logical and functional issues in financial calculators. After systematic code review, three confirmed bugs have been identified in the simple interest calculator, loan calculator display, SIP/PPF effective return calculation, and investment compounding logic.

The fixes will ensure mathematical correctness and consistent behavior across calculators.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Simple Interest Monthly Interest Calculation

1.1 WHEN calculating simple interest monthly interest in `src/lib/calculations/simple-interest.ts` THEN the system divides by (time × 12) resulting in `monthlyInterest = simpleInterest / (time × 12)`, which gives average interest per month over the entire period instead of monthly interest per year

1.2 WHEN calculating simple interest monthly interest in `src/app/calculators/simple-interest/page.tsx` THEN the system duplicates the same incorrect formula `monthlyInterest = simpleInterest / (time × 12)`

#### 2. Loan Calculator Display Values

2.1 WHEN displaying monthly principal and interest in `src/app/calculators/loan/page.tsx` THEN the system calculates `monthlyPrincipal = principal / months` and `monthlyInterest = monthly - monthlyPrincipal`, which shows average values instead of the actual first month's amortization split where principal and interest portions change each month

#### 3. SIP/PPF Effective Annual Return Calculation

3.1 WHEN calculating effective annual return in `src/app/calculators/sip/page.tsx` THEN the system uses `((maturityAmount / totalInvestment) ** (1 / years) - 1) * 100`, which is only correct for lump sum investments, not for periodic investments where money is invested over time

3.2 WHEN calculating effective annual return in `src/app/calculators/ppf/page.tsx` THEN the system uses the same incorrect formula `((maturityAmount / totalInvestment) ** (1 / years) - 1) * 100` for periodic investments

#### 4. Investment Compounding Frequency Inconsistency

4.1 WHEN calculating investment returns in `src/lib/calculations/investment.ts` THEN the system applies the user-selected compounding frequency to the initial amount but always uses monthly compounding for monthly contributions, creating inconsistent compounding logic within the same calculation

### Expected Behavior (Correct)

#### 2. Simple Interest Monthly Interest Correction

2.1 WHEN calculating simple interest monthly interest THEN the system SHALL divide the total simple interest by 12 to get monthly interest per year: `monthlyInterest = simpleInterest / 12`

2.2 WHEN displaying monthly interest in the simple interest calculator page THEN the system SHALL use the corrected formula consistently

#### 3. Loan Calculator Display Values Correction

3.1 WHEN displaying monthly principal and interest in loan calculator THEN the system SHALL either calculate the actual first month's principal/interest split using the amortization formula OR clearly label the values as "Average Monthly Principal" and "Average Monthly Interest" to avoid misleading users

#### 4. SIP/PPF Effective Annual Return Correction

4.1 WHEN calculating effective annual return for SIP investments THEN the system SHALL either use XIRR methodology for accurate periodic investment returns OR change the label to "Absolute Return" or "Simple Annual Growth Rate" to accurately describe what the formula calculates

4.2 WHEN calculating effective annual return for PPF investments THEN the system SHALL apply the same correction as SIP (use XIRR or relabel the metric)

#### 5. Investment Compounding Frequency Correction

5.1 WHEN calculating investment returns with a specified compounding frequency THEN the system SHALL apply the same compounding frequency consistently to both the initial amount and monthly contributions, OR clearly document that monthly contributions always use monthly compounding regardless of the selected frequency

### Unchanged Behavior (Regression Prevention)

#### 6. Preserve Correct Functionality

6.1 WHEN calculating mortgage with all parameters in `src/lib/calculations/mortgage.ts` THEN the system SHALL CONTINUE TO correctly calculate monthly payment, total payment, and payment schedule using the standard mortgage formula with safe math operations

6.2 WHEN calculating income tax with valid inputs in `src/lib/calculations/tax.ts` THEN the system SHALL CONTINUE TO correctly apply tax slabs for both old and new regimes, standard deduction, and cess calculations

6.3 WHEN calculating GST with exclusive/inclusive type in `src/lib/calculations/tax.ts` THEN the system SHALL CONTINUE TO correctly calculate CGST, SGST, IGST, and total amounts

6.4 WHEN calculating HRA exemption in `src/lib/calculations/tax.ts` THEN the system SHALL CONTINUE TO correctly apply the minimum of (actual HRA, 50%/40% of basic, rent - 10% of basic)

6.5 WHEN calculating capital gains in `src/lib/calculations/tax.ts` THEN the system SHALL CONTINUE TO correctly determine holding period, gain type (STCG/LTCG), and applicable tax rates for different asset types

6.6 WHEN using safe math operations (safeDivide, safeMultiply, safeAdd, safePower) in `src/lib/utils/number.ts` THEN the system SHALL CONTINUE TO prevent division by zero and handle edge cases gracefully

6.7 WHEN using parseRobustNumber for currency string inputs in `src/lib/utils/number.ts` THEN the system SHALL CONTINUE TO correctly parse formatted numbers with commas and currency symbols

6.8 WHEN generating amortization schedules in `src/lib/calculations/loan.ts` and `src/lib/calculations/advanced-emi.ts` THEN the system SHALL CONTINUE TO correctly track balance, cumulative interest, and ensure balance reaches zero at the end

6.9 WHEN calculating FD with different compounding frequencies in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly apply the compound interest formula with the specified frequency

6.10 WHEN calculating RD (Recurring Deposit) in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly calculate maturity amount with monthly interest application

6.11 WHEN calculating dividend yield in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly calculate yield percentage, annual income, and total returns

6.12 WHEN calculating gold investment in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly handle investment amount, gold price, appreciation rate, and generate yearly breakdown

6.13 WHEN calculating salary (CTC to in-hand) in `src/lib/calculations/tax.ts` THEN the system SHALL CONTINUE TO correctly calculate basic, HRA, PF deduction, and net salary

6.14 WHEN handling extra payments in `src/lib/calculations/loan.ts` THEN the system SHALL CONTINUE TO correctly reduce principal and recalculate remaining schedule

6.15 WHEN calculating advanced EMI with prepayments in `src/lib/calculations/advanced-emi.ts` THEN the system SHALL CONTINUE TO correctly apply monthly or yearly prepayments and adjust the amortization schedule

6.16 WHEN calculating SIP in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly simulate month-by-month investment growth with proper interest application

6.17 WHEN calculating lumpsum investment in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly apply compound interest formula and generate yearly breakdown

6.18 WHEN calculating PPF in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly apply 7.1% interest rate and generate yearly breakdown

6.19 WHEN calculating EPF in `src/lib/calculations/savings.ts` THEN the system SHALL CONTINUE TO correctly calculate employee and employer contributions with 8.5% interest rate

6.20 WHEN handling zero interest rate in mortgage calculator THEN the system SHALL CONTINUE TO correctly calculate simple division (loanAmount / numberOfPayments)
