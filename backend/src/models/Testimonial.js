const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'שם הלקוח הוא שדה חובה'],
      trim: true,
      maxlength: [100, 'שם הלקוח לא יכול להיות יותר מ-100 תווים']
    },
    
    clientRole: {
      type: String,
      required: [true, 'תפקיד הלקוח הוא שדה חובה'],
      trim: true,
      maxlength: [100, 'התפקיד לא יכול להיות יותר מ-100 תווים']
    },
    
    companyName: {
      type: String,
      required: [true, 'שם החברה הוא שדה חובה'],
      trim: true,
      maxlength: [150, 'שם החברה לא יכול להיות יותר מ-150 תווים']
    },
    
    content: {
      type: String,
      required: [true, 'תוכן ההמלצה הוא שדה חובה'],
      trim: true,
      minlength: [10, 'ההמלצה חייבת להכיל לפחות 10 תווים'],
      maxlength: [1000, 'ההמלצה לא יכולה להכיל יותר מ-1000 תווים']
    },
    
    rating: {
      type: Number,
      required: [true, 'דירוג הוא שדה חובה'],
      min: [1, 'הדירוג המינימלי הוא 1'],
      max: [5, 'הדירוג המקסימלי הוא 5'],
      default: 5
    },
    
    image: {
      type: String,
      default: null // URL לתמונת הלקוח
    },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    
    isVisible: {
      type: Boolean,
      default: false // האם מוצג באתר הציבורי
    },
    
    displayOrder: {
      type: Number,
      default: 0 // סדר התצוגה (לפי drag & drop)
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // יהפוך ל-required כאשר נוסיף אימות
      default: null
    },
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    approvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // מוסיף createdAt ו-updatedAt אוטומטית
  }
);

// Index לחיפוש מהיר
testimonialSchema.index({ clientName: 'text', companyName: 'text', content: 'text' });
testimonialSchema.index({ status: 1, displayOrder: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);

