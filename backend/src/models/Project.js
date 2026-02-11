const mongoose = require('mongoose');

// Schema for assessmentSnapshot (moved from Client.assessmentForm)
const assessmentSnapshotSchema = new mongoose.Schema({
  filledAt: Date,

  basicInfo: {
    businessDescription: String,
    numberOfEmployees: Number
  },

  currentSystems: {
    managementMethod: String,
    existingSystem: String,
    whatWorksWell: String,
    whatDoesntWork: String
  },

  painPoints: {
    timeWasters: [String],
    customerLoss: String,
    processesToAutomate: [String]
  },

  processesToImprove: {
    queueManagement: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    customerTracking: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    billingPayments: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    inventory: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    communication: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    production: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    fieldTeams: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    documents: { needed: Boolean, priority: { type: Number, min: 1, max: 5 }, notes: String },
    mostUrgent: String
  },

  goalsAndObjectives: {
    desiredOutcomes: [String],
    successCriteria: [String],
    expectedTimeSaving: String
  },

  specialRequirements: {
    externalIntegrations: [String],
    uniqueProcesses: [String]
  },

  budgetAndTimeline: {
    budgetRange: { type: String, enum: ['עד 10,000', '10,000-20,000', '20,000-40,000', '40,000-60,000', '60,000+', 'לא בטוח'] },
    desiredImplementationDate: Date,
    urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
  },

  nextSteps: {
    proposalPresentation: Boolean,
    preferredMeetingDate: Date,
    additionalNotes: String
  }
}, { _id: false });

// Schema for orders (moved from Client.orders)
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  orderDate: { type: Date, default: Date.now },
  description: String,
  services: [{
    serviceName: String,
    description: String,
    price: Number,
    estimatedHours: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'testing', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: Date,
  expectedCompletionDate: Date,
  actualCompletionDate: Date,
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: Boolean,
    completedDate: Date,
    percentComplete: { type: Number, min: 0, max: 100, default: 0 }
  }],
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { _id: true });

// Schema for dynamic requirements (Assessment to Quote pipeline)
const requirementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'approved', 'rejected', 'implemented'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['must', 'nice_to_have'],
    default: 'must'
  },
  estimatedHours: { type: Number, min: 0 },
  notes: { type: String, trim: true },
  source: {
    type: String,
    enum: ['meeting', 'email', 'form'],
    default: 'form'
  }
}, { _id: true });

// Schema for payment plan (moved from Client.paymentPlan)
const paymentPlanSchema = new mongoose.Schema({
  totalAmount: Number,
  currency: { type: String, default: 'ILS' },
  paymentStructure: {
    type: String,
    enum: ['one_time', 'installments', 'milestone_based', 'monthly_subscription'],
    default: 'installments'
  },
  installments: [{
    installmentNumber: Number,
    description: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled', 'partial'],
      default: 'pending'
    },
    paidAmount: { type: Number, default: 0 },
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ['העברה בנקאית', 'אשראי', 'מזומן', 'צ\'ק', 'PayPal', 'bit', 'אחר']
    },
    transactionId: String,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    notes: String,
    reminderSent: { type: Boolean, default: false },
    lastReminderDate: Date
  }]
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
    },

    // Pipeline stage (replaces old status for deal-based tracking)
    stage: {
      type: String,
      enum: ['lead', 'assessment', 'proposal', 'contract', 'active', 'completed', 'maintenance', 'archived'],
      default: 'lead',
      index: true
    },

    // Legacy status kept for backward compatibility (maps to stage)
    status: {
      type: String,
      enum: ['lead', 'assessment', 'proposal', 'contract', 'active', 'completed', 'maintenance', 'archived'],
      default: 'lead',
      index: true
    },

    color: {
      type: String,
      default: '#1976d2'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },

    // Scope of Work (moved from Client)
    orders: [orderSchema],

    assessmentSnapshot: assessmentSnapshotSchema,

    // Dynamic requirements - active working area (assessmentSnapshot kept for backward compatibility)
    requirements: [requirementSchema],

    // Financials (moved from Client)
    paymentPlan: paymentPlanSchema,

    financials: {
      totalValue: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      currency: { type: String, default: 'ILS' }
    },

    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ ownerId: 1, status: 1 });
projectSchema.index({ ownerId: 1, stage: 1 });
projectSchema.index({ clientId: 1, status: 1 });
projectSchema.index({ clientId: 1, stage: 1 });
projectSchema.index({ createdAt: -1 });

projectSchema.pre('save', function (next) {
  this.metadata.updatedAt = new Date();
  if (!this.stage && this.status) {
    this.stage = this.status;
  }
  if (!this.status && this.stage) {
    this.status = this.stage;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
