#!/bin/bash

# Lennin Fit Deployment Script
# This script makes deployment easier and more maintainable

set -e  # Exit on any error

echo "🚀 Starting Lennin Fit deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on main branch
if [[ $(git branch --show-current) != "main" ]]; then
    print_warning "You're not on the main branch. Current branch: $(git branch --show-current)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    print_warning "You have uncommitted changes:"
    git status --short
    read -p "Commit changes before deploying? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_message
        git commit -m "$commit_message"
        print_status "Changes committed"
    else
        print_warning "Deploying with uncommitted changes"
    fi
fi

# Build the project
print_status "Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    print_status "Build successful!"
else
    print_error "Build failed!"
    exit 1
fi

# Push to GitHub (this will trigger Netlify deployment)
print_status "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_status "✅ Deployment triggered successfully!"
    echo ""
    echo "🌐 Your sites will be available at:"
    echo "   • https://tilsf.com"
    echo "   • https://tilsf.com"
    echo ""
    echo "📊 Monitor deployment at: https://app.netlify.com"
    echo ""
    print_warning "Note: DNS propagation may take up to 24 hours for new domains"
else
    print_error "Failed to push to GitHub"
    exit 1
fi
