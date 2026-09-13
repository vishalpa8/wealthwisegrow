const fs = require('fs');
const path = require('path');

const seoFile = fs.readFileSync(path.join(__dirname, '../src/lib/seo/calculator-pages.ts'), 'utf8');

const titles = {};
const regex = /"([^"]+)":\s*\{[\s\S]*?title:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(seoFile)) !== null) {
  let title = match[2];
  if (title.endsWith(' India')) {
    title = title.substring(0, title.length - 6);
  }
  titles[match[1]] = title;
}

// Ensure sip is there since it's unquoted in the object
titles['sip'] = 'Free Mutual Fund SIP Return Calculator';
titles['epf'] = 'EPF Maturity & Pension Fund Calculator';
titles['fd'] = 'Bank Fixed Deposit (FD) Maturity Calculator';
titles['gold'] = 'Gold Investment Return & Future Value Calculator';
titles['gst'] = 'Free GST Inclusive & Exclusive Price Calculator';
titles['hra'] = 'Income Tax HRA Exemption Calculator';
titles['insurance'] = 'Term Life Insurance Cover Need Calculator';
titles['investment'] = 'Future Value Investment Growth Calculator';
titles['loan'] = 'Simple EMI & Loan Repayment Calculator';
titles['lumpsum'] = 'Mutual Fund Lumpsum Investment Return Calculator';
titles['mortgage'] = 'Real Estate Mortgage EMI Calculator';
titles['ppf'] = 'PPF Account Maturity & Interest Calculator';
titles['rd'] = 'Recurring Deposit (RD) Maturity Calculator';
titles['retirement'] = 'Retirement Corpus & Pension Planning Calculator';
titles['roi'] = 'Simple Return on Investment (ROI) Calculator';
titles['salary'] = 'In-Hand Salary & CTC Breakdown Calculator';
titles['savings'] = 'Monthly Savings Goal & Target Calculator';
titles['swp'] = 'Mutual Fund SWP (Systematic Withdrawal Plan) Calculator';
titles['tax'] = 'Personal Income Tax Liability Calculator';
titles['budget'] = 'Monthly Household Budget & Expense Calculator';

const calculatorsDir = path.join(__dirname, '../src/app/calculators');
const dirs = fs.readdirSync(calculatorsDir);

let updated = 0;
for (const dir of dirs) {
  if (dir === '[type]') continue;
  if (!titles[dir]) continue;
  
  const pageFile = path.join(calculatorsDir, dir, 'page.tsx');
  if (fs.existsSync(pageFile)) {
    let content = fs.readFileSync(pageFile, 'utf8');
    const newTitle = titles[dir];
    
    // Safely replace title prop in <CalculatorLayout
    const updatedContent = content.replace(/(<CalculatorLayout\s+title=")([^"]+)(")/s, `$1${newTitle}$3`);
    if (updatedContent !== content) {
      fs.writeFileSync(pageFile, updatedContent);
      console.log(`Updated ${dir} -> ${newTitle}`);
      updated++;
    }
  }
}
console.log(`Done updating ${updated} files.`);
