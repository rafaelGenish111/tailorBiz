/**
 * סקריפט לתיקון אינדקסים כפולים במסד הנתונים
 * 
 * הסקריפט מוחק אינדקסים כפולים שנוצרו בגלל הגדרת unique: true
 * וגם schema.index() על אותו שדה
 */

require('dotenv').config();
const mongoose = require('mongoose');

const fixDuplicateIndexes = async () => {
  try {
    console.log('🔌 מתחבר למסד הנתונים...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ התחברות הצליחה\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('🔍 מחפש אינדקסים כפולים...\n');

    // תיקון אינדקסים ב-clients collection
    try {
      const clientsCollection = db.collection('clients');
      const indexes = await clientsCollection.indexes();
      
      console.log('📋 אינדקסים קיימים ב-clients:');
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });

      // מחפש אינדקס כפול על personalInfo.phone
      const phoneIndex = indexes.find(idx => 
        idx.name === 'personalInfo.phone_1' && 
        Object.keys(idx.key).length === 1 && 
        idx.key['personalInfo.phone'] === 1
      );

      if (phoneIndex) {
        console.log('\n🗑️  מוחק אינדקס כפול: personalInfo.phone_1');
        await clientsCollection.dropIndex('personalInfo.phone_1');
        console.log('✅ האינדקס נמחק בהצלחה');
      } else {
        console.log('\n✅ לא נמצא אינדקס כפול על personalInfo.phone');
      }
    } catch (error) {
      console.log(`⚠️  שגיאה בטיפול ב-clients: ${error.message}`);
    }

    // תיקון אינדקסים ב-invoices collection
    try {
      const invoicesCollection = db.collection('invoices');
      const indexes = await invoicesCollection.indexes();
      
      console.log('\n📋 אינדקסים קיימים ב-invoices:');
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });

      // מחפש אינדקס כפול על invoiceNumber
      const invoiceNumberIndex = indexes.find(idx => 
        idx.name === 'invoiceNumber_1' && 
        Object.keys(idx.key).length === 1 && 
        idx.key['invoiceNumber'] === 1
      );

      if (invoiceNumberIndex) {
        console.log('\n🗑️  מוחק אינדקס כפול: invoiceNumber_1');
        await invoicesCollection.dropIndex('invoiceNumber_1');
        console.log('✅ האינדקס נמחק בהצלחה');
      } else {
        console.log('\n✅ לא נמצא אינדקס כפול על invoiceNumber');
      }
    } catch (error) {
      console.log(`⚠️  שגיאה בטיפול ב-invoices: ${error.message}`);
    }

    console.log('\n✅ סיום התיקון');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ שגיאה:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

fixDuplicateIndexes();



