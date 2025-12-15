// backend/scripts/seedNurturing.js
require('dotenv').config();
const mongoose = require('mongoose');
const { seedTemplates } = require('../seeds/nurturingTemplates');

async function main() {
  try {
    // התחבר ל-MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // הטמע תבניות
    await seedTemplates();

    console.log('🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();










