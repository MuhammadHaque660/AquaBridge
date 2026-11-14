// Builds the whole Vercel site into dist/:
//   /             team hub (index.html)
//   /prototype/   the React app (app/), built with base /prototype/
//   /backlog/     Sprint 1 backlog page
//   /static-prototype/  the original single-file prototype, kept for comparison
// Run: node tools/build-site.js   (Vercel runs this; see vercel.json)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);

execSync('npm run build', {
  cwd: path.join(root, 'app'),
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE: '/prototype/', VITE_OUT_DIR: path.join(dist, 'prototype') },
});

for (const item of ['index.html', 'backlog', 'static-prototype', 'docs/assets']) {
  fs.cpSync(path.join(root, item), path.join(dist, item), { recursive: true });
}
console.log('Site built in dist/');
