const fs = require('fs');
const path = require('path');
const base = __dirname;

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchFiles(full);
    } else if (f.endsWith('.js') && !f.includes('find_nav.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes("'employees'") || line.includes('"employees"') || line.includes("'user_management'") || line.includes('"user_management"')) {
          console.log(`${path.relative(base, full)}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
searchFiles(base);
