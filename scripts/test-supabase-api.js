/**
 * Test Supabase REST API Connection
 * 
 * This tests the Supabase REST API which may work better than direct PostgreSQL
 * connection when there are DNS/network issues.
 */

const https = require('https');

const SUPABASE_URL = 'https://zkmolpbnqdgsvsulyzec.supabase.co';
const SUPABASE_KEY = 'sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD';

console.log('🧪 Testing Supabase REST API Connection...\n');

// Test 1: Check if we can reach the API
console.log('Test 1: Checking API reachability...');
const options = {
  hostname: 'zkmolpbnqdgsvsulyzec.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
};

const req = https.request(options, (res) => {
  console.log(`✓ API Status: ${res.statusCode}`);
  console.log(`✓ Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✓ API is reachable!');
    
    // Test 2: Query the users table
    console.log('\nTest 2: Querying users table...');
    const queryOptions = {
      hostname: 'zkmolpbnqdgsvsulyzec.supabase.co',
      port: 443,
      path: '/rest/v1/users?select=id&limit=1',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    const queryReq = https.request(queryOptions, (queryRes) => {
      console.log(`✓ Query Status: ${queryRes.statusCode}`);
      
      let queryData = '';
      queryRes.on('data', (chunk) => {
        queryData += chunk;
      });
      
      queryRes.on('end', () => {
        console.log(`✓ Response:`, queryData);
        console.log('\n✅ Supabase REST API is working!');
        console.log('\n💡 Recommendation: Use Supabase REST API for database operations');
        console.log('   instead of direct PostgreSQL connection if DNS issues persist.');
      });
    });
    
    queryReq.on('error', (error) => {
      console.error('❌ Query failed:', error.message);
    });
    
    queryReq.end();
  });
});

req.on('error', (error) => {
  console.error('❌ API connection failed:', error.message);
  console.error('\nPossible issues:');
  console.error('- Network/firewall blocking HTTPS');
  console.error('- DNS resolution problems');
  console.error('- Invalid Supabase URL or API key');
});

req.end();
