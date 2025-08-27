// RLS Sanity Test Script
// Run with: node scripts/rls-test.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  console.log('🧪 Testing RLS with two separate accounts...\n');

  // Test Account 1
  console.log('📧 Testing Account 1 (test1@example.com)...');
  const { data: auth1, error: authError1 } = await supabase.auth.signInWithOtp({
    email: 'test1@example.com',
  });
  
  if (authError1) {
    console.log('⚠️  Account 1 not found, creating test data...');
    // Create test client for account 1
    const { data: client1, error: clientError1 } = await supabase
      .from('clients')
      .insert({
        name: 'Test Client 1',
        email: 'client1@test.com',
        org_id: 'test-org-1'
      })
      .select()
      .single();
    
    if (clientError1) {
      console.log('❌ Failed to create test client 1:', clientError1.message);
    } else {
      console.log('✅ Created test client 1:', client1.name);
    }
  } else {
    console.log('✅ Account 1 authenticated');
  }

  // Test Account 2  
  console.log('\n📧 Testing Account 2 (test2@example.com)...');
  const { data: auth2, error: authError2 } = await supabase.auth.signInWithOtp({
    email: 'test2@example.com',
  });

  if (authError2) {
    console.log('⚠️  Account 2 not found, creating test data...');
    // Create test client for account 2
    const { data: client2, error: clientError2 } = await supabase
      .from('clients')
      .insert({
        name: 'Test Client 2', 
        email: 'client2@test.com',
        org_id: 'test-org-2'
      })
      .select()
      .single();
    
    if (clientError2) {
      console.log('❌ Failed to create test client 2:', clientError2.message);
    } else {
      console.log('✅ Created test client 2:', client2.name);
    }
  } else {
    console.log('✅ Account 2 authenticated');
  }

  // Test data isolation
  console.log('\n🔒 Testing data isolation...');
  
  // Sign in as account 1
  await supabase.auth.signInWithOtp({ email: 'test1@example.com' });
  
  const { data: clients1, error: error1 } = await supabase
    .from('clients')
    .select('*');
  
  console.log('Account 1 clients:', clients1?.length || 0);
  
  // Sign in as account 2  
  await supabase.auth.signInWithOtp({ email: 'test2@example.com' });
  
  const { data: clients2, error: error2 } = await supabase
    .from('clients')
    .select('*');
  
  console.log('Account 2 clients:', clients2?.length || 0);

  // Verify isolation
  const account1HasAccount2Data = clients1?.some(c => c.org_id === 'test-org-2');
  const account2HasAccount1Data = clients2?.some(c => c.org_id === 'test-org-1');

  if (!account1HasAccount2Data && !account2HasAccount1Data) {
    console.log('✅ RLS working correctly - data properly isolated');
  } else {
    console.log('❌ RLS FAILED - data leakage detected');
    console.log('Account 1 has Account 2 data:', account1HasAccount2Data);
    console.log('Account 2 has Account 1 data:', account2HasAccount1Data);
  }

  console.log('\n🎉 RLS test completed!');
}

testRLS().catch(console.error);
