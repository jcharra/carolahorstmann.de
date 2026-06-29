const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

async function processDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const promises = [];
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      promises.push(processDir(srcPath, destPath));
    } else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(srcPath, 'utf8');
      promises.push(
        posthtml([]).process(html).then(result => {
          fs.writeFileSync(destPath, result.html);
        })
      );
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  await Promise.all(promises);
}

async function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  await processDir(SRC, DIST);
  console.log('Build complete: src → dist');
}

if (process.argv.includes('--watch')) {
  build().then(() => {
    let debounce;
    fs.watch(SRC, { recursive: true }, () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        build().catch(console.error);
      }, 100);
    });
    console.log('Watching src for changes…');
  }).catch(err => { console.error(err); process.exit(1); });
} else {
  build().catch(err => { console.error(err); process.exit(1); });
}
