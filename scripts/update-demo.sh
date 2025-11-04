#!/bin/bash

# Demo script showing how to update packages in the YST extension
# This script demonstrates the recommended update workflow

echo "🔍 YouTube Subscriptions Transfer - Package Update Demo"
echo "======================================================="

echo ""
echo "1. Checking for outdated packages..."
npm run outdated

echo ""
echo "2. Showing security audit..."
npm audit

echo ""
echo "🔧 To update packages, you can use:"
echo "   npm run update-safe    # Recommended: Safe updates with security fixes"
echo "   npm run update-minor   # Update to latest minor/patch versions"
echo "   npm run update-interactive  # Interactive selection of updates"
echo ""
echo "⚠️  For major updates (use with caution):"
echo "   npm run update-major   # Updates ALL packages to latest versions"
echo ""
echo "📋 After any updates, always test:"
echo "   npm run build         # Ensure project builds"
echo "   npm run dev           # Test development mode"
echo ""
echo "📚 See PACKAGE_UPDATES.md for detailed information and update history"