const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // קישור ללקוח
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  
  // קישור להזמנה (אופציונלי)
  orderId: String,
  
  // פרטי החשבונית
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  
  // פרטי העסק שלנו (לצורך החשבונית)
  businessDetails: {
    name: { type: String, default: 'BizFlow' },
    address: String,
    phone: String,
    email: String,
    taxId: String, // ח.ע או ע.מ
    businessNumber: String // מספר עוסק מורשה
  },
  
  // פרטי הלקוח (עותק סטטי לחשבונית)
  clientDetails: {
    name: String,
    businessName: String,
    address: String,
    phone: String,
    email: String,
    taxId: String
  },
  
  // פריטים בחשבונית
  items: [{
    description: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      default: 1,
      min: 0
    },
    unitPrice: { 
      type: Number, 
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100 // אחוז הנחה
    },
    vatRate: { 
      type: Number, 
      default: 17 
    },
    subtotal: Number, // לפני מע"מ
    totalPrice: Number // אחרי מע"מ
  }],
  
  // סכומים
  subtotal: Number, // סה"כ לפני מע"מ
  discountAmount: Number, // סכום הנחה כולל
  vatAmount: Number, // סכום מע"מ
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  // מטבע
  currency: {
    type: String,
    default: 'ILS',
    enum: ['ILS', 'USD', 'EUR']
  },
  
  // סטטוס
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  
  // תשלום
  paymentDetails: {
    method: {
      type: String,
      enum: ['העברה בנקאית', 'אשראי', 'מזומן', 'צ\'ק', 'PayPal', 'bit', 'אחר']
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paidDate: Date,
    transactionId: String,
    receiptNumber: String,
    receiptUrl: String,
    bankDetails: {
      bankName: String,
      branchNumber: String,
      accountNumber: String
    }
  },
  
  // הערות ותנאים
  notes: String,
  paymentTerms: {
    type: String,
    default: 'תשלום תוך 14 יום'
  },
  footerText: String,
  
  // קבצים
  pdfUrl: String,
  pdfGeneratedAt: Date,
  
  // שליחה
  sentDate: Date,
  sentTo: String, // אימייל שנשלח אליו
  viewedDate: Date,
  
  // תזכורות
  reminders: [{
    sentDate: Date,
    method: {
      type: String,
      enum: ['email', 'whatsapp', 'sms', 'phone']
    },
    notes: String
  }],
  
  // מטאדאטה
  metadata: {
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }
}, {
  timestamps: true
});

// אינדקסים
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ clientId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ 'metadata.createdAt': -1 });

// חישוב אוטומטי של סכומים
InvoiceSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let vatAmount = 0;
  
  this.items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const discountAmount = itemSubtotal * (item.discount / 100);
    const afterDiscount = itemSubtotal - discountAmount;
    
    item.subtotal = afterDiscount;
    
    const itemVat = afterDiscount * (item.vatRate / 100);
    item.totalPrice = afterDiscount + itemVat;
    
    subtotal += afterDiscount;
    vatAmount += itemVat;
  });
  
  this.subtotal = subtotal;
  this.vatAmount = vatAmount;
  this.totalAmount = subtotal + vatAmount;
  
  return {
    subtotal: this.subtotal,
    vatAmount: this.vatAmount,
    totalAmount: this.totalAmount
  };
};

// יצירת מספר חשבונית אוטומטי
InvoiceSchema.statics.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const lastInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^${prefix}`)
  }).sort({ invoiceNumber: -1 });
  
  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// בדיקה אם חשבונית באיחור
InvoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && 
         this.status !== 'cancelled' && 
         new Date() > new Date(this.dueDate);
});

// עדכון סטטוס אוטומטי
InvoiceSchema.methods.updateStatus = function() {
  if (this.paymentDetails.paidAmount >= this.totalAmount) {
    this.status = 'paid';
  } else if (this.paymentDetails.paidAmount > 0) {
    this.status = 'partially_paid';
  } else if (new Date() > new Date(this.dueDate) && this.status !== 'cancelled') {
    this.status = 'overdue';
  }
};

// Middleware
InvoiceSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.calculateTotals();
  this.updateStatus();
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);

