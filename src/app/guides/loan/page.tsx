export default function LoanGuide() {
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">How to Use the Loan Calculator</h1>
      <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700">
        <li>Enter your loan amount (the amount you wish to borrow).</li>
        <li>Input the annual interest rate for your loan.</li>
        <li>Set the loan term in years.</li>
        <li>The calculator will display your estimated monthly payment instantly.</li>
      </ol>
      <p className="mb-2 text-gray-600">This tool helps you compare loan offers and understand your monthly obligations. Actual payments may vary based on lender fees and other costs.</p>
      <p className="text-sm text-blue-600">Tip: Try different terms and rates to find the best fit for your budget.</p>
    </section>
  );
} 