# Calculator Logic Fixes Bugfix Design

## Overview

This design addresses four verified bugs in financial calculator logic that affect mathematical correctness and user-facing display values. The bugs span simple interest calculations, loan display values, effective return calculations for periodic investments, and compounding frequency inconsistencies. Each fix requires precise mathematical corrections while preserving all existing correct functionality across 20+ calculators.

The fixes will ensure:
- Mathematically correct monthly interest calculation for simple interest
- Accurate first-month amortization display for loan calculators
- Proper effective annual return calculation for periodic investments (SIP/PPF)
- Consistent compounding frequency application across initial and monthly contributions

## Glossary

- **Bug_Condition (C)**: The specific input conditions that trigger each of the four bugs
- **Property (P)**: The correct mathematical behavior expected for each bug condition
- **Preservation**: All existing correct calculator functionality that must remain unchanged
- **Monthly Interest (Simple Interest)**: Interest earned per month, calculated as total annual interest divided by 12
- **Amortization**: The process of paying off a loan through regular payments, where the split between principal and interest changes each month
- **Effective Annual Return**: The annualized rate of return accounting for compounding, different for lump sum vs periodic investments
- **XIRR**: Extended Internal Rate of Return - accurate method for calculating returns on periodic investments with irregular cash flows
- **Compounding Frequency**: How often interest is calculated and added to the principal (annually, monthly, daily, etc.)


## Bug Details

### Bug 1: Simple Interest Monthly Interest Calculation

#### Fault Condition

The bug manifests when calculating monthly interest in the simple interest calculator. The system divides total simple interest by (time × 12) instead of just 12, resulting in average monthly interest over the entire period rather than monthly interest per year.

**Formal Specification:**
```
FUNCTION isBugCondition_SimpleInterest(input)
  INPUT: input of type SimpleInterestInputs {principal, rate, time}
  OUTPUT: boolean
  
  RETURN input.principal > 0 
         AND input.rate > 0 
         AND input.time > 0
         AND monthlyInterest_calculated = simpleInterest / (time × 12)
END FUNCTION
```

**Examples:**
- Principal: ₹100,000, Rate: 10%, Time: 3 years
  - Total Simple Interest: ₹30,000
  - Current (Wrong): Monthly Interest = ₹30,000 / (3 × 12) = ₹833.33
  - Expected (Correct): Monthly Interest = ₹30,000 / 12 = ₹2,500

- Principal: ₹50,000, Rate: 8%, Time: 2 years
  - Total Simple Interest: ₹8,000
  - Current (Wrong): Monthly Interest = ₹8,000 / 24 = ₹333.33
  - Expected (Correct): Monthly Interest = ₹8,000 / 12 = ₹666.67

### Bug 2: Loan Calculator Display Values

#### Fault Condition

The bug manifests when displaying "Monthly Principal" and "Monthly Interest" in the loan calculator page. The system calculates average values (principal/months and monthly-average_principal) instead of the actual first month's amortization split where principal and interest portions change each payment.

**Formal Specification:**
```
FUNCTION isBugCondition_LoanDisplay(input)
  INPUT: input of type LoanInputs {principal, rate, years}
  OUTPUT: boolean
  
  RETURN input.principal > 0 
         AND input.rate > 0 
         AND input.years > 0
         AND monthlyPrincipal_displayed = principal / (years × 12)
         AND monthlyInterest_displayed = monthlyPayment - monthlyPrincipal_displayed
END FUNCTION
```

**Examples:**
- Loan: ₹100,000 at 12% for 5 years, Monthly EMI: ₹2,224.44
  - Current (Wrong - Average): Principal = ₹1,666.67, Interest = ₹557.77
  - Expected (Correct - First Month): Principal = ₹1,224.44, Interest = ₹1,000.00
  - Note: In first month, interest is higher; in last month, principal is higher


### Bug 3: SIP/PPF Effective Annual Return Calculation

#### Fault Condition

The bug manifests when calculating "Effective Annual Return" for SIP and PPF investments. The system uses the lump sum formula `((maturityAmount / totalInvestment) ^ (1 / years) - 1) * 100`, which is only correct for one-time investments, not for periodic investments where money is invested over time.

**Formal Specification:**
```
FUNCTION isBugCondition_EffectiveReturn(input)
  INPUT: input of type PeriodicInvestmentInputs {monthlyInvestment OR yearlyInvestment, rate, years}
  OUTPUT: boolean
  
  RETURN input has periodic contributions (monthly or yearly)
         AND effectiveReturn_calculated = ((maturityAmount / totalInvestment) ^ (1 / years) - 1) * 100
         AND NOT using XIRR methodology
END FUNCTION
```

**Examples:**
- SIP: ₹5,000/month at 12% for 10 years
  - Total Investment: ₹6,00,000
  - Maturity Amount: ₹11,61,695
  - Current Formula (Wrong): ((11,61,695 / 6,00,000) ^ (1/10) - 1) * 100 = 6.85%
  - Issue: This doesn't account for the fact that early investments compound longer than later ones
  - Solution: Use XIRR or relabel as "Absolute Return" or "Simple Annual Growth Rate"

- PPF: ₹1,50,000/year at 7.1% for 15 years
  - Current formula gives misleading annualized return
  - XIRR would provide accurate return considering investment timing

### Bug 4: Investment Compounding Frequency Inconsistency

#### Fault Condition

The bug manifests in the investment calculator when a user selects a compounding frequency (annually, quarterly, etc.). The system applies the selected frequency to the initial amount but always uses monthly compounding for monthly contributions, creating inconsistent compounding logic within the same calculation.

**Formal Specification:**
```
FUNCTION isBugCondition_CompoundingInconsistency(input)
  INPUT: input of type InvestmentInputs {initialAmount, monthlyContribution, rate, years, compoundingFrequency}
  OUTPUT: boolean
  
  RETURN input.initialAmount > 0 
         AND input.monthlyContribution > 0
         AND input.compoundingFrequency != 'monthly'
         AND initialAmount_uses_selectedFrequency = true
         AND monthlyContributions_use_monthlyFrequency = true
END FUNCTION
```

**Examples:**
- Investment: ₹10,000 initial + ₹500/month at 7% annually compounded for 10 years
  - Current (Inconsistent): Initial ₹10,000 compounds annually, but ₹500/month compounds monthly
  - Expected: Both should compound annually, OR clearly document the mixed approach
  - Impact: Results don't match user's expectation of "annual compounding"


## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

All existing correct calculator functionality must remain unchanged:

1. **Mortgage Calculator** - Monthly payment, total payment, and amortization schedule calculations using standard mortgage formula with safe math operations
2. **Tax Calculators** - Income tax (old/new regime), GST (exclusive/inclusive), HRA exemption, capital gains, and salary (CTC to in-hand) calculations
3. **Safe Math Operations** - safeDivide, safeMultiply, safeAdd, safePower functions preventing division by zero and handling edge cases
4. **Number Parsing** - parseRobustNumber handling currency strings with commas and symbols
5. **Amortization Schedules** - Loan and advanced EMI schedule generation with correct balance tracking and cumulative interest
6. **FD Calculator** - Fixed deposit calculations with different compounding frequencies
7. **RD Calculator** - Recurring deposit with monthly interest application
8. **Dividend Yield** - Yield percentage, annual income, and total returns calculations
9. **Gold Investment** - Investment amount, gold price, appreciation rate, and yearly breakdown
10. **Salary Calculator** - Basic, HRA, PF deduction, and net salary calculations
11. **Extra Payments** - Loan extra payment handling reducing principal and recalculating schedule
12. **Advanced EMI** - Prepayment handling (monthly/yearly) with schedule adjustments
13. **SIP Calculation Logic** - Month-by-month investment growth with proper interest application (only display label changes)
14. **Lumpsum Investment** - Compound interest formula and yearly breakdown
15. **PPF Calculation Logic** - 7.1% interest rate application and yearly breakdown (only display label changes)
16. **EPF Calculator** - Employee and employer contributions with 8.5% interest rate
17. **Zero Interest Handling** - Mortgage calculator correctly handling 0% rate with simple division
18. **Edge Case Handling** - All calculators gracefully handling zero, negative, null, undefined, and string inputs

**Scope:**

All inputs and calculations that do NOT involve the four specific bugs should be completely unaffected by these fixes. This includes:
- All other calculator types not mentioned in the bug list
- All mathematical formulas except the four specific buggy calculations
- All UI components and display logic except the specific bug-affected displays
- All test cases that currently pass (except those testing the buggy behavior)


## Hypothesized Root Cause

Based on the bug descriptions and code analysis, the root causes are:

### Bug 1: Simple Interest Monthly Interest
**Root Cause**: Mathematical error in formula - dividing by total months instead of 12

The formula `monthlyInterest = simpleInterest / (time × 12)` appears in two locations:
1. `src/lib/calculations/simple-interest.ts` line 73
2. `src/app/calculators/simple-interest/page.tsx` (duplicated calculation)

This suggests a misunderstanding of what "monthly interest" means - the code calculates average monthly interest over the entire period, but users expect monthly interest per year (which is constant in simple interest).

### Bug 2: Loan Calculator Display Values
**Root Cause**: Using average values instead of actual amortization schedule values

In `src/app/calculators/loan/page.tsx` lines 115-116:
```typescript
const monthlyPrincipal = principal / months;
const monthlyInterest = monthly - monthlyPrincipal;
```

This calculates average values, but in an amortizing loan:
- First payment: High interest, low principal
- Last payment: Low interest, high principal

The fix should either:
1. Calculate actual first month values using the amortization formula
2. Clearly label as "Average Monthly Principal" and "Average Monthly Interest"

### Bug 3: SIP/PPF Effective Annual Return
**Root Cause**: Using lump sum return formula for periodic investments

In both `src/app/calculators/sip/page.tsx` and `src/app/calculators/ppf/page.tsx`:
```typescript
value: ((maturityAmount / totalInvestment) ** (1 / years) - 1) * 100
```

This formula assumes all money is invested at time zero, but in SIP/PPF:
- Money is invested periodically (monthly/yearly)
- Early investments compound longer than later investments
- XIRR is the correct methodology for time-weighted returns

### Bug 4: Investment Compounding Inconsistency
**Root Cause**: Mixed compounding logic in `src/lib/calculations/investment.ts`

Lines 30-32 apply user-selected compounding frequency to initial amount:
```typescript
const fvInitial = safeMultiply(initialAmount, safePower(safeAdd(1, safeDivide(rate, compoundingPeriodsPerYear)), safeMultiply(compoundingPeriodsPerYear, years)));
```

But lines 35-42 always use monthly compounding for contributions:
```typescript
const monthlyRate = safeDivide(rate, 12);
```

This creates inconsistent behavior where selecting "annual compounding" only affects the initial amount, not the monthly contributions.


## Correctness Properties

Property 1: Fault Condition - Simple Interest Monthly Interest Calculation

_For any_ simple interest calculation where principal > 0, rate > 0, and time > 0, the fixed function SHALL calculate monthlyInterest as simpleInterest / 12, representing the monthly interest per year, not the average monthly interest over the entire period.

**Validates: Requirements 2.1, 2.2**

Property 2: Fault Condition - Loan Calculator Display Values

_For any_ loan calculation where principal > 0, rate > 0, and years > 0, the fixed display SHALL either show the actual first month's principal and interest split from the amortization schedule, OR clearly label the values as "Average Monthly Principal" and "Average Monthly Interest" to avoid misleading users.

**Validates: Requirements 3.1**

Property 3: Fault Condition - SIP/PPF Effective Annual Return

_For any_ SIP or PPF calculation with periodic investments, the fixed function SHALL either use XIRR methodology to calculate accurate time-weighted returns, OR change the label from "Effective Annual Return" to "Absolute Return" or "Simple Annual Growth Rate" to accurately describe what the current formula calculates.

**Validates: Requirements 4.1, 4.2**

Property 4: Fault Condition - Investment Compounding Consistency

_For any_ investment calculation with both initial amount and monthly contributions, the fixed function SHALL apply the user-selected compounding frequency consistently to both components, OR clearly document that monthly contributions always use monthly compounding regardless of the selected frequency.

**Validates: Requirements 5.1**

Property 5: Preservation - All Other Calculator Functionality

_For any_ calculation that does NOT involve the four specific bugs (simple interest monthly interest, loan display values, SIP/PPF effective return, investment compounding), the fixed code SHALL produce exactly the same results as the original code, preserving all existing correct functionality across mortgage, tax, savings, and other calculators.

**Validates: Requirements 6.1-6.20**


## Fix Implementation

### Bug 1: Simple Interest Monthly Interest Calculation

**Files to Modify:**
1. `src/lib/calculations/simple-interest.ts`
2. `src/app/calculators/simple-interest/page.tsx` (if duplicated calculation exists)

**Specific Changes:**

1. **In `src/lib/calculations/simple-interest.ts` (line ~73)**:
   ```typescript
   // BEFORE (Wrong):
   monthlyInterest: roundToPrecision(safeDivide(simpleInterest, safeMultiply(time, 12)))
   
   // AFTER (Correct):
   monthlyInterest: roundToPrecision(safeDivide(simpleInterest, 12))
   ```

2. **In `src/app/calculators/simple-interest/page.tsx`** (if calculation is duplicated):
   - Search for any duplicate calculation of monthlyInterest
   - Apply the same fix: divide by 12, not (time × 12)

**Rationale**: Simple interest is constant per year. Monthly interest means "interest per month in a year", which is annual interest / 12, not total interest / total months.

### Bug 2: Loan Calculator Display Values

**File to Modify:**
`src/app/calculators/loan/page.tsx`

**Specific Changes:**

**Option A: Calculate Actual First Month Values** (Recommended)
```typescript
// BEFORE (lines ~115-116):
const monthlyPrincipal = principal / months;
const monthlyInterest = monthly - monthlyPrincipal;

// AFTER (Correct - First Month Amortization):
const rate = annualRate / 100 / 12; // Monthly interest rate
const firstMonthInterest = principal * rate;
const firstMonthPrincipal = monthly - firstMonthInterest;

// Update result labels:
{
  label: "First Month Principal",
  value: firstMonthPrincipal,
  type: "currency",
  tooltip: "Principal portion of your first EMI payment (increases over time).",
},
{
  label: "First Month Interest",
  value: firstMonthInterest,
  type: "currency",
  tooltip: "Interest portion of your first EMI payment (decreases over time).",
}
```

**Option B: Relabel as Average Values** (Alternative)
```typescript
// Keep calculation the same but update labels:
{
  label: "Average Monthly Principal",
  value: monthlyPrincipal,
  type: "currency",
  tooltip: "Average principal portion across all payments.",
},
{
  label: "Average Monthly Interest",
  value: monthlyInterest,
  type: "currency",
  tooltip: "Average interest portion across all payments.",
}
```

**Recommendation**: Use Option A (actual first month values) as it provides more useful information to users about how their loan amortizes.


### Bug 3: SIP/PPF Effective Annual Return Calculation

**Files to Modify:**
1. `src/app/calculators/sip/page.tsx`
2. `src/app/calculators/ppf/page.tsx`

**Specific Changes:**

**Option A: Relabel the Metric** (Recommended - Simpler)
```typescript
// BEFORE:
{
  label: 'Effective Annual Return',
  value: ((sipResults.maturityAmount / sipResults.totalInvestment) ** (1 / values.years) - 1) * 100,
  type: 'percentage',
  tooltip: 'Annualized return rate considering compounding'
}

// AFTER:
{
  label: 'Absolute Return',
  value: ((sipResults.maturityAmount / sipResults.totalInvestment) ** (1 / values.years) - 1) * 100,
  type: 'percentage',
  tooltip: 'Simple annualized growth rate (does not account for investment timing)'
}
```

**Option B: Implement XIRR Calculation** (More Accurate - Complex)
1. Create XIRR utility function in `src/lib/utils/financial.ts`
2. Implement Newton-Raphson method for XIRR calculation
3. Generate cash flow array from monthly/yearly breakdown
4. Calculate XIRR and display as "Effective Annual Return (XIRR)"

**Recommendation**: Use Option A (relabel) for this bugfix. XIRR implementation can be a future enhancement as it requires significant additional code and testing.

**Apply to both files:**
- `src/app/calculators/sip/page.tsx` (around line 70)
- `src/app/calculators/ppf/page.tsx` (around line 60)

### Bug 4: Investment Compounding Frequency Inconsistency

**File to Modify:**
`src/lib/calculations/investment.ts`

**Specific Changes:**

**Option A: Apply Consistent Compounding** (Recommended)
```typescript
// BEFORE (lines ~35-42):
const monthlyRate = safeDivide(rate, 12);
const totalMonths = safeMultiply(years, 12);

let fvContributions;
if (rate === 0 || monthlyRate === 0) {
  fvContributions = safeMultiply(monthlyContribution, totalMonths);
} else {
  fvContributions = safeMultiply(monthlyContribution, safeDivide(safePower(safeAdd(1, monthlyRate), totalMonths) - 1, monthlyRate));
}

// AFTER (Consistent with selected frequency):
// Use the same compounding frequency for monthly contributions
const periodsPerYear = getCompoundingPeriods(compoundingFrequency);
const ratePerPeriod = safeDivide(rate, periodsPerYear);
const totalPeriods = safeMultiply(periodsPerYear, years);

// Convert monthly contributions to per-period contributions
const contributionPerPeriod = safeMultiply(monthlyContribution, safeDivide(12, periodsPerYear));

let fvContributions;
if (rate === 0 || ratePerPeriod === 0) {
  fvContributions = safeMultiply(contributionPerPeriod, totalPeriods);
} else {
  fvContributions = safeMultiply(contributionPerPeriod, safeDivide(safePower(safeAdd(1, ratePerPeriod), totalPeriods) - 1, ratePerPeriod));
}
```

**Option B: Document Mixed Approach** (Alternative)
- Keep current implementation
- Add clear documentation in code and UI tooltip
- Update tooltip: "Initial amount compounds [frequency], monthly contributions compound monthly"

**Recommendation**: Use Option A (consistent compounding) as it matches user expectations when they select a compounding frequency.

**Additional Changes Needed:**
- Update `generateYearlyBreakdown` function to use consistent compounding
- Ensure all calculations use the same frequency throughout


## Testing Strategy

### Validation Approach

The testing strategy follows a three-phase approach:
1. **Exploratory Testing**: Surface counterexamples on unfixed code to confirm bugs
2. **Fix Verification**: Verify fixes work correctly for all bug conditions
3. **Preservation Testing**: Ensure all other functionality remains unchanged

### Test Coverage Analysis

**Current Test Coverage Review:**

Based on analysis of existing test files:

1. **Simple Interest Tests** (`test/calculations/simple-interest-calculator.test.ts`):
   - ✅ Has basic functionality tests
   - ✅ Has error handling tests
   - ❌ Missing: Monthly interest calculation verification
   - ❌ Missing: Edge cases for different time periods
   - **Gap**: No test validates the monthly interest formula

2. **Loan Tests** (`test/calculations/loan.test.ts`):
   - ✅ Comprehensive test suite (500+ lines)
   - ✅ Tests basic functionality, edge cases, payment schedules
   - ❌ Missing: First month principal/interest split verification
   - ❌ Missing: Amortization schedule accuracy for display values
   - **Gap**: Tests exist for amortization schedule but not for display values shown in UI

3. **SIP Tests** (`test/calculations/sip.test.ts`):
   - ✅ Comprehensive test suite with mathematical accuracy tests
   - ✅ Tests monthly breakdown calculations
   - ❌ Missing: Effective annual return calculation validation
   - ❌ Missing: XIRR comparison tests
   - **Gap**: No test validates the effective return formula or compares it to XIRR

4. **Investment Tests** (`test/calculations/investment.test.ts`):
   - ✅ Comprehensive test suite with compounding frequency tests
   - ✅ Tests different compounding frequencies
   - ❌ Missing: Verification that monthly contributions use selected frequency
   - ❌ Missing: Consistency check between initial and contribution compounding
   - **Gap**: Tests verify different frequencies work but don't verify consistency

5. **PPF Tests** (`test/calculations/ppf.test.ts`):
   - Needs review (not examined in detail)
   - Likely similar gaps to SIP tests

**Test Enhancement Needs:**

1. Add specific tests for each bug condition
2. Add tests for edge cases around each bug
3. Add regression tests to prevent bug reintroduction
4. Enhance existing tests to cover display value calculations
5. Add property-based tests for mathematical accuracy


### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing fixes. Confirm root cause analysis.

#### Bug 1: Simple Interest Monthly Interest

**Test Plan**: Write tests that calculate simple interest and verify monthly interest formula. Run on UNFIXED code to observe failures.

**Test Cases**:
1. **Standard Case**: Principal ₹100,000, Rate 10%, Time 3 years
   - Expected: Monthly Interest = ₹833.33 (current wrong formula)
   - Should Be: Monthly Interest = ₹2,500 (correct formula)
   - Will fail on unfixed code

2. **Short Term**: Principal ₹50,000, Rate 8%, Time 1 year
   - Expected: Monthly Interest = ₹333.33 (wrong)
   - Should Be: Monthly Interest = ₹333.33 (correct - happens to match!)
   - Edge case where bug is hidden

3. **Long Term**: Principal ₹200,000, Rate 12%, Time 5 years
   - Expected: Monthly Interest = ₹2,000 (wrong)
   - Should Be: Monthly Interest = ₹10,000 (correct)
   - Will fail on unfixed code

**Expected Counterexamples**:
- Monthly interest values are 1/time smaller than they should be
- For time=1 year, bug is hidden (both formulas give same result)
- For time>1 year, bug becomes more pronounced

#### Bug 2: Loan Calculator Display Values

**Test Plan**: Calculate loan EMI and compare displayed principal/interest split with actual first month amortization. Run on UNFIXED code.

**Test Cases**:
1. **Standard Loan**: ₹100,000 at 12% for 5 years
   - Current Display: Principal ≈ ₹1,667, Interest ≈ ₹557
   - Actual First Month: Principal ≈ ₹1,224, Interest ≈ ₹1,000
   - Will fail on unfixed code

2. **High Interest Loan**: ₹50,000 at 18% for 3 years
   - Current shows average values
   - Actual first month has much higher interest portion
   - Will fail on unfixed code

3. **Low Interest Loan**: ₹200,000 at 6% for 10 years
   - Current shows average values
   - Actual first month values differ significantly
   - Will fail on unfixed code

**Expected Counterexamples**:
- Displayed values don't match first payment in amortization schedule
- For high interest rates, difference is more pronounced
- Average values mislead users about actual payment structure

#### Bug 3: SIP/PPF Effective Annual Return

**Test Plan**: Calculate SIP/PPF returns and compare displayed "Effective Annual Return" with XIRR calculation. Run on UNFIXED code.

**Test Cases**:
1. **Standard SIP**: ₹5,000/month at 12% for 10 years
   - Current Formula: ~6.85% (wrong - lump sum formula)
   - XIRR: ~12% (correct - accounts for timing)
   - Will fail on unfixed code

2. **PPF Investment**: ₹150,000/year at 7.1% for 15 years
   - Current Formula: Understates actual return
   - XIRR: More accurate time-weighted return
   - Will fail on unfixed code

3. **Short Term SIP**: ₹10,000/month at 15% for 3 years
   - Current Formula: Significantly understates return
   - XIRR: Properly accounts for compounding
   - Will fail on unfixed code

**Expected Counterexamples**:
- Displayed return is significantly lower than actual XIRR
- Longer investment periods show larger discrepancy
- Users are misled about actual investment performance

#### Bug 4: Investment Compounding Inconsistency

**Test Plan**: Calculate investment with annual compounding and verify both initial and monthly contributions use same frequency. Run on UNFIXED code.

**Test Cases**:
1. **Annual Compounding**: ₹10,000 initial + ₹500/month at 7% annually for 10 years
   - Initial Amount: Uses annual compounding (correct)
   - Monthly Contributions: Uses monthly compounding (wrong)
   - Will fail on unfixed code

2. **Quarterly Compounding**: ₹20,000 initial + ₹1,000/month at 8% quarterly for 5 years
   - Initial Amount: Uses quarterly compounding (correct)
   - Monthly Contributions: Uses monthly compounding (wrong)
   - Will fail on unfixed code

3. **Daily Compounding**: ₹5,000 initial + ₹200/month at 6% daily for 3 years
   - Both should use daily compounding
   - Only initial amount does (wrong)
   - Will fail on unfixed code

**Expected Counterexamples**:
- Results don't match expected values for selected compounding frequency
- Selecting different frequencies has less impact than expected
- Manual calculation with consistent compounding gives different results


### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed function produces the expected correct behavior.

**Pseudocode for Bug 1 (Simple Interest):**
```
FOR ALL input WHERE isBugCondition_SimpleInterest(input) DO
  result := calculateSimpleInterest_fixed(input)
  simpleInterest := (input.principal * input.rate * input.time) / 100
  expectedMonthlyInterest := simpleInterest / 12
  ASSERT result.monthlyInterest = expectedMonthlyInterest
END FOR
```

**Pseudocode for Bug 2 (Loan Display):**
```
FOR ALL input WHERE isBugCondition_LoanDisplay(input) DO
  result := calculateLoan_fixed(input)
  monthlyRate := input.rate / 100 / 12
  expectedFirstMonthInterest := input.principal * monthlyRate
  expectedFirstMonthPrincipal := result.monthlyPayment - expectedFirstMonthInterest
  ASSERT result.firstMonthPrincipal = expectedFirstMonthPrincipal
  ASSERT result.firstMonthInterest = expectedFirstMonthInterest
END FOR
```

**Pseudocode for Bug 3 (SIP/PPF Return):**
```
FOR ALL input WHERE isBugCondition_EffectiveReturn(input) DO
  result := calculateSIP_fixed(input) OR calculatePPF_fixed(input)
  // If using relabel approach:
  ASSERT result.displayLabel = "Absolute Return" OR "Simple Annual Growth Rate"
  // If using XIRR approach:
  expectedXIRR := calculateXIRR(cashFlows)
  ASSERT result.effectiveReturn ≈ expectedXIRR (within tolerance)
END FOR
```

**Pseudocode for Bug 4 (Investment Compounding):**
```
FOR ALL input WHERE isBugCondition_CompoundingInconsistency(input) DO
  result := calculateInvestment_fixed(input)
  // Verify both components use same frequency
  expectedFV := calculateWithConsistentCompounding(input)
  ASSERT result.finalAmount ≈ expectedFV (within tolerance)
  // Verify yearly breakdown uses consistent compounding
  FOR EACH year IN result.yearlyBreakdown DO
    ASSERT year.growth calculated with selected frequency
  END FOR
END FOR
```

**Test Implementation Strategy:**

1. **Unit Tests**: Test each fix in isolation with known inputs/outputs
2. **Property-Based Tests**: Generate random valid inputs and verify properties hold
3. **Regression Tests**: Ensure fixes don't break when code changes
4. **Integration Tests**: Test fixes in context of full calculator flow


### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same results as the original functions.

**Pseudocode:**
```
FOR ALL calculator IN [mortgage, tax, FD, RD, EPF, dividend, gold, salary, etc.] DO
  FOR ALL input IN validInputs(calculator) DO
    resultOriginal := calculator_original(input)
    resultFixed := calculator_fixed(input)
    ASSERT resultOriginal = resultFixed
  END FOR
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs
- It can test thousands of scenarios efficiently

**Test Plan**: Run existing comprehensive test suites on FIXED code and verify all tests still pass (except those testing the buggy behavior).

**Specific Preservation Test Cases:**

1. **Mortgage Calculator Preservation**:
   - All existing mortgage tests should pass unchanged
   - Monthly payment formula remains correct
   - Amortization schedule generation unchanged
   - Zero interest rate handling preserved

2. **Tax Calculator Preservation**:
   - Income tax calculations (old/new regime) unchanged
   - GST calculations (exclusive/inclusive) unchanged
   - HRA exemption logic preserved
   - Capital gains calculations unchanged
   - Salary (CTC to in-hand) calculations preserved

3. **Safe Math Operations Preservation**:
   - safeDivide, safeMultiply, safeAdd, safePower unchanged
   - Division by zero handling preserved
   - Edge case handling (null, undefined, infinity) unchanged

4. **Number Parsing Preservation**:
   - parseRobustNumber handles currency strings correctly
   - Comma and symbol parsing unchanged
   - Negative number handling preserved

5. **Other Savings Calculators Preservation**:
   - FD calculator with different compounding frequencies unchanged
   - RD calculator with monthly interest application unchanged
   - EPF calculator with employee/employer contributions unchanged
   - Dividend yield calculations unchanged
   - Gold investment calculations unchanged

6. **Loan Calculator Core Logic Preservation**:
   - Monthly EMI calculation unchanged
   - Total payment and total interest unchanged
   - Amortization schedule generation unchanged
   - Extra payment handling unchanged
   - Advanced EMI with prepayments unchanged

7. **SIP/PPF Core Logic Preservation**:
   - Month-by-month/year-by-year calculation logic unchanged
   - Interest application unchanged
   - Breakdown generation unchanged
   - Only display label changes (if using relabel approach)

8. **Investment Calculator Preservation** (except Bug 4 fix):
   - Initial amount calculation logic preserved
   - Yearly breakdown structure unchanged
   - Annualized return calculation unchanged (except for consistency fix)

**Regression Test Strategy:**

1. Run full existing test suite (1000+ tests) on fixed code
2. Verify all tests pass except those explicitly testing buggy behavior
3. Update tests that verify buggy behavior to verify correct behavior
4. Add new tests for the fixes
5. Ensure no performance degradation


### Unit Tests

**Bug 1: Simple Interest Monthly Interest**
- Test standard case: ₹100,000 at 10% for 3 years → monthly interest = ₹2,500
- Test edge case: ₹50,000 at 8% for 1 year → monthly interest = ₹333.33 (bug hidden)
- Test long term: ₹200,000 at 12% for 5 years → monthly interest = ₹10,000
- Test zero principal: monthly interest = 0
- Test zero rate: monthly interest = 0
- Test fractional rates: ₹100,000 at 7.5% for 2 years → monthly interest = ₹625

**Bug 2: Loan Calculator Display Values**
- Test standard loan: ₹100,000 at 12% for 5 years → verify first month split
- Test high interest: ₹50,000 at 18% for 3 years → first month interest > principal
- Test low interest: ₹200,000 at 6% for 10 years → first month principal > interest
- Test zero interest: first month interest = 0, principal = total/months
- Test very short term: 1 year loan → verify first month values
- Test very long term: 30 year loan → verify first month values
- Compare first month values with amortization schedule[0]

**Bug 3: SIP/PPF Effective Annual Return**
- Test SIP standard: ₹5,000/month at 12% for 10 years → verify label change
- Test PPF standard: ₹150,000/year at 7.1% for 15 years → verify label change
- Test short term SIP: ₹10,000/month at 15% for 3 years → verify label
- Test long term SIP: ₹5,000/month at 10% for 20 years → verify label
- If XIRR implemented: Compare XIRR result with manual calculation
- Verify tooltip accurately describes the metric

**Bug 4: Investment Compounding Inconsistency**
- Test annual compounding: ₹10,000 + ₹500/month at 7% annually → verify consistency
- Test quarterly compounding: ₹20,000 + ₹1,000/month at 8% quarterly → verify consistency
- Test monthly compounding: ₹5,000 + ₹200/month at 6% monthly → should be unchanged
- Test daily compounding: ₹15,000 + ₹750/month at 9% daily → verify consistency
- Test zero monthly contribution: should work as before (only initial amount)
- Test zero initial amount: should work as before (only contributions)
- Compare results with manual calculation using consistent compounding

**Preservation Unit Tests**
- Run all existing unit tests for unaffected calculators
- Verify mortgage calculator tests pass unchanged
- Verify tax calculator tests pass unchanged
- Verify FD, RD, EPF, dividend, gold tests pass unchanged
- Verify safe math operation tests pass unchanged
- Verify number parsing tests pass unchanged


### Property-Based Tests

**Bug 1: Simple Interest Monthly Interest Property**
```
PROPERTY: For any valid simple interest inputs (principal > 0, rate > 0, time > 0),
  monthlyInterest = simpleInterest / 12
  
GENERATE: Random inputs with:
  - principal: 1,000 to 10,000,000
  - rate: 0.1 to 50
  - time: 0.1 to 50
  
VERIFY: result.monthlyInterest = (principal * rate * time / 100) / 12
```

**Bug 2: Loan Display Values Property**
```
PROPERTY: For any valid loan inputs (principal > 0, rate > 0, years > 0),
  firstMonthInterest = principal * (rate / 100 / 12)
  firstMonthPrincipal = monthlyPayment - firstMonthInterest
  
GENERATE: Random inputs with:
  - principal: 10,000 to 10,000,000
  - rate: 0.1 to 30
  - years: 1 to 50
  
VERIFY: 
  - result.firstMonthInterest = principal * monthlyRate
  - result.firstMonthPrincipal = monthlyPayment - firstMonthInterest
  - firstMonthInterest + firstMonthPrincipal = monthlyPayment
  - Values match amortization schedule[0]
```

**Bug 3: SIP/PPF Return Label Property**
```
PROPERTY: For any periodic investment calculation,
  the return metric label accurately describes the calculation method
  
GENERATE: Random inputs with:
  - monthlyInvestment/yearlyInvestment: 100 to 100,000
  - rate: 1 to 30
  - years: 1 to 50
  
VERIFY:
  - If using lump sum formula: label = "Absolute Return" or "Simple Annual Growth Rate"
  - If using XIRR: label = "Effective Annual Return (XIRR)"
  - Tooltip accurately describes the calculation
```

**Bug 4: Investment Compounding Consistency Property**
```
PROPERTY: For any investment with both initial amount and monthly contributions,
  both components use the same compounding frequency
  
GENERATE: Random inputs with:
  - initialAmount: 1,000 to 1,000,000
  - monthlyContribution: 100 to 10,000
  - rate: 1 to 20
  - years: 1 to 50
  - compoundingFrequency: [annually, semiannually, quarterly, monthly, daily]
  
VERIFY:
  - Calculate expected FV with consistent compounding
  - result.finalAmount ≈ expectedFV (within 0.1% tolerance)
  - Yearly breakdown uses selected frequency
```

**Preservation Property-Based Tests**
```
PROPERTY: For all calculators not affected by the four bugs,
  results remain unchanged after fixes
  
GENERATE: Random valid inputs for each calculator type
  
VERIFY: 
  - Mortgage: monthlyPayment, totalPayment, schedule unchanged
  - Tax: all tax calculations unchanged
  - FD/RD/EPF: all savings calculations unchanged
  - Safe math: all operations unchanged
  - Number parsing: all parsing unchanged
```


### Integration Tests

**Bug 1: Simple Interest Calculator Full Flow**
- User enters principal ₹100,000, rate 10%, time 3 years
- System calculates and displays results
- Verify monthly interest displays as ₹2,500 (not ₹833.33)
- Verify all other displayed values are correct
- Verify calculation history saves correct values
- Test with currency selector (₹, $, €) - all should work

**Bug 2: Loan Calculator Full Flow**
- User enters loan ₹100,000 at 12% for 5 years
- System calculates and displays EMI and breakdown
- Verify "First Month Principal" displays ~₹1,224
- Verify "First Month Interest" displays ~₹1,000
- Verify these match the first row of amortization schedule
- Verify all other loan metrics unchanged (EMI, total payment, total interest)
- Test with extra payments - first month values should still be correct
- Test with different loan types (personal, home, car) - all should work

**Bug 3: SIP/PPF Calculator Full Flow**
- User enters SIP ₹5,000/month at 12% for 10 years
- System calculates and displays results
- Verify return metric label is "Absolute Return" (or "Effective Annual Return (XIRR)" if implemented)
- Verify tooltip accurately describes the calculation
- Verify all other displayed values unchanged (maturity, total investment, gains)
- Test PPF calculator - same label change should apply
- Verify calculation history saves with correct label

**Bug 4: Investment Calculator Full Flow**
- User enters ₹10,000 initial + ₹500/month at 7% with annual compounding for 10 years
- System calculates and displays results
- Verify final amount uses consistent annual compounding
- Verify yearly breakdown shows consistent compounding
- Change compounding frequency to quarterly - verify results update correctly
- Change to monthly - verify results match previous behavior
- Test with zero initial amount - should work correctly
- Test with zero monthly contribution - should work correctly

**Cross-Calculator Integration Tests**
- Test switching between calculators - all should work correctly
- Test calculation history across multiple calculators
- Test currency selector affects all calculators correctly
- Test responsive design - calculators work on mobile/tablet/desktop
- Test accessibility - screen readers can access all values
- Test performance - calculations complete within 500ms

**Regression Integration Tests**
- Run full application test suite
- Verify no broken links or navigation issues
- Verify all calculator pages load correctly
- Verify all forms validate correctly
- Verify all charts and visualizations render correctly
- Verify no console errors or warnings


## Test Enhancement Recommendations

### Priority 1: Critical Bug Verification Tests

**Add to `test/calculations/simple-interest-calculator.test.ts`:**
```typescript
describe('Monthly Interest Calculation', () => {
  it('should calculate monthly interest as annual interest / 12', () => {
    const inputs = { principal: 100000, rate: 10, time: 3 };
    const result = calculateSimpleInterest(inputs);
    const expectedMonthlyInterest = (100000 * 10 * 3 / 100) / 12;
    expect(result.monthlyInterest).toBe(2500);
    expect(result.monthlyInterest).toBe(expectedMonthlyInterest);
  });
  
  it('should calculate same monthly interest regardless of time period', () => {
    const base = { principal: 100000, rate: 10 };
    const result1 = calculateSimpleInterest({ ...base, time: 1 });
    const result2 = calculateSimpleInterest({ ...base, time: 5 });
    const result3 = calculateSimpleInterest({ ...base, time: 10 });
    // Monthly interest per year should be the same
    expect(result1.monthlyInterest).toBe(result2.monthlyInterest);
    expect(result2.monthlyInterest).toBe(result3.monthlyInterest);
  });
});
```

**Add to `test/calculations/loan.test.ts`:**
```typescript
describe('First Month Amortization Display', () => {
  it('should calculate first month principal and interest correctly', () => {
    const inputs = { principal: 100000, rate: 12, years: 5, extraPayment: 0 };
    const result = calculateLoan(inputs);
    const monthlyRate = 0.12 / 12;
    const expectedFirstInterest = 100000 * monthlyRate;
    const expectedFirstPrincipal = result.monthlyPayment - expectedFirstInterest;
    
    expect(result.firstMonthInterest).toBeCloseTo(expectedFirstInterest, 2);
    expect(result.firstMonthPrincipal).toBeCloseTo(expectedFirstPrincipal, 2);
  });
  
  it('should match first month values with amortization schedule', () => {
    const inputs = { principal: 100000, rate: 12, years: 5, extraPayment: 0 };
    const result = calculateLoan(inputs);
    
    expect(result.firstMonthPrincipal).toBeCloseTo(result.paymentSchedule[0].principal, 2);
    expect(result.firstMonthInterest).toBeCloseTo(result.paymentSchedule[0].interest, 2);
  });
});
```

**Add to `test/calculations/sip.test.ts`:**
```typescript
describe('Return Metric Labeling', () => {
  it('should label return metric appropriately for periodic investments', () => {
    const inputs = { monthlyInvestment: 5000, annualReturn: 12, years: 10 };
    const result = calculateSIP(inputs);
    
    // Verify the metric is labeled correctly (not as "Effective Annual Return")
    // This test should verify the UI label, not the calculation itself
    // The calculation can remain the same, but the label should be accurate
  });
});
```

**Add to `test/calculations/investment.test.ts`:**
```typescript
describe('Compounding Frequency Consistency', () => {
  it('should apply selected compounding frequency to both initial and contributions', () => {
    const inputs = {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      years: 10,
      compoundingFrequency: 'annually' as const
    };
    const result = calculateInvestment(inputs);
    
    // Calculate expected value with consistent annual compounding
    const rate = 0.07;
    const expectedInitial = 10000 * Math.pow(1 + rate, 10);
    // For annual compounding, monthly contributions should be accumulated and compounded annually
    const yearlyContribution = 500 * 12;
    let expectedContributions = 0;
    for (let year = 1; year <= 10; year++) {
      expectedContributions += yearlyContribution * Math.pow(1 + rate, 10 - year);
    }
    const expectedTotal = expectedInitial + expectedContributions;
    
    expect(result.finalAmount).toBeCloseTo(expectedTotal, 0);
  });
  
  it('should produce different results for different compounding frequencies', () => {
    const baseInputs = {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      years: 10
    };
    
    const annually = calculateInvestment({ ...baseInputs, compoundingFrequency: 'annually' });
    const monthly = calculateInvestment({ ...baseInputs, compoundingFrequency: 'monthly' });
    const daily = calculateInvestment({ ...baseInputs, compoundingFrequency: 'daily' });
    
    // More frequent compounding should yield higher returns
    expect(monthly.finalAmount).toBeGreaterThan(annually.finalAmount);
    expect(daily.finalAmount).toBeGreaterThan(monthly.finalAmount);
  });
});
```

### Priority 2: Edge Case Coverage

**Add comprehensive edge case tests for each bug:**
- Zero values (principal, rate, time, contributions)
- Very large values (millions, billions)
- Very small values (fractional amounts)
- Boundary values (0.01, 0.99, 1.0, 1.01)
- Negative values (should be handled gracefully)
- Invalid inputs (null, undefined, NaN, Infinity)
- String inputs with currency symbols
- Floating point precision issues

### Priority 3: Performance Tests

**Add performance benchmarks:**
- Each calculator should complete within 100ms for standard inputs
- Batch calculations (100 iterations) should complete within 5 seconds
- Long-term calculations (50+ years) should complete within 500ms
- Memory usage should remain stable across multiple calculations

### Priority 4: Accessibility Tests

**Add accessibility verification:**
- All calculator results should be readable by screen readers
- All form inputs should have proper labels and ARIA attributes
- Keyboard navigation should work for all calculators
- Error messages should be announced to screen readers
- Focus management should be correct


## Summary

This design document provides a comprehensive approach to fixing four verified bugs in the calculator application:

1. **Simple Interest Monthly Interest**: Fix formula to divide by 12 instead of (time × 12)
2. **Loan Calculator Display**: Show actual first month amortization values instead of averages
3. **SIP/PPF Effective Return**: Relabel metric to accurately describe the calculation method
4. **Investment Compounding**: Apply selected frequency consistently to both initial and contributions

Each fix is minimal, targeted, and preserves all existing correct functionality. The testing strategy ensures:
- Bugs are confirmed before fixing (exploratory testing)
- Fixes work correctly for all bug conditions (fix checking)
- All other functionality remains unchanged (preservation checking)
- Comprehensive test coverage prevents regression

The implementation follows these principles:
- **Minimal changes**: Only modify the specific buggy code
- **Mathematical correctness**: Use proper formulas for each calculation
- **User clarity**: Ensure displayed values match user expectations
- **Backward compatibility**: Preserve all existing correct behavior
- **Test coverage**: Add tests for bugs and maintain existing test suite

Next steps:
1. Review and approve this design
2. Implement fixes one bug at a time
3. Add comprehensive tests for each fix
4. Run full test suite to verify preservation
5. Manual testing of affected calculators
6. Deploy fixes to production

