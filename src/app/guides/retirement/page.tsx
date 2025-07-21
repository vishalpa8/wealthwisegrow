export default function RetirementGuide() {
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">How to Use the Retirement Calculator</h1>
      <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700">
        <li>Enter your current age and planned retirement age.</li>
        <li>Input your current savings and monthly contribution.</li>
        <li>Set the expected annual return rate.</li>
        <li>The calculator will estimate your total savings at retirement.</li>
      </ol>
      <p className="mb-2 text-gray-600">This tool helps you plan for retirement by projecting your savings growth. Adjust your contributions and see how it impacts your future nest egg.</p>
      <p className="text-sm text-blue-600">Tip: Start early and contribute regularly for the best results.</p>
    </section>
  );
} 