export default function MortgageGuide() {
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">How to Use the Mortgage Calculator</h1>
      <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700">
        <li>Enter your desired loan amount (the amount you plan to borrow for your home).</li>
        <li>Input the annual interest rate offered by your lender.</li>
        <li>Set the loan term in years (e.g., 30 for a 30-year mortgage).</li>
        <li>The calculator will instantly show your estimated monthly payment.</li>
      </ol>
      <p className="mb-2 text-gray-600">Use this tool to compare different loan scenarios, interest rates, and terms. The result is an estimate; actual payments may vary based on taxes, insurance, and lender fees.</p>
      <p className="text-sm text-blue-600">Tip: Use the calculator regularly to track how rate changes affect your payment.</p>
    </section>
  );
} 