require('dotenv').config();
const mongoose = require('mongoose');
const PageContent = require('../src/models/PageContent');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in .env file');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB Production...');

    const homePageExists = await PageContent.findOne({ slug: 'home' });
    if (!homePageExists) {
      await PageContent.create({
        title: 'דף הבית',
        slug: 'home',
        published: true,
        publishedAt: new Date(),
        blocks: [
          {
            id: 'hero-1',
            type: 'hero',
            content: {
              title: 'ברוכים הבאים ל-TailorBiz',
              subtitle: 'מערכת הניהול שנתפרה בדיוק למידות שלך',
              ctaText: 'התחל עכשיו',
              ctaLink: '/contact'
            }
          }
        ]
      });
      console.log('✅ Home page created successfully!');
    } else {
      console.log('ℹ️ Home page already exists.');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();