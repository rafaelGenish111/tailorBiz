const mongoose = require('mongoose');

const leadFunnelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: String,
  
  stages: [{
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    color: String,
    leads: [{
      leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
      },
      enteredAt: {
        type: Date,
        default: Date.now
      },
      source: String,
      campaign: String,
      metadata: mongoose.Schema.Types.Mixed
    }],
    conversionRate: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  }],
  
  // אוטומציות לכל שלב
  automations: [{
    stage: String,
    trigger: {
      type: String,
      enum: ['on_enter', 'after_delay', 'on_inactivity', 'on_action']
    },
    action: {
      type: String,
      enum: ['send_email', 'send_sms', 'send_whatsapp', 'create_task', 'notify_team', 'move_stage', 'tag_lead']
    },
    delay: {
      type: Number,
      default: 0
    },
    config: mongoose.Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // אנליטיקה
  analytics: {
    totalLeads: {
      type: Number,
      default: 0
    },
    converted: {
      type: Number,
      default: 0
    },
    dropped: {
      type: Number,
      default: 0
    },
    averageConversionTime: {
      type: Number,
      default: 0
    },
    costPerLead: {
      type: Number,
      default: 0
    },
    overallConversionRate: {
      type: Number,
      default: 0
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Method להוספת ליד לשלב
leadFunnelSchema.methods.addLeadToStage = async function(stageOrder, leadId, source, campaign) {
  const stage = this.stages.find(s => s.order === stageOrder);
  if (!stage) throw new Error('Stage not found');
  
  stage.leads.push({
    leadId,
    enteredAt: new Date(),
    source,
    campaign
  });
  
  this.analytics.totalLeads++;
  await this.save();
  
  return this;
};

// Method להעברת ליד בין שלבים
leadFunnelSchema.methods.moveLeadToStage = async function(leadId, fromStageOrder, toStageOrder) {
  const fromStage = this.stages.find(s => s.order === fromStageOrder);
  const toStage = this.stages.find(s => s.order === toStageOrder);
  
  if (!fromStage || !toStage) throw new Error('Stage not found');
  
  const leadIndex = fromStage.leads.findIndex(l => l.leadId.toString() === leadId.toString());
  if (leadIndex === -1) throw new Error('Lead not found in stage');
  
  const lead = fromStage.leads[leadIndex];
  fromStage.leads.splice(leadIndex, 1);
  
  toStage.leads.push({
    ...lead._doc,
    enteredAt: new Date()
  });
  
  await this.save();
  return this;
};

// Method לחישוב conversion rates
leadFunnelSchema.methods.calculateConversionRates = function() {
  for (let i = 0; i < this.stages.length - 1; i++) {
    const currentStage = this.stages[i];
    const nextStage = this.stages[i + 1];
    
    if (currentStage.leads.length === 0) {
      currentStage.conversionRate = 0;
    } else {
      currentStage.conversionRate = Math.round((nextStage.leads.length / currentStage.leads.length) * 10000) / 100;
    }
  }
  
  // Overall conversion rate
  if (this.stages[0].leads.length > 0) {
    const lastStage = this.stages[this.stages.length - 1];
    this.analytics.overallConversionRate = Math.round((lastStage.leads.length / this.stages[0].leads.length) * 10000) / 100;
  }
  
  return this;
};

const LeadFunnel = mongoose.model('LeadFunnel', leadFunnelSchema);

module.exports = LeadFunnel;













