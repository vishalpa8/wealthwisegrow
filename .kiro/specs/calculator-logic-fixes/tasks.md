# Implementation Plan

## Bug 1: Simple Interest Monthly Interest Calculation

- [x] 1.1 Write bug condition exploration test for simple interest monthly interest
  - **Property 1: Fault Condition** - Simple Interest Monthly Interest Calculation
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test with various time periods (1, 3, 5, 10 years) to show bug is hidden at time=1 but pronounced at time>1
  - Test that for principal=₹100,000, rate=10%, time=3 years: monthlyInterest should be ₹2,500 (not ₹833.33)
  - Test that for principal=₹50,000, rate=8%, time=1 year: monthlyInterest should be ₹333.33 (bug hidden - both formulas match)
  - Test that for principal=₹200,000, rate=12%, time=5 years: monthlyInterest should be ₹10,000 (not ₹2,000)
  - Test property: monthlyInterest should be constant regardless of time period for same principal and rate
  - Run test on UNFIXED code in `src/lib/calculations/simple-interest.ts`
  - **EXPECTED OUTCOME**: Test FAILS for time>1 (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "For 3 years, monthly interest is 3x smaller than expected")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [x] 1.2 Write preservation property tests for simple interest (BEFORE implementing fix)
  - **Property 2: Preservation** - Simple Interest Core Calculations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-monthly-interest calculations
  - Write property-based tests capturing observed behavior patterns:
    - Total simple interest calculation: (principal × rate × time) / 100
    - Total amount calculation: principal + simpleInterest
    - Yearly interest calculation: simpleInterest / time
    - Edge cases: zero principal, zero rate, zero time
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 6.1, 6.3, 6.18_

- [x] 1.3 Fix simple interest monthly interest calculation

  - [x] 1.3.1 Implement the fix in calculation library
    - Modify `src/lib/calculations/simple-interest.ts` line ~73
    - Change formula from `safeDivide(simpleInterest, safeMultiply(time, 12))` to `safeDivide(simpleInterest, 12)`
    - Verify safe math operations are preserved
    - _Bug_Condition: isBugCondition_SimpleInterest(input) where input.principal > 0 AND input.rate > 0 AND input.time > 0_
    - _Expected_Behavior: monthlyInterest = simpleInterest / 12 (constant per year, not averaged over total period)_
    - _Preservation: All other simple interest calculations (total interest, total amount, yearly interest) remain unchanged_
    - _Requirements: 2.1, 2.2_

  - [x] 1.3.2 Check for duplicate calculation in UI component
    - Search `src/app/calculators/simple-interest/page.tsx` for any duplicate monthlyInterest calculation
    - If found, apply the same fix: divide by 12, not (time × 12)
    - If not found, mark complete
    - _Requirements: 2.1, 2.2_

  - [x] 1.3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Simple Interest Monthly Interest Calculation
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - The test from task 1.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 1.3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Simple Interest Core Calculations
    - **IMPORTANT**: Re-run the SAME tests from task 1.2 - do NOT write new tests
    - Run preservation property tests from step 1.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 6.1, 6.3, 6.18_

## Bug 2: Loan Calculator Display Values

- [x] 2.1 Write bug condition exploration test for loan display values
  - **Property 1: Fault Condition** - Loan Calculator First Month Amortization Display
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test with various interest rates (6%, 12%, 18%) to show discrepancy between average and actual first month values
  - Test that for loan=₹100,000 at 12% for 5 years: first month interest should be ~₹1,000 (not ~₹557)
  - Test that for loan=₹50,000 at 18% for 3 years: first month interest should be much higher than average
  - Test that for loan=₹200,000 at 6% for 10 years: first month values should differ from average
  - Test property: firstMonthInterest = principal × (rate / 100 / 12)
  - Test property: firstMonthPrincipal = monthlyPayment - firstMonthInterest
  - Test property: first month values should match amortization schedule[0]
  - Run test on UNFIXED code in `src/app/calculators/loan/page.tsx`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "Displayed values don't match amortization schedule")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 3.1_

- [x] 2.2 Write preservation property tests for loan calculator (BEFORE implementing fix)
  - **Property 2: Preservation** - Loan Calculator Core Calculations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-display calculations
  - Write property-based tests capturing observed behavior patterns:
    - Monthly EMI calculation using standard mortgage formula
    - Total payment calculation: monthlyPayment × months
    - Total interest calculation: totalPayment - principal
    - Amortization schedule generation with correct balance tracking
    - Extra payment handling reducing principal
    - Zero interest rate handling (simple division)
    - Edge cases: various loan amounts, rates, terms
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 6.1, 6.2, 6.11, 6.12, 6.17_

- [ ] 2.3 Fix loan calculator display values

  - [ ] 2.3.1 Implement the fix for first month display values
    - Modify `src/app/calculators/loan/page.tsx` lines ~115-116
    - Calculate actual first month values instead of averages:
      - `const monthlyRate = annualRate / 100 / 12`
      - `const firstMonthInterest = principal * monthlyRate`
      - `const firstMonthPrincipal = monthly - firstMonthInterest`
    - Update result labels to "First Month Principal" and "First Month Interest"
    - Update tooltips to explain these are first payment values that change over time
    - _Bug_Condition: isBugCondition_LoanDisplay(input) where input.principal > 0 AND input.rate > 0 AND input.years > 0_
    - _Expected_Behavior: Display actual first month amortization split, not average values_
    - _Preservation: All loan calculations (EMI, total payment, total interest, amortization schedule) remain unchanged_
    - _Requirements: 3.1_

  - [ ] 2.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Loan Calculator First Month Amortization Display
    - **IMPORTANT**: Re-run the SAME test from task 2.1 - do NOT write a new test
    - The test from task 2.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 2.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 3.1_

  - [ ] 2.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Loan Calculator Core Calculations
    - **IMPORTANT**: Re-run the SAME tests from task 2.2 - do NOT write new tests
    - Run preservation property tests from step 2.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 6.1, 6.2, 6.11, 6.12, 6.17_

## Bug 3: SIP/PPF Effective Annual Return Labeling

- [ ] 3.1 Write bug condition exploration test for SIP/PPF return labeling
  - **Property 1: Fault Condition** - SIP/PPF Effective Annual Return Misleading Label
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the misleading label
  - **Scoped PBT Approach**: Test with various investment periods (3, 10, 20 years) to show label doesn't match calculation
  - Test that for SIP=₹5,000/month at 12% for 10 years: label should NOT be "Effective Annual Return" (lump sum formula used)
  - Test that for PPF=₹150,000/year at 7.1% for 15 years: label should accurately describe calculation method
  - Test property: If using formula ((maturityAmount / totalInvestment) ^ (1 / years) - 1) * 100, label should be "Absolute Return" or "Simple Annual Growth Rate"
  - Test property: Tooltip should explain this doesn't account for investment timing
  - Run test on UNFIXED code in `src/app/calculators/sip/page.tsx` and `src/app/calculators/ppf/page.tsx`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the misleading label exists)
  - Document counterexamples found (e.g., "Label says 'Effective Annual Return' but uses lump sum formula")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 4.1, 4.2_

- [ ] 3.2 Write preservation property tests for SIP/PPF calculators (BEFORE implementing fix)
  - **Property 2: Preservation** - SIP/PPF Core Calculation Logic
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all calculation logic
  - Write property-based tests capturing observed behavior patterns:
    - Month-by-month/year-by-year investment growth calculation
    - Interest application at specified rate
    - Maturity amount calculation
    - Total investment calculation
    - Wealth gained calculation
    - Yearly/monthly breakdown generation
    - Edge cases: various investment amounts, rates, periods
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 6.13, 6.15_

- [ ] 3.3 Fix SIP/PPF effective annual return labeling

  - [ ] 3.3.1 Update SIP calculator return metric label
    - Modify `src/app/calculators/sip/page.tsx` around line 70
    - Change label from "Effective Annual Return" to "Absolute Return"
    - Update tooltip to: "Simple annualized growth rate (does not account for investment timing)"
    - Keep calculation formula unchanged: ((maturityAmount / totalInvestment) ** (1 / years) - 1) * 100
    - _Bug_Condition: isBugCondition_EffectiveReturn(input) where input has periodic contributions AND uses lump sum formula_
    - _Expected_Behavior: Label accurately describes the calculation method (Absolute Return, not Effective Annual Return)_
    - _Preservation: All SIP calculation logic (monthly growth, interest application, breakdown) remains unchanged_
    - _Requirements: 4.1_

  - [ ] 3.3.2 Update PPF calculator return metric label
    - Modify `src/app/calculators/ppf/page.tsx` around line 60
    - Change label from "Effective Annual Return" to "Absolute Return"
    - Update tooltip to: "Simple annualized growth rate (does not account for investment timing)"
    - Keep calculation formula unchanged: ((maturityAmount / totalInvestment) ** (1 / years) - 1) * 100
    - _Bug_Condition: isBugCondition_EffectiveReturn(input) where input has periodic contributions AND uses lump sum formula_
    - _Expected_Behavior: Label accurately describes the calculation method (Absolute Return, not Effective Annual Return)_
    - _Preservation: All PPF calculation logic (yearly growth, interest application, breakdown) remains unchanged_
    - _Requirements: 4.2_

  - [ ] 3.3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - SIP/PPF Effective Annual Return Accurate Label
    - **IMPORTANT**: Re-run the SAME test from task 3.1 - do NOT write a new test
    - The test from task 3.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 3.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 4.1, 4.2_

  - [ ] 3.3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - SIP/PPF Core Calculation Logic
    - **IMPORTANT**: Re-run the SAME tests from task 3.2 - do NOT write new tests
    - Run preservation property tests from step 3.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 6.13, 6.15_

## Bug 4: Investment Compounding Frequency Consistency

- [ ] 4.1 Write bug condition exploration test for investment compounding inconsistency
  - **Property 1: Fault Condition** - Investment Compounding Frequency Inconsistency
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the inconsistency
  - **Scoped PBT Approach**: Test with non-monthly frequencies (annually, quarterly) to show inconsistency
  - Test that for initial=₹10,000 + monthly=₹500 at 7% annually for 10 years: both should use annual compounding
  - Test that for initial=₹20,000 + monthly=₹1,000 at 8% quarterly for 5 years: both should use quarterly compounding
  - Test property: Calculate expected FV with consistent compounding and compare with actual result
  - Test property: Yearly breakdown should use selected frequency for both components
  - Run test on UNFIXED code in `src/lib/calculations/investment.ts`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the inconsistency exists)
  - Document counterexamples found (e.g., "Annual compounding selected but monthly contributions use monthly compounding")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 5.1_

- [ ] 4.2 Write preservation property tests for investment calculator (BEFORE implementing fix)
  - **Property 2: Preservation** - Investment Calculator Core Calculations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-compounding-consistency calculations
  - Write property-based tests capturing observed behavior patterns:
    - Initial amount calculation with selected frequency (already correct)
    - Yearly breakdown structure and format
    - Annualized return calculation
    - Edge cases: zero initial amount, zero monthly contribution
    - Monthly compounding case (should remain unchanged)
    - Various investment amounts, rates, periods
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 6.14_

- [ ] 4.3 Fix investment compounding frequency consistency

  - [ ] 4.3.1 Implement consistent compounding for monthly contributions
    - Modify `src/lib/calculations/investment.ts` lines ~35-42
    - Replace monthly-only compounding with selected frequency compounding:
      - Use `compoundingPeriodsPerYear` instead of hardcoded 12
      - Calculate `ratePerPeriod = safeDivide(rate, compoundingPeriodsPerYear)`
      - Calculate `totalPeriods = safeMultiply(compoundingPeriodsPerYear, years)`
      - Convert monthly contributions to per-period: `contributionPerPeriod = safeMultiply(monthlyContribution, safeDivide(12, compoundingPeriodsPerYear))`
      - Apply future value of annuity formula with selected frequency
    - _Bug_Condition: isBugCondition_CompoundingInconsistency(input) where input.initialAmount > 0 AND input.monthlyContribution > 0 AND input.compoundingFrequency != 'monthly'_
    - _Expected_Behavior: Both initial amount and monthly contributions use the same user-selected compounding frequency_
    - _Preservation: Initial amount calculation, yearly breakdown structure, annualized return remain unchanged_
    - _Requirements: 5.1_

  - [ ] 4.3.2 Update yearly breakdown to use consistent compounding
    - Modify `generateYearlyBreakdown` function in `src/lib/calculations/investment.ts`
    - Ensure yearly breakdown calculations use selected compounding frequency for both components
    - Verify opening balance, contributions, interest, and closing balance are calculated consistently
    - _Requirements: 5.1_

  - [ ] 4.3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Investment Compounding Frequency Consistency
    - **IMPORTANT**: Re-run the SAME test from task 4.1 - do NOT write a new test
    - The test from task 4.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 4.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 5.1_

  - [ ] 4.3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Investment Calculator Core Calculations
    - **IMPORTANT**: Re-run the SAME tests from task 4.2 - do NOT write new tests
    - Run preservation property tests from step 4.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 6.14_

## Final Validation

- [ ] 5. Checkpoint - Ensure all tests pass
  - Run complete test suite for all calculators
  - Verify all 4 bug condition exploration tests now pass (were failing before fixes)
  - Verify all preservation tests still pass (no regressions)
  - Verify existing test suite passes (except tests that verified buggy behavior)
  - Test each calculator manually to confirm fixes work as expected
  - Ensure no console errors or warnings
  - Ask the user if questions arise or if additional testing is needed
