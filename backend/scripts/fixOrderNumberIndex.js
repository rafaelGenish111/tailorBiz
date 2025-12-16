// backend/scripts/fixOrderNumberIndex.js
require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    // התחבר ל-MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('clients');

    // בדוק אילו אינדקסים קיימים
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    // מחק את האינדקס הבעייתי
    try {
      await collection.dropIndex('orders.orderNumber_1');
      console.log('✅ Deleted index: orders.orderNumber_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index orders.orderNumber_1 does not exist (already deleted)');
      } else {
        throw error;
      }
    }

    console.log('🎉 Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();











