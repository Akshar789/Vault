#!/usr/bin/env node

/**
 * Test Redis Connection
 * 
 * Usage: node scripts/test-redis.js
 */

const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function testRedis() {
  console.log('🔍 Testing Redis connection...\n');

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in .env.local');
    process.exit(1);
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
    console.log('\n1️⃣  Testing PING...');
    const pong = await client.ping();
    console.log('   ✅ PING:', pong);

    // Test SET
    console.log('\n2️⃣  Testing SET...');
    await client.set('test:key', 'Hello from Zero-Knowledge Vault!');
    console.log('   ✅ SET: test:key');

    // Test GET
    console.log('\n3️⃣  Testing GET...');
    const value = await client.get('test:key');
    console.log('   ✅ GET:', value);

    // Test INCR (for rate limiting)
    console.log('\n4️⃣  Testing INCR (rate limiting)...');
    const counter = await client.incr('test:counter');
    console.log('   ✅ INCR:', counter);

    // Test EXPIRE
    console.log('\n5️⃣  Testing EXPIRE...');
    await client.expire('test:counter', 60);
    const ttl = await client.ttl('test:counter');
    console.log('   ✅ EXPIRE: TTL =', ttl, 'seconds');

    // Test SADD (for token revocation)
    console.log('\n6️⃣  Testing SADD (token revocation)...');
    await client.sadd('test:set', 'token1', 'token2');
    const isMember = await client.sismember('test:set', 'token1');
    console.log('   ✅ SADD: token1 exists =', isMember === 1);

    // Cleanup
    console.log('\n7️⃣  Cleaning up...');
    await client.del('test:key', 'test:counter', 'test:set');
    console.log('   ✅ Cleanup complete');

    // Get info
    console.log('\n8️⃣  Redis Info:');
    const info = await client.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    const mode = info.match(/redis_mode:([^\r\n]+)/)?.[1];
    console.log('   Version:', version);
    console.log('   Mode:', mode);

    console.log('\n✅ All tests passed! Redis is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Redis test failed:', error.message);
    process.exit(1);
  } finally {
    await client.quit();
  }
}

testRedis();
