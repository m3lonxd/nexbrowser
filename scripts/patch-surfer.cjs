// NexBrowser ships with --disable-updater, so the build never produces the
// host `mar` tool and there is no update server to publish MAR files to.
// Surfer's `package` still insists on building output.mar and the AUS update
// manifests, which fails the job after the installer/dmg/tarball is already
// written. This drops that step. Runs on `npm ci` via postinstall; idempotent.
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'node_modules', '@zen-browser', 'surfer', 'dist', 'commands', 'package.js');
if (!fs.existsSync(file)) process.exit(0);

const MARKER = '/* nexbrowser: mar skipped */';
const src = fs.readFileSync(file, 'utf8');
if (src.includes(MARKER)) process.exit(0);

const target = /const marPath = await createMarFile\([^;]*\);\s*utils_1\.dynamicConfig\.set\('marPath', marPath\);\s*await \(0, browser_1\.generateBrowserUpdateFiles\)\(\);/;
if (!target.test(src)) {
  console.error('patch-surfer: MAR step not found in surfer package.js; surfer changed, update scripts/patch-surfer.cjs');
  process.exit(1);
}
fs.writeFileSync(file, src.replace(target, MARKER));
console.log('patch-surfer: MAR/update-manifest step removed');
