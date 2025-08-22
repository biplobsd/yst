#!/bin/bash

# Post-update verification script for YST extension
# Run this after any package updates to ensure everything works

echo "🧪 YouTube Subscriptions Transfer - Post-Update Verification"
echo "==========================================================="

echo ""
echo "1. Running TypeScript checks..."
npm run check

if [ $? -eq 0 ]; then
    echo "✅ TypeScript checks passed"
else
    echo "❌ TypeScript checks failed"
    exit 1
fi

echo ""
echo "2. Building extension..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "3. Checking if dist folder was created..."
if [ -d "dist" ]; then
    echo "✅ Dist folder exists"
    echo "📁 Dist contents:"
    ls -la dist/ | head -10
else
    echo "❌ Dist folder not found"
    exit 1
fi

echo ""
echo "4. Checking manifest.json..."
if [ -f "dist/manifest.json" ]; then
    echo "✅ Manifest file exists"
    echo "📋 Extension info:"
    cat dist/manifest.json | grep -E '"name"|"version"|"description"' | head -3
else
    echo "❌ Manifest file not found"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Extension is ready to use."
echo ""
echo "💡 Next steps:"
echo "   1. Load the extension in your browser:"
echo "      - Chrome: chrome://extensions/ -> Load unpacked -> select 'dist' folder"
echo "      - Firefox: about:debugging -> This Firefox -> Load Temporary Add-on -> select manifest.json in 'dist'"
echo "   2. Test basic functionality"
echo "   3. Check that all features work as expected"