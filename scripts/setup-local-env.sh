#!/bin/bash

# Setup script for local Supabase development environment

echo "🚀 Setting up local Supabase environment..."

# Create .env.local file with local Supabase configuration
cat > .env.local << EOF
# Local Development Configuration
VITE_APP_URL=http://localhost:5173

# Supabase Local Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# AI Configuration (Optional)
VITE_AI_PROVIDER=mock
VITE_OPENAI_KEY=your_openai_api_key_here

# Analytics (Optional)
VITE_POSTHOG_KEY=your_posthog_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
EOF

echo "✅ Created .env.local file with local Supabase configuration"
echo ""
echo "📋 Next steps:"
echo "1. Start your development server: npm run dev"
echo "2. Open Supabase Studio: http://127.0.0.1:54323"
echo "3. Your database is ready with all migrations applied"
echo ""
echo "🔗 Useful URLs:"
echo "   - Supabase Studio: http://127.0.0.1:54323"
echo "   - API URL: http://127.0.0.1:54321"
echo "   - Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
