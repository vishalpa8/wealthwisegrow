const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const componentsDir = path.join(srcDir, 'components');

const directoriesToCreate = ['atoms', 'molecules', 'organisms', 'templates'];

directoriesToCreate.forEach(dir => {
  const dirPath = path.join(componentsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Mapping of Old Path (relative to components) -> New Path (relative to components)
const moveMap = {
  // Atoms
  'ui/button.tsx': 'atoms/button.tsx',
  'ui/badge.tsx': 'atoms/badge.tsx',
  'ui/numeric-input.tsx': 'atoms/numeric-input.tsx',
  'ui/select.tsx': 'atoms/select.tsx',
  'ui/loading-spinner.tsx': 'atoms/loading-spinner.tsx',
  'ui/ads-placeholder.tsx': 'atoms/ads-placeholder.tsx',
  'ui/footer-year.tsx': 'atoms/footer-year.tsx',
  
  // Molecules
  'ui/currency-selector.tsx': 'molecules/currency-selector.tsx',
  'ui/share-button.tsx': 'molecules/share-button.tsx',
  'ui/tabs.tsx': 'molecules/tabs.tsx',
  'ui/card.tsx': 'molecules/card.tsx',
  'ui/related-calculators.tsx': 'molecules/related-calculators.tsx',
  'ui/enhanced-charts.tsx': 'molecules/enhanced-charts.tsx',
  'ui/goal-progress-chart.tsx': 'molecules/goal-progress-chart.tsx',
  'ui/adsense-wrapper.tsx': 'molecules/adsense-wrapper.tsx',
  'ui/adsense.tsx': 'molecules/adsense.tsx',
  
  // Organisms
  'ui/enhanced-calculator-form.tsx': 'organisms/enhanced-calculator-form.tsx',
  'ui/calculator-explorer.tsx': 'organisms/calculator-explorer.tsx',
  'layout/header.tsx': 'organisms/header.tsx',
  'layout/footer.tsx': 'organisms/footer.tsx',
  'layout/sidebar.tsx': 'organisms/sidebar.tsx',
  
  // Templates
  'layout/calculator-layout.tsx': 'templates/calculator-layout.tsx',
};

// 1. Move files
console.log('Moving files...');
for (const [oldPath, newPath] of Object.entries(moveMap)) {
  const oldFullPath = path.join(componentsDir, oldPath);
  const newFullPath = path.join(componentsDir, newPath);
  
  if (fs.existsSync(oldFullPath)) {
    fs.renameSync(oldFullPath, newFullPath);
    console.log(`Moved ${oldPath} -> ${newPath}`);
  } else {
    console.warn(`Warning: File not found ${oldFullPath}`);
  }
}

// 2. Update imports across the whole src directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

console.log('Updating import paths...');
const allFiles = getAllFiles(srcDir);
let updatedFilesCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  for (const [oldPath, newPath] of Object.entries(moveMap)) {
    // We strip the .tsx extension for the import path
    const oldImport = oldPath.replace(/\.tsx?$/, '');
    const newImport = newPath.replace(/\.tsx?$/, '');
    
    // Replace `@/components/oldPath` with `@/components/newPath`
    const regex1 = new RegExp(`@/components/${oldImport}(['"])`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `@/components/${newImport}$1`);
      hasChanges = true;
    }

    // Replace relative paths if any (e.g. `../ui/button`)
    // This is trickier but assuming most use the alias `@/components/`
    // Next.js standard is to use aliases, so we rely on `@/components/`
  }
  
  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFilesCount++;
  }
});

console.log(`Updated imports in ${updatedFilesCount} files.`);
console.log('Atomic design migration script completed.');
