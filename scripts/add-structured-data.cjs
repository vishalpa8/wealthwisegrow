const fs = require('fs');
const path = require('path');

const calculatorsDir = path.join(__dirname, '../src/app/calculators');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Check if it's already added
      if (content.includes('calculatorStructuredData')) {
        continue;
      }

      // 1. Add import for calculatorStructuredData
      if (content.includes('import { breadcrumbStructuredData')) {
        content = content.replace(
          /import { breadcrumbStructuredData(?:, faqStructuredData)? } from "@\/lib\/seo\/structured-data";/,
          'import { breadcrumbStructuredData, faqStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";'
        );
      } else if (content.includes('import { breadcrumbStructuredData }')) {
        content = content.replace(
          /import { breadcrumbStructuredData } from "@\/lib\/seo\/structured-data";/,
          'import { breadcrumbStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";'
        );
      } else if (content.includes('import { faqStructuredData }')) {
         content = content.replace(
          /import { faqStructuredData } from "@\/lib\/seo\/structured-data";/,
          'import { faqStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";'
        );
      }

      // 2. Extract title and description from generateCalculatorMetadata
      const metadataMatch = content.match(/generateCalculatorMetadata\(\s*"[^"]*",\s*"([^"]+)",\s*"([^"]+)"\s*\)/);
      if (metadataMatch) {
        const title = metadataMatch[1];
        const description = metadataMatch[2];
        const slugMatch = fullPath.match(/calculators[\\/]([^\\/]+)[\\/]page\.tsx$/);
        const slug = slugMatch ? slugMatch[1] : '';

        // 3. Inject the variable declaration
        const variableDecl = `\nconst softwareApp = calculatorStructuredData(\n  "${title}",\n  "${description}",\n  "https://wealthwisegrow.com/calculators/${slug}"\n);\n`;
        
        // Find where to insert it (before export default function)
        content = content.replace(/export default function/, variableDecl + '\nexport default function');

        // 4. Inject the script tag
        const scriptTag = `\n      <script\n        type="application/ld+json"\n        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}\n      />`;
        
        // Find <></> or <div> and insert after the first tag
        content = content.replace(/(return\s*\(\s*(?:<>|<div[^>]*>))/, '$1' + scriptTag);

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(calculatorsDir);
console.log('Done.');
