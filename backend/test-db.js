import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...');
console.log('Connection String:', MONGODB_URI ? '✅ Set' : '❌ Missing');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);

    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.collections();
    console.log('📁 Collections:', collections.map(c => c.collectionName));

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('💡 Tip: Check your username and password');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('💡 Tip: Check your cluster URL and network access');
    } else if (error.message.includes('connection timed out')) {
      console.log('💡 Tip: Check your IP whitelist and firewall settings');
    }

    process.exit(1);
  }
}

testConnection();