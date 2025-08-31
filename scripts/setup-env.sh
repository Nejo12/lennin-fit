#!/bin/bash

# Setup environment variables for Netlify deployment
# This script helps you configure the required environment variables

echo "🚀 Setting up environment variables for Netlify deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
fi

echo ""
echo "🔧 Required environment variables for Netlify:"
echo ""
echo "1. SUPABASE_URL - Your Supabase project URL"
echo "2. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key"
echo "3. VITE_SUPABASE_URL - Your Supabase project URL (for frontend)"
echo "4. VITE_SUPABASE_ANON_KEY - Your Supabase anon key (for frontend)"
echo ""
echo "📋 To set these in Netlify:"
echo "1. Go to your Netlify dashboard"
echo "2. Navigate to Site settings > Environment variables"
echo "3. Add the following variables:"
echo ""
echo "   SUPABASE_URL=https://your-project.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "🔑 To get your Supabase keys:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to Settings > API"
echo "3. Copy the Project URL and API keys"
echo ""
echo "⚠️  Important: Never commit your service role key to version control!"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Supabase CLI not found. Installing..."
    echo "Please install Supabase CLI: https://supabase.com/docs/guides/cli"
    echo ""
    echo "After installation, run:"
    echo "supabase login"
    echo "supabase link --project-ref your-project-ref"
    echo "supabase db push"
else
    echo "✅ Supabase CLI is installed"
    echo ""
    echo "To deploy database changes:"
    echo "supabase db push"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Set up environment variables in Netlify"
echo "2. Deploy database changes: supabase db push"
echo "3. Deploy to Netlify: npm run deploy"
echo ""
echo "✅ Setup complete!"
