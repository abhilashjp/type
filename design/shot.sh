#!/usr/bin/env bash
# Screenshot every experiment (or one, if given) at 1440x900 and full height.
# Usage: design/shot.sh [experiment-dir ...]
set -euo pipefail
cd "$(dirname "$0")/.."
targets=("$@")
if [ ${#targets[@]} -eq 0 ]; then targets=(design/experiments/*/); fi

node - "${targets[@]}" <<'EOF'
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dirs = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const d of dirs) {
    const dir = path.resolve(d);
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, 'fold.png') });
    await page.screenshot({ path: path.join(dir, 'full.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(dir, 'mobile.png'), fullPage: true });
    await page.close();
    console.log('shot', path.basename(dir));
  }
  await browser.close();
})();
EOF
