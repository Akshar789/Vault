#!/usr/bin/env node

/**
 * Test All Connections
 * 
 * Tests:
 * 1. PostgreSQL (Supabase)
 * 2. Redis (Upstash)
 * 
 * Usage: node scripts/test-connections.js
 */

const { Client } = require('pg');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function testPostgreSQL() {
  console.log('🐘 Testing PostgreSQL (Supabase)...\n');

  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    return false;
  }

  console.log('📡 Connecting to:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: true },
  });

  try {
    await client.connect();
    console.log('   ✅ Connected to PostgreSQL');

    // Test query
    const result = await client.query('SELECT version()');
    const version = result.rows[0].version;
    console.log('   ✅ PostgreSQL version:', version.split(' ')[1]);

    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.rows.length > 0) {
      console.log('   ✅ Tables found:', tables.rows.length);
      tables.rows.forEach(row => {
        console.log('      -', row.table_name);
      });
    } else {
      console.log('   ⚠️  No tables found. Run migrations: npm run migrate');
    }

    await client.end();
    return true;

  } catch (error) {
    console.error('   ❌ PostgreSQL error:', error.message);
    return false;
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis (Upstash)...\n');

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in .env.local');
    return false;
  }

  console.log('📡 Connecting to:', redisUrl.replace(/:[^:@]+@/, ':****@'));

  const url = new URL(redisUrl);
  const isTLS = url.protocol === 'rediss:';

  const client = new Redis({
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password,
    username: url.username || 'default',
    tls: isTLS ? { rejectUnauthorized: true } : undefined,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
  });

  try {
    // Test PING
    const pong = await client.ping();
    console.log('   ✅ PING:', pong);

    // Test SET/GET
    await client.set('test:connection', 'success');
    const value = await client.get('test:connection');
    console.log('   ✅ SET/GET:', value);

    // Test INCR (rate limiting)
    const counter = await client.incr('test:counter');
    console.log('   ✅ INCR (rate limiting):', counter);

    // Cleanup
    await client.del('test:connection', 'test:counter');

    // Get info
    const info = await client.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log('   ✅ Redis version:', version);

    await client.quit();
    return true;

  } catch (error) {
    console.error('   ❌ Redis error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Zero-Knowledge Vault - Connection Tests\n');
  console.log('='.repeat(50));
  console.log();

  const pgSuccess = await testPostgreSQL();
  const redisSuccess = await testRedis();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:\n');
  console.log('   PostgreSQL:', pgSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('   Redis:     ', redisSuccess ? '✅ PASS' : '❌ FAIL');

  if (pgSuccess && redisSuccess) {
    console.log('\n✅ All connections successful!\n');
    console.log('Next steps:');
    console.log('1. Run migrations: npm run migrate');
    console.log('2. Start development: npm run dev\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some connections failed. Please check your configuration.\n');
    process.exit(1);
  }
}

main();
