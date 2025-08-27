#!/bin/bash

# TILSF Microsite Deployment Script
# This script builds and deploys the TILSF microsite to Netlify

set -e

echo "🚀 TILSF Microsite Deployment"
echo "=============================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Build the microsite
echo "📦 Building TILSF microsite..."
npm run build:tilsf

# Check if build was successful
if [ ! -d "dist-tilsf" ]; then
    echo "❌ Build failed - dist-tilsf directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if we're logged into Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify..."
    netlify login
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
cd dist-tilsf

# Check if this is a new site or existing site
if [ -f ".netlify/state.json" ]; then
    echo "📤 Deploying to existing site..."
    netlify deploy --prod
else
    echo "🆕 Initializing new Netlify site..."
    netlify init
    echo "📤 Deploying to production..."
    netlify deploy --prod
fi

echo ""
echo "🎉 TILSF microsite deployed successfully!"
echo "🌍 Check your site at the URL provided above"
echo ""
echo "📋 Next steps:"
echo "   1. Add custom domain 'tilsf.com' in Netlify dashboard"
echo "   2. Configure DNS to point to Netlify"
echo "   3. Test the site: curl -I https://tilsf.com"
echo "   4. Run Lighthouse audit for performance"
echo ""
echo "📚 See TILSF_DEPLOYMENT.md for detailed instructions"
