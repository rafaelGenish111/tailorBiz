#!/usr/bin/env node

/**
 * Generate secure secrets for .env file
 * Run: node scripts/generateSecrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating secure secrets...\n');
console.log('Copy these to your .env file:\n');
console.log('─'.repeat(80));

// Generate JWT Secret (64 bytes = 128 hex chars)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(`JWT_SECRET=${jwtSecret}`);

// Generate Admin Bootstrap Secret (32 bytes = 64 hex chars)
const adminSecret = crypto.randomBytes(32).toString('hex');
console.log(`ADMIN_BOOTSTRAP_SECRET=${adminSecret}`);

// Generate a random password (for MongoDB user)
const mongoPassword = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
console.log(`\nSuggested MongoDB Password (use when creating new user):\n${mongoPassword}`);

console.log('\n' + '─'.repeat(80));
console.log('\n✅ Done! Remember to:');
console.log('1. Update these in your local .env file');
console.log('2. Update MongoDB password in MongoDB Atlas');
console.log('3. Update all secrets in Vercel Environment Variables');
console.log('4. Restart your server\n');
