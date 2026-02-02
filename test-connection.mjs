// test-connection.mjs
// Run this with: node test-connection.mjs

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Not set ✗');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('\nAttempting MongoDB connection...\n');

async function testConnection() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ SUCCESS! MongoDB connected successfully');
    console.log('Connected to:', mongoose.connection.name);
    
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR: MongoDB connection failed');
    console.error('Error message:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if MongoDB is running (for local)');
    console.error('2. Verify DATABASE_URL in .env file');
    console.error('3. For local MongoDB, try: net start MongoDB');
    console.error('4. For Atlas, check username/password and IP whitelist');
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();