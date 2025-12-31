const mongoose = require('mongoose');

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
    status: {
      type: String,
      enum: ['active', 'on_hold', 'completed', 'archived'],
      default: 'active',
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
projectSchema.index({ clientId: 1, status: 1 });
projectSchema.index({ createdAt: -1 });

projectSchema.pre('save', function (next) {
  this.metadata.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);














