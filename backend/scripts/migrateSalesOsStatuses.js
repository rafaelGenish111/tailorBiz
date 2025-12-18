require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

const Client = require('../src/models/Client');

/**
 * ממיר סטטוסים ישנים (Legacy) לסטטוסים של Sales OS
 */
const STATUS_MAP = {
  // Legacy lead pipeline
  lead: 'new_lead',
  contacted: 'contacted',
  assessment_scheduled: 'meeting_set',
  assessment_completed: 'engaged',
  proposal_sent: 'proposal_sent',

  // Legacy stages שלא קיימים יותר
  negotiation: 'proposal_sent',
  on_hold: 'contacted',

  // Legacy client stages → closed/won
  active_client: 'won',
  in_development: 'won',
  completed: 'won',

  // Legacy churn → lost
  churned: 'lost',

  // Already supported
  won: 'won',
  lost: 'lost',

  // New Sales OS (idempotent)
  new_lead: 'new_lead',
  engaged: 'engaged',
  meeting_set: 'meeting_set',
};

async function run() {
  console.log('🔄 Migrating Client.status to Sales OS...');

  await connectDB();

  const legacyStatuses = Object.keys(STATUS_MAP);

  // נספור כמה יש מכל סטטוס לפני
  const beforeAgg = await Client.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('📊 Status counts (before):');
  for (const row of beforeAgg) {
    console.log(`  - ${row._id}: ${row.count}`);
  }

  let totalModified = 0;

  // עדכונים ממוקדים לכל סטטוס (כדי להימנע מעדכון-יתר)
  for (const [from, to] of Object.entries(STATUS_MAP)) {
    if (from === to) continue;

    const res = await Client.updateMany(
      { status: from },
      { $set: { status: to } }
    );

    const modified = res.modifiedCount ?? res.nModified ?? 0;
    if (modified > 0) {
      console.log(`✅ ${from} → ${to}: updated ${modified}`);
      totalModified += modified;
    }
  }

  // אם יש סטטוס ריק/לא מוגדר
  const missingRes = await Client.updateMany(
    {
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: '' },
      ],
    },
    { $set: { status: 'new_lead' } }
  );
  const missingModified = missingRes.modifiedCount ?? missingRes.nModified ?? 0;
  if (missingModified > 0) {
    console.log(`✅ (missing) → new_lead: updated ${missingModified}`);
    totalModified += missingModified;
  }

  // נספור אחרי
  const afterAgg = await Client.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('📊 Status counts (after):');
  for (const row of afterAgg) {
    console.log(`  - ${row._id}: ${row.count}`);
  }

  console.log(`🎉 Done. Total updated: ${totalModified}`);
}

run()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Migration failed:', err);
    try {
      await mongoose.connection.close();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  });
