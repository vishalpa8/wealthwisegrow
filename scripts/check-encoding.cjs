#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
}

try {
  const filesBuf = run('git ls-files -z');
  const files = filesBuf ? filesBuf.split('\0').filter(Boolean) : [];
  const bad = [];

  files.forEach(f => {
    try {
      const enc = run(`file -b --mime-encoding "${f.replace(/"/g, '\\"')}"`);
      const mime = run(`file -b --mime "${f.replace(/"/g, '\\"')}"`);
      if (!/^utf-?8$/i.test(enc) && !/^us-?ascii$/i.test(enc) && !/binary/i.test(mime)) {
        bad.push({ f, enc, mime });
      }
    } catch (e) {
      // ignore individual file errors
    }
  });

  if (bad.length) {
    console.error('Non-UTF-8 text files found:');
    bad.forEach(b => console.error(`${b.f}: encoding=${b.enc} mime=${b.mime}`));
    process.exit(1);
  }
  console.log('All tracked text files are UTF-8 or binary.');
} catch (err) {
  console.error('Encoding check failed:', err.message);
  process.exit(2);
}
