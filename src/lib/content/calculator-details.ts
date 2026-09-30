export type CalculatorDetail = {
  answers: string;
  example: string;
  tip: string;
  guide?: { label: string; href: string };
};

export const calculatorDetails: Record<string, CalculatorDetail> = {
  loan: {
    answers: "What will my monthly EMI be, how much interest will I pay over the full tenure, and how does changing the rate or tenure change both numbers?",
    example: "A Rs 5 lakh loan at 11% for 3 years works out to an EMI of about Rs 16,370. Over 36 months you repay roughly Rs 5.89 lakh, so the loan costs about Rs 89,000 in interest before any processing fee.",
    tip: "Run the same loan at a rate 1% higher than your quote. If that EMI would strain your budget, borrow less or keep a larger cash buffer.",
    guide: { label: "Loan and EMI planning guide", href: "/guides/loan" },
  },
  "home-loan": {
    answers: "How much EMI a home loan needs, how much total interest a 20 or 25 year tenure adds, and whether the loan fits your monthly budget.",
    example: "A Rs 50 lakh home loan at 8.5% for 20 years has an EMI of about Rs 43,390 and total interest of roughly Rs 54 lakh. Stretching it to 25 years lowers the EMI to about Rs 40,260, but total interest rises to roughly Rs 71 lakh.",
    tip: "A tenure extension that saves Rs 3,000 a month can cost more than Rs 16 lakh over the loan life. Compare total interest, not only the EMI.",
    guide: { label: "Home loan and mortgage guide", href: "/guides/mortgage" },
  },
  mortgage: {
    answers: "How a mortgage payment splits between principal and interest over time, and how the loan amount, rate and term change the full amortization schedule.",
    example: "On a 500,000 mortgage with a 100,000 down payment, the financed principal is 400,000. The calculator combines principal and interest with any optional annual property tax, insurance, and monthly mortgage-insurance amount you enter.",
    tip: "Because early payments are mostly interest, part-prepayments in the first few years usually save far more than the same prepayment made late in the loan.",
    guide: { label: "Mortgage planning guide", href: "/guides/mortgage" },
  },
  "personal-loan": {
    answers: "The real monthly cost of an unsecured personal loan, including the effect of higher interest rates and short tenures.",
    example: "Rs 3 lakh at 14% for 3 years gives an EMI of about Rs 10,250 and total interest of roughly Rs 69,000. A 2% processing fee adds another Rs 6,000, which raises the effective cost of the loan.",
    tip: "Personal loans are expensive. Use them for genuine needs, and compare the EMI against your emergency fund and existing loan commitments first.",
    guide: { label: "EMI guide", href: "/guides/emi" },
  },
  "car-loan": {
    answers: "The EMI and total interest for a car loan, and how the down payment and tenure change what the car really costs you.",
    example: "Financing Rs 8 lakh at 9% for 5 years costs about Rs 16,610 a month and roughly Rs 1.96 lakh in interest. Over 7 years the EMI drops to about Rs 12,870, but interest rises to roughly Rs 2.81 lakh on a car that is losing value.",
    tip: "A larger down payment and a shorter tenure keep the loan balance closer to the resale value of the vehicle.",
    guide: { label: "Loan and EMI planning guide", href: "/guides/loan" },
  },
  "business-loan": {
    answers: "Whether a business loan EMI can be serviced from monthly operating cash flow, and what the loan adds to fixed costs.",
    example: "If a business earns Rs 1.5 lakh a month in operating cash flow before debt, an EMI of Rs 60,000 leaves a coverage ratio of 2.5. An EMI of Rs 1.3 lakh would leave almost no room for a slow month.",
    tip: "Lenders often look for a debt service coverage ratio above about 1.25. Test your EMI against a weak month, not your best month.",
  },
  "education-loan": {
    answers: "How much an education loan grows during the course and moratorium period, and what EMI will start after graduation.",
    example: "On a Rs 10 lakh loan at 10%, roughly Rs 1 lakh of simple interest can build up each year of study and moratorium if it is not paid. Over a 4-year course plus 1 year of moratorium, that is close to Rs 5 lakh added before the first EMI.",
    tip: "Paying just the interest during the course keeps the balance from growing. Interest paid on education loans may qualify for deduction under Section 80E in the old tax regime.",
  },
  "advanced-emi": {
    answers: "How part-prepayments, rate changes and extra payments change a loan's EMI, tenure and total interest, compared with a plain schedule.",
    example: "On a long home loan, one extra payment each year in the early years can remove several years from the tenure. The amortization table shows exactly which month the loan closes with and without prepayments.",
    tip: "When you prepay, most banks let you choose between a lower EMI and a shorter tenure. Shortening the tenure usually saves more interest.",
    guide: { label: "EMI guide", href: "/guides/emi" },
  },
  "balloon-loan": {
    answers: "How much a balloon structure lowers regular payments, and how large the final lump-sum payment will be.",
    example: "Leaving 30% of a vehicle or equipment loan as a balloon payment can noticeably reduce monthly instalments. The trade-off is a large amount due at the end, and interest keeps accruing on that unpaid portion for the whole term.",
    tip: "Only choose a balloon loan if you have a realistic plan for the final payment, such as a maturing investment or a confirmed resale value.",
  },
  "debt-payoff": {
    answers: "How long it will take to clear several debts, and whether paying the highest-rate debt first or the smallest balance first saves more.",
    example: "With a credit card balance at 36% and a personal loan at 14%, putting every extra rupee toward the card first (the avalanche method) almost always reduces total interest more than paying both evenly.",
    tip: "The avalanche method saves the most money. The snowball method (smallest balance first) can work better if early wins help you stay consistent.",
  },
  "compound-interest": {
    answers: "How much an amount grows when interest is earned on past interest, and how compounding frequency and time change the result.",
    example: "Rs 1 lakh at 8% for 20 years grows to about Rs 4.66 lakh with annual compounding and about Rs 4.93 lakh with monthly compounding. The same money at 8% simple interest would reach only Rs 2.6 lakh.",
    tip: "Time matters more than small rate differences. Starting 5 years earlier often beats finding a slightly higher return later.",
    guide: { label: "Investment planning guide", href: "/guides/investment" },
  },
  "simple-interest": {
    answers: "Interest on a principal amount where interest is not added back to the balance, such as some short-term loans and deposits.",
    example: "Rs 1 lakh at 8% simple interest for 5 years earns Rs 40,000. The same amount compounded annually would earn about Rs 46,930, so the difference grows with time.",
    tip: "Simple interest is easy to verify by hand: principal x rate x years / 100. Use it to sanity-check quotes that claim to be simple interest.",
  },
  sip: {
    answers: "How much a fixed monthly SIP could grow to at an assumed return, and how much of the final value comes from your own contributions.",
    example: "Rs 5,000 a month for 10 years at an assumed 12% annual return could grow to about Rs 11.6 lakh. Only Rs 6 lakh of that is money you invested; the rest comes from compounding.",
    tip: "Market returns are not fixed. Try 8%, 10% and 12% to see a range, and review the plan once a year instead of reacting to monthly market moves.",
    guide: { label: "SIP guide", href: "/guides/sip" },
  },
  lumpsum: {
    answers: "What a one-time investment could be worth after a number of years at an assumed rate of return.",
    example: "Rs 1 lakh invested once at an assumed 12% annual return could grow to about Rs 3.1 lakh in 10 years. Investing the same Rs 1 lakh as a monthly SIP over the period would end with less, because the money is invested gradually.",
    tip: "A lump sum is fully exposed to market timing on day one. If that worries you, spreading it over a few months is a reasonable compromise.",
    guide: { label: "Mutual funds guide", href: "/guides/mutual-funds" },
  },
  "mutual-fund": {
    answers: "Projected mutual fund value for SIP or lump-sum investing, and how costs such as expense ratios reduce long-term returns.",
    example: "Rs 10 lakh growing at 12% for 20 years reaches about Rs 96 lakh. If costs reduce the net return to 11%, the same money reaches only about Rs 81 lakh, a gap of roughly Rs 16 lakh.",
    tip: "Small annual costs compound just like returns. Compare direct and regular plans, and check the expense ratio before investing.",
    guide: { label: "Mutual funds guide", href: "/guides/mutual-funds" },
  },
  swp: {
    answers: "How long a corpus lasts when you withdraw a fixed amount every month while the rest stays invested.",
    example: "Withdrawing Rs 30,000 a month from Rs 50 lakh is a 7.2% annual withdrawal rate. If the corpus earns less than that on average, the balance slowly falls; if it earns more, the corpus can last much longer.",
    tip: "Keep one to two years of withdrawals in low-risk funds so you are not forced to sell equity during a market fall.",
    guide: { label: "Retirement planning guide", href: "/guides/retirement" },
  },
  "dividend-yield": {
    answers: "The income return a stock pays through dividends relative to its current share price.",
    example: "A share priced at Rs 2,000 that pays Rs 40 a year in dividends has a dividend yield of 2%. If the price falls to Rs 1,600 with the same dividend, the yield rises to 2.5%.",
    tip: "A very high yield can be a warning sign that the price fell because the dividend may be cut. Check whether earnings actually cover the payout.",
  },
  roi: {
    answers: "The total percentage return on an investment and the annualized return (CAGR) that makes investments of different lengths comparable.",
    example: "If Rs 2 lakh becomes Rs 3 lakh in 4 years, the total return is 50%, but the annualized return is only about 10.7% a year.",
    tip: "Always compare investments on annualized return. A 50% return over 4 years and a 50% return over 8 years are very different results.",
  },
  gold: {
    answers: "What a gold holding could be worth under different price growth assumptions, and how gold fits alongside equity and debt.",
    example: "Rs 1 lakh in gold growing at an assumed 8% a year would be worth about Rs 2.16 lakh after 10 years. Physical gold returns are further reduced by making charges and the buy-sell spread.",
    tip: "Use gold as a diversifier, commonly a small share of a portfolio, rather than as the main long-term wealth builder.",
    guide: { label: "Gold investment guide", href: "/guides/gold-investment" },
  },
  investment: {
    answers: "The future value of a starting amount plus regular contributions, so you can compare savings rates and time horizons.",
    example: "Starting with Rs 1 lakh and adding Rs 10,000 a month at an assumed 10% return builds a much larger corpus over 15 years than over 10 years, because the later years carry the largest compounding gains.",
    tip: "Adjust the final value for inflation to see what it may be worth in today's money before deciding whether it meets your goal.",
    guide: { label: "Investment planning guide", href: "/guides/investment" },
  },
  epf: {
    answers: "How your Employees' Provident Fund balance may grow from employee and employer contributions over your working years.",
    example: "Employees usually contribute 12% of basic pay plus dearness allowance. The employer also contributes 12%, but up to 8.33% of that (capped on a wage of Rs 15,000) goes to the pension scheme, so less reaches the EPF account.",
    tip: "The interest rate is declared by EPFO each year, so update the rate in the calculator whenever a new rate is announced.",
  },
  ppf: {
    answers: "The maturity value of Public Provident Fund deposits over the 15-year lock-in, with yearly contributions and the current rate.",
    example: "Depositing the maximum Rs 1.5 lakh every year for 15 years at 7.1% results in a maturity value of roughly Rs 40.7 lakh, of which Rs 22.5 lakh is your own contribution.",
    tip: "Depositing before the 5th of the month earns interest for that month, so an early deposit each April gives the full year's interest.",
    guide: { label: "PPF guide", href: "/guides/ppf" },
  },
  fd: {
    answers: "The maturity amount and interest earned on a fixed deposit for a given rate, tenure and compounding frequency.",
    example: "Rs 1 lakh in an FD at 7% for 5 years grows to about Rs 1.41 lakh with quarterly compounding, slightly more than the roughly Rs 1.40 lakh from annual compounding.",
    tip: "FD interest is taxed at your income slab rate. Compare post-tax returns when choosing between deposits and other safe options.",
    guide: { label: "FD and RD guide", href: "/guides/fd-rd" },
  },
  rd: {
    answers: "What a recurring deposit will be worth at maturity when you save a fixed amount every month.",
    example: "Saving Rs 5,000 a month in an RD at 7% for 5 years puts in Rs 3 lakh and returns roughly Rs 3.6 lakh at maturity.",
    tip: "RDs suit short, fixed goals such as a planned purchase within 1 to 3 years, where you want a known amount on a known date.",
    guide: { label: "FD and RD guide", href: "/guides/fd-rd" },
  },
  savings: {
    answers: "How long it takes to reach a savings target, or how much to save each month to reach it by a specific date.",
    example: "To save Rs 3 lakh in 2 years for a planned expense, you need to put aside about Rs 12,500 a month, slightly less if the money earns interest in the meantime.",
    tip: "Automate the transfer on salary day so saving happens before discretionary spending.",
    guide: { label: "Budgeting guide", href: "/guides/budget" },
  },
  gst: {
    answers: "How much GST to add to a price, or how much GST is already included in a GST-inclusive price.",
    example: "Adding 18% GST to Rs 10,000 gives Rs 11,800. If Rs 10,000 is the GST-inclusive price, the GST component is about Rs 1,525 and the base price is about Rs 8,475.",
    tip: "Within a state, GST is split equally into CGST and SGST. For inter-state supplies, the full rate is charged as IGST.",
  },
  hra: {
    answers: "How much of your House Rent Allowance is exempt from tax under the old tax regime, based on salary, rent and city.",
    example: "With basic pay of Rs 50,000 a month, HRA of Rs 20,000 and rent of Rs 25,000 in a metro city, the exemption is the lowest of actual HRA (Rs 20,000), rent minus 10% of basic (Rs 20,000) and 50% of basic (Rs 25,000), which is Rs 20,000 a month.",
    tip: "HRA exemption is not available in the new tax regime. Compare both regimes before submitting your investment declaration.",
    guide: { label: "Salary guide", href: "/guides/salary" },
  },
  "income-tax": {
    answers: "Your estimated income tax under the old and new regimes, so you can see which regime leaves you with more take-home income.",
    example: "Under the new regime announced in Budget 2025, a salaried person with income up to about Rs 12.75 lakh (after the Rs 75,000 standard deduction) can pay zero tax because of the Section 87A rebate. Someone with large HRA, 80C and home loan deductions may still do better under the old regime.",
    tip: "Tax rules change with each Union Budget. Check the financial year shown in the calculator and confirm with Form 16 or AIS before filing.",
    guide: { label: "Income tax guide", href: "/guides/income-tax" },
  },
  tax: {
    answers: "A quick estimate of tax liability on your income so you can plan advance tax, investments and cash flow.",
    example: "If your employer deducts TDS on salary but you also earn FD interest or freelance income, this estimate shows whether extra tax may be due so you are not surprised at filing time.",
    tip: "If your total tax due after TDS is Rs 10,000 or more, advance tax instalments may apply during the year.",
    guide: { label: "Income tax guide", href: "/guides/income-tax" },
  },
  "tax-planning": {
    answers: "How much tax you can save with eligible deductions such as Section 80C and 80D, and whether they make the old regime worthwhile.",
    example: "Using the full Rs 1.5 lakh Section 80C limit saves up to Rs 46,800 in tax for someone in the 30% bracket under the old regime, including cess. The same investment gives no deduction under the new regime.",
    tip: "Choose tax-saving products for their own merit first. A deduction does not make an unsuitable product a good investment.",
    guide: { label: "Income tax guide", href: "/guides/income-tax" },
  },
  budget: {
    answers: "Where your monthly income is going, and how much is left for savings after needs and wants.",
    example: "With Rs 80,000 of monthly take-home pay, the 50/30/20 rule suggests about Rs 40,000 for needs, Rs 24,000 for wants and Rs 16,000 for savings and debt repayment.",
    tip: "Treat 50/30/20 as a starting point. High-rent cities or families with dependents often need a different split.",
    guide: { label: "Budgeting guide", href: "/guides/budget" },
  },
  "break-even": {
    answers: "How many units a business must sell, or how much revenue it needs, to cover fixed and variable costs.",
    example: "With fixed costs of Rs 2 lakh a month, a selling price of Rs 500 and variable cost of Rs 300 per unit, each sale contributes Rs 200. The business breaks even at 1,000 units a month.",
    tip: "Recalculate after any price change. A small discount can raise the break-even volume much more than expected.",
  },
  "education-goal": {
    answers: "What your child's education may cost in the future after inflation, and how much to invest each month to fund it.",
    example: "A course that costs Rs 20 lakh today could cost about Rs 63 lakh in 15 years if education costs rise 8% a year.",
    tip: "Education inflation is often higher than general inflation. Move the money to safer options as the admission year gets close.",
  },
  "emergency-fund": {
    answers: "How large your emergency fund should be based on essential monthly expenses, dependents and income stability.",
    example: "If your essential expenses are Rs 50,000 a month, a six-month emergency fund would be Rs 3 lakh. Single-income families or people with variable income may prefer nine to twelve months.",
    tip: "Keep the fund in liquid, low-risk options you can access within a day or two, separate from your everyday account.",
    guide: { label: "Emergency fund guide", href: "/guides/emergency-fund" },
  },
  "financial-health": {
    answers: "How healthy your finances are across savings rate, debt load, emergency fund and insurance cover, and which area to fix first.",
    example: "Someone saving 20% of income but spending 50% on EMIs with no emergency fund has a very different risk profile from someone saving 10% with no debt and six months of expenses set aside.",
    tip: "A common guideline is to keep total EMIs below about 40% of take-home pay. Fix the weakest area first rather than optimizing the strongest.",
    guide: { label: "Budgeting guide", href: "/guides/budget" },
  },
  "goal-planning": {
    answers: "How much to invest each month to reach a specific money goal by a target date at an assumed return.",
    example: "To build Rs 10 lakh in 5 years at an assumed 10% annual return, you would need to invest about Rs 12,800 a month.",
    tip: "Give each goal its own timeline and risk level. Goals under 3 years away usually belong in lower-risk options.",
    guide: { label: "Investment planning guide", href: "/guides/investment" },
  },
  insurance: {
    answers: "How much life cover your family may need, based on income, liabilities, goals and existing savings.",
    example: "A common rule of thumb is term cover of 10 to 15 times annual income. With Rs 12 lakh a year of income, that suggests Rs 1.2 to 1.8 crore, adjusted up for outstanding loans and down for existing assets.",
    tip: "Pure term insurance is usually the most cost-effective way to buy life cover. Keep insurance and investment decisions separate.",
    guide: { label: "Insurance guide", href: "/guides/insurance" },
  },
  retirement: {
    answers: "How large a retirement corpus you need to cover future expenses after inflation, and how much to save each month to get there.",
    example: "Monthly expenses of Rs 50,000 today would become about Rs 2.15 lakh a month in 25 years at 6% inflation. The corpus must support that level of spending for 25 to 30 years of retirement.",
    tip: "Start with essential expenses, then add travel and healthcare separately. Healthcare costs often rise faster than general inflation.",
    guide: { label: "Retirement planning guide", href: "/guides/retirement" },
  },
  salary: {
    answers: "How your cost to company (CTC) translates into monthly in-hand salary after PF, professional tax, income tax and other deductions.",
    example: "CTC often includes employer PF, gratuity, insurance and variable pay that you do not receive monthly. As a result, monthly in-hand salary is usually noticeably lower than CTC divided by 12.",
    tip: "When comparing job offers, compare fixed monthly in-hand pay and guaranteed components, not just headline CTC.",
    guide: { label: "Salary guide", href: "/guides/salary" },
  },
};
