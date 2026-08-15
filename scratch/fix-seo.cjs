const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/calculators');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.match(/const seoContent = \([\s\n]*title=/)) {
        content = content.replace(/const seoContent = \([\s\n]*title=/, 'const seoContent = (\n      <SEOContent title=');
        if (!content.includes('import { SEOContent }')) {
            content = content.replace('"use client";', '"use client";\nimport { SEOContent } from "@/components/molecules/seo-content";');
        }
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
