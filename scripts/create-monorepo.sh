#!/usr/bin/env bash

set -euo pipefail

APP_NAME="meghalaya"
ROOT_NAME="pension"

echo "🚀 Creating $ROOT_NAME monorepo..."

# --------------------------------------------------
# 1. Create monorepo directories
# --------------------------------------------------

mkdir -p "apps/$APP_NAME"
mkdir -p packages/{ui,core,api,config}

# --------------------------------------------------
# 2. Move existing Expo app files
# --------------------------------------------------

move_if_exists() {
  local file="$1"

  if [[ -e "$file" ]]; then
    echo "→ Moving $file"
    git mv "$file" "apps/$APP_NAME/$file" 2>/dev/null \
      || mv "$file" "apps/$APP_NAME/$file"
  fi
}

move_if_exists "app"
move_if_exists "assets"
move_if_exists "components"
move_if_exists "hooks"
move_if_exists "lib"
move_if_exists "services"
move_if_exists "stores"
move_if_exists "utils"
move_if_exists "validators"

move_if_exists "package.json"
move_if_exists "app.config.ts"
move_if_exists "app.config.js"
move_if_exists "eas.json"
move_if_exists "metro.config.js"
move_if_exists "babel.config.js"
move_if_exists "nativewind.config.js"

# --------------------------------------------------
# 3. Create pnpm workspace
# --------------------------------------------------

cat > pnpm-workspace.yaml <<'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF

# --------------------------------------------------
# 4. Create root package.json
# --------------------------------------------------

cat > package.json <<'EOF'
{
  "name": "pension",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter meghalaya start",
    "android": "pnpm --filter meghalaya android",
    "ios": "pnpm --filter meghalaya ios",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
EOF

# --------------------------------------------------
# 5. Update Expo app package name
# --------------------------------------------------

if [[ -f "apps/$APP_NAME/package.json" ]]; then
  node - <<'NODE'
const fs = require('fs');

const file = 'apps/meghalaya/package.json';
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

pkg.name = 'meghalaya';
pkg.private = true;

fs.writeFileSync(
  file,
  JSON.stringify(pkg, null, 2) + '\n'
);
NODE
fi

# --------------------------------------------------
# 6. Create package placeholders
# --------------------------------------------------

for package in ui core api config; do
  cat > "packages/$package/package.json" <<EOF
{
  "name": "@pension/$package",
  "version": "0.0.0",
  "private": true
}
EOF
done

# --------------------------------------------------
# 7. Remove old node_modules
# --------------------------------------------------

rm -rf node_modules
rm -rf "apps/$APP_NAME/node_modules"

# --------------------------------------------------
# 8. Install workspace dependencies
# --------------------------------------------------

pnpm install

echo ""
echo "✅ Pension monorepo created!"
echo ""
echo "Structure:"
echo ""
echo "pension/"
echo "├── apps/"
echo "│   └── meghalaya/"
echo "├── packages/"
echo "│   ├── ui/"
echo "│   ├── core/"
echo "│   ├── api/"
echo "│   └── config/"
echo "├── package.json"
echo "└── pnpm-workspace.yaml"
echo ""
echo "Start Expo:"
echo "  pnpm dev"
echo ""
echo "Android:"
echo "  pnpm android"
