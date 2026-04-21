#!/usr/bin/env bash
set -euo pipefail

# pack-smoke.sh — builds + packs each publishable package, installs the tarballs
# into a scratch copy of each example, and runs deterministic fixture assertions
# with zero external network calls.

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SCRATCH=$(mktemp -d -t agent-ready-web-smoke-XXXX)
cleanup() { rm -rf "$SCRATCH"; }
trap cleanup EXIT

echo "==> Building all packages"
pnpm -r --filter "./packages/*" run build

echo "==> Packing all packages"
cd "$ROOT/packages/core" && pnpm pack --pack-destination "$SCRATCH"
cd "$ROOT/packages/next" && pnpm pack --pack-destination "$SCRATCH"
cd "$ROOT/packages/cloudflare" && pnpm pack --pack-destination "$SCRATCH"

CORE_TGZ=$(ls "$SCRATCH"/agent-ready-web-*.tgz | head -1)
NEXT_TGZ=$(ls "$SCRATCH"/agent-ready-web-next-*.tgz | head -1)
CF_TGZ=$(ls "$SCRATCH"/agent-ready-web-cloudflare-*.tgz | head -1)

echo "CORE_TGZ=$CORE_TGZ"
echo "NEXT_TGZ=$NEXT_TGZ"
echo "CF_TGZ=$CF_TGZ"

echo "==> Installing tarballs into examples/nextjs"
EX_NEXT="$SCRATCH/nextjs"
cp -R "$ROOT/examples/nextjs" "$EX_NEXT"
cd "$EX_NEXT"
rm -rf node_modules .next
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.dependencies['agent-ready-web'] = 'file:$CORE_TGZ';
  pkg.dependencies['@agent-ready-web/next'] = 'file:$NEXT_TGZ';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
npm install --no-audit --no-fund --ignore-scripts
npm run build
npm run test

echo "==> Installing tarballs into examples/cloudflare-worker"
EX_CF="$SCRATCH/cloudflare-worker"
cp -R "$ROOT/examples/cloudflare-worker" "$EX_CF"
cd "$EX_CF"
rm -rf node_modules .wrangler
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.dependencies['agent-ready-web'] = 'file:$CORE_TGZ';
  pkg.dependencies['@agent-ready-web/cloudflare'] = 'file:$CF_TGZ';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
npm install --no-audit --no-fund --ignore-scripts
npm run test

echo "==> pack-smoke OK"
