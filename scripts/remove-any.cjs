const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content
        .replace(/:\s*any\s*=/g, ': unknown =')
        .replace(/:\s*any\s*>/g, ': unknown>')
        .replace(/:\s*any\s*\)/g, ': unknown)')
        .replace(/<\s*any\s*>/g, '<unknown>')
        .replace(/Record<string,\s*any>/g, 'Record<string, unknown>')
        .replace(/Record<any,\s*any>/g, 'Record<string, unknown>')
        .replace(/:\s*any\s*,/g, ': unknown,')
        .replace(/:\s*any\s*;/g, ': unknown;')
        .replace(/:\s*any\s*}/g, ': unknown}')
        .replace(/\(error:\s*any\)/g, '(error: unknown)')
        .replace(/\(e:\s*any\)/g, '(e: unknown)')
        .replace(/as\s+any/g, 'as unknown')
        .replace(/prev:\s*any/g, 'prev: unknown')
        .replace(/values:\s*any/g, 'values: Record<string, unknown>');
        
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../src'));
console.log('Done removing any.');
