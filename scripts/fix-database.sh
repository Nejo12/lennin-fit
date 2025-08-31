#!/bin/bash

# Fix Database Issues Script
# This script helps fix the user profile and organization issues causing task creation failures

echo "🔧 Fixing Database Issues..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 This script will help you fix the database issues causing task creation failures."
echo ""
echo "The issues are:"
echo "1. Users without proper organization setup"
echo "2. Missing memberships between users and organizations"
echo "3. Foreign key violations when creating tasks"
echo ""
echo "To fix these issues, you need to run the migration in your Supabase dashboard:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of: supabase/migrations/009_fix_broken_profiles.sql"
echo "4. Run the SQL script"
echo ""
echo "After running the migration, try creating a task again."
echo ""
echo "Would you like to see the migration SQL? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "📄 Migration SQL:"
    echo "================================"
    cat supabase/migrations/009_fix_broken_profiles.sql
    echo ""
    echo "================================"
fi

echo ""
echo "✅ Script completed. Please run the migration in your Supabase dashboard."
