const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app');
let clientPages = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('"use client"') || content.includes("'use client'")) {
    clientPages.push(file);
  }
}

console.log(clientPages.join('\n'));
