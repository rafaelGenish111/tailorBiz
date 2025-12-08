// backend/models/Quote.js
const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { _id: true });

const quoteSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  quoteNumber: {
    type: String,
    unique: true
  },
  businessInfo: {
    name: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    taxId: String
  },
  clientInfo: {
    name: String,
    businessName: String,
    address: String,
    phone: String,
    email: String,
    taxId: String
  },
  title: {
    type: String,
    default: 'הצעת מחיר'
  },
  items: [quoteItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  vatRate: {
    type: Number,
    default: 17
  },
  vatAmount: {
    type: Number,
    default: 0
  },
  includeVat: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  validUntil: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  pdfUrl: {
    type: String
  },
  pdfCloudinaryId: {
    type: String
  }
}, {
  timestamps: true
});

// יצירת מספר הצעה אוטומטי
// חשוב: משתמשים ב-max quoteNumber לשנה במקום countDocuments כדי להימנע מדופליקייטים
quoteSchema.pre('save', async function(next) {
  try {
    if (!this.quoteNumber) {
      const year = new Date().getFullYear();

      // מצא את ההצעה האחרונה לאותה שנה לפי quoteNumber הגבוה ביותר
      const lastQuote = await this.constructor
        .findOne({ quoteNumber: new RegExp(`^Q${year}-`) })
        .sort({ quoteNumber: -1 })
        .select('quoteNumber')
        .lean();

      let nextNumber = 1;

      if (lastQuote?.quoteNumber) {
        const parts = lastQuote.quoteNumber.split('-');
        const lastSeq = parseInt(parts[1], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }

      this.quoteNumber = `Q${year}-${String(nextNumber).padStart(4, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// חישוב סכומים
quoteSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    item.totalPrice = item.quantity * item.unitPrice;
    return sum + item.totalPrice;
  }, 0);

  let discountAmount = 0;
  if (this.discount > 0) {
    if (this.discountType === 'percentage') {
      discountAmount = this.subtotal * (this.discount / 100);
    } else {
      discountAmount = this.discount;
    }
  }

  const afterDiscount = this.subtotal - discountAmount;

  if (this.includeVat) {
    this.vatAmount = afterDiscount * (this.vatRate / 100);
    this.total = afterDiscount + this.vatAmount;
  } else {
    this.vatAmount = 0;
    this.total = afterDiscount;
  }

  return this;
};

module.exports = mongoose.model('Quote', quoteSchema);

