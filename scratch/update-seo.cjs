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

// Fallbacks
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

let updatedFiles = 0;

for (const dir of dirs) {
  if (dir === '[type]') continue;
  if (!titles[dir]) continue;
  
  const newTitle = titles[dir];
  
  const processFile = (filePath) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Pattern 1: generateCalculatorMetadata("slug", "Title", ...)
      let updatedContent = content.replace(/(generateCalculatorMetadata\(\s*(?:"|')[^"']+(?:"|')\s*,\s*")([^"]+)(")/, `$1${newTitle}$3`);
      
      // Pattern 2: Component props with generous wildcard to handle type params like <BaseCalculatorTemplate<Inputs>
      updatedContent = updatedContent.replace(/(<(?:BaseCalculatorTemplate|CalculatorLayout|EnhancedCalculatorForm)[\s\S]*?title=")([^"]+)(")/, `$1${newTitle}$3`);

      if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Updated ${path.basename(filePath)} for ${dir}`);
        return true;
      }
    }
    return false;
  };

  const updatedPage = processFile(path.join(calculatorsDir, dir, 'page.tsx'));
  const updatedContent = processFile(path.join(calculatorsDir, dir, 'page-content.tsx'));
  
  if (updatedPage || updatedContent) {
    updatedFiles++;
  }
}

console.log(`Done updating ${updatedFiles} files.`);
