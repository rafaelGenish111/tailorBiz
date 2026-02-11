#!/usr/bin/env node
/**
 * Test script: Add requirement to Project -> Generate Quote
 *
 * Uses DB directly (no HTTP) to verify the Assessment-to-Quote pipeline.
 * Run (from project root):  node backend/scripts/test_requirement_to_quote.js
 * Run (from backend/):      npm run test:requirement-to-quote
 *
 * Prerequisites: MONGO_URI in .env, at least one Client and Project in DB
 */

require('dotenv').config();
const path = require('path');

// Load .env from project root and backend/
const rootEnv = path.resolve(__dirname, '../../.env');
const backendEnv = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: rootEnv });
require('dotenv').config({ path: backendEnv });

const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Project = require('../src/models/Project');
const Quote = require('../src/models/Quote');
const Client = require('../src/models/Client');

async function run() {
  console.log('🧪 Test: Add requirement → Generate Quote\n');

  await connectDB();

  let project;
  let clientId;

  // 1. Find or create a Project with clientId
  project = await Project.findOne({ clientId: { $exists: true, $ne: null } })
    .populate('clientId')
    .lean();

  if (!project) {
    const client = await Client.findOne();
    if (!client) {
      console.error('❌ No Client found in DB. Create a client first.');
      process.exit(1);
    }
    clientId = client._id;
    project = await Project.create({
      name: 'Test Project - Quote Pipeline',
      description: 'Created by test script',
      clientId,
      stage: 'assessment',
      status: 'assessment'
    });
    console.log('📦 Created test Project:', project._id);
  } else {
    clientId = project.clientId?._id || project.clientId;
    console.log('📦 Using existing Project:', project._id, project.name);
  }

  const projectDoc = await Project.findById(project._id);

  // 2. Add a requirement (status: approved)
  const requirement = {
    title: 'מערכת ניהול תורים',
    description: 'פיתוח מודול תורים עם תזכורות SMS',
    status: 'approved',
    priority: 'must',
    estimatedHours: 12,
    notes: 'Test requirement',
    source: 'form'
  };

  if (!projectDoc.requirements) projectDoc.requirements = [];
  projectDoc.requirements.push(requirement);
  await projectDoc.save();

  const addedReq = projectDoc.requirements[projectDoc.requirements.length - 1];
  console.log('✅ Added requirement:', addedReq.title, '| status:', addedReq.status, '| _id:', addedReq._id);

  // 3. Generate Quote (simulate controller logic)
  const requirementsToInclude = projectDoc.requirements.filter((r) => r.status === 'approved');
  const hourlyRate = parseFloat(process.env.HOURLY_RATE_ILS) || 0;
  const client = await Client.findById(clientId);

  const items = requirementsToInclude.map((req) => {
    const quantity = 1;
    const unitPrice =
      hourlyRate > 0 && req.estimatedHours > 0 ? req.estimatedHours * hourlyRate : 0;
    return {
      name: req.title,
      description: req.description || '',
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity
    };
  });

  const nextVersion =
    (await Quote.findOne({ projectId: projectDoc._id })
      .sort({ version: -1 })
      .select('version')
      .lean())?.version ?? 0;
  const version = nextVersion + 1;

  const quote = new Quote({
    clientId,
    projectId: projectDoc._id,
    version,
    linkedRequirements: requirementsToInclude.map((r) => r._id),
    createdBy: null,
    businessInfo: { name: 'BizFlow' },
    clientInfo: {
      name: client?.personalInfo?.fullName,
      businessName: client?.businessInfo?.businessName
    },
    title: `הצעת מחיר - ${projectDoc.name}`,
    items,
    status: 'draft'
  });

  quote.calculateTotals();
  await quote.save();

  console.log('✅ Generated Quote:', quote.quoteNumber, '| version:', quote.version);
  console.log('   Items:', quote.items.map((i) => `  - ${i.name}: ₪${i.totalPrice}`).join('\n'));
  console.log('   Total: ₪' + quote.total);
  console.log('\n🎉 Test passed.');
  console.log('\n--- For cURL test, use this Project ID:');
  console.log(projectDoc._id.toString());
}

run()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Test failed:', err);
    try {
      await mongoose.connection.close();
    } catch (_) { }
    process.exit(1);
  });
