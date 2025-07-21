export default function InvestmentGuide() {
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">How to Use the Investment Calculator</h1>
      <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700">
        <li>Enter your initial investment amount.</li>
        <li>Input your planned monthly contribution.</li>
        <li>Set the expected annual return rate (average market returns are 6-8%).</li>
        <li>Choose the number of years you plan to invest.</li>
        <li>The calculator will show your projected future value instantly.</li>
      </ol>
      <p className="mb-2 text-gray-600">Use this tool to plan for long-term goals and see how regular contributions grow over time. Results are estimates and do not guarantee future performance.</p>
      <p className="text-sm text-blue-600">Tip: Increase your monthly contribution to see the power of compounding!</p>
    </section>
  );
} 