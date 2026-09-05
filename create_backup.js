const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, 'backups', `snapshot_${timestamp}`);

fs.mkdirSync(backupDir, { recursive: true });

const items = ['js', 'css', 'index.html', 'manifest.json', 'sw.js', 'server.js'];
for (const item of items) {
  const src = path.join(__dirname, item);
  const dest = path.join(backupDir, item);
  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
      copyFolderSync(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log('✅ Full Project Snapshot Created at:', backupDir);
