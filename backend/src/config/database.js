const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // חשוב: מונע המתנה אינסופית אם אין חיבור
    };

    // וודא שמשתנה הסביבה קיים
    if (!process.env.MONGO_URI) {
       throw new Error('MONGO_URI is missing in environment variables');
    }

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;

