#!/usr/bin/env node

/**
 * Test Direct Database Connection with Alternative Methods
 */

const { Client } = require('pg');

async function testConnection(config, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log('   Config:', JSON.stringify(config, null, 2).replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('   ✅ Connected!');
    
    const result = await client.query('SELECT version()');
    console.log('   ✅ Query successful');
    console.log('   Version:', result.rows[0].version.split(' ')[1]);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Alternative Database Connections\n');
  console.log('='.repeat(60));

  // Method 1: Direct connection (current)
  await testConnection({
    connectionString: 'postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: true },
  }, 'Direct Connection (Port 5432)');

  // Method 2: Connection pooler
  await testConnection({
    connectionString: 'postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres',
    ssl: { rejectUnauthorized: true },
  }, 'Connection Pooler (Port 6543)');

  // Method 3: Without SSL verification
  await testConnection({
    connectionString: 'postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
  }, 'Direct Connection (SSL no verify)');

  // Method 4: Using individual parameters
  await testConnection({
    host: 'db.zkmolpbnqdgsvsulyzec.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'YJ32TmrReQe984xz',
    ssl: { rejectUnauthorized: true },
  }, 'Individual Parameters');

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 If all methods fail, this is a network/firewall issue.');
  console.log('   Use Supabase SQL Editor to run migrations instead.\n');
}

main();
