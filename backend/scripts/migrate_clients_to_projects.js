require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Client = require('../src/models/Client');
const Project = require('../src/models/Project');
const Invoice = require('../src/models/Invoice');

/**
 * Client.status -> Project.stage mapping
 */
const CLIENT_STATUS_TO_STAGE = {
  new_lead: 'lead',
  contacted: 'lead',
  engaged: 'assessment',
  meeting_set: 'assessment',
  proposal_sent: 'proposal',
  won: 'active',
  lost: 'archived'
};

/**
 * Compute financials from paymentPlan and orders
 */
function computeFinancials(client) {
  const currency = client.paymentPlan?.currency || 'ILS';

  let totalValue = 0;
  if (client.paymentPlan?.totalAmount && client.paymentPlan.totalAmount > 0) {
    totalValue = client.paymentPlan.totalAmount;
  } else if (client.orders?.length) {
    totalValue = client.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  let paidAmount = 0;
  if (client.paymentPlan?.installments?.length) {
    paidAmount = client.paymentPlan.installments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.paidAmount || i.amount || 0), 0);
  }

  const balance = totalValue - paidAmount;

  return { totalValue, paidAmount, balance, currency };
}

/**
 * Check if client has transactional data to migrate
 */
function hasTransactionalData(client) {
  const hasOrders = client.orders?.length > 0;
  const hasPaymentPlan =
    (client.paymentPlan?.installments?.length > 0) || (client.paymentPlan?.totalAmount > 0);
  return hasOrders || hasPaymentPlan;
}

/**
 * Generate project name for migration
 */
function generateProjectName(client) {
  const businessName = client.businessInfo?.businessName || 'לקוח';
  const year = new Date().getFullYear();
  return `פרויקט עבור ${businessName} - ${year}`;
}

/**
 * Main migration logic
 */
async function run(dryRun = false) {
  console.log('🔄 Migrating Client transactional data to Projects...');
  if (dryRun) {
    console.log('⚠️  DRY RUN - no data will be created');
  }

  await connectDB();

  const clients = await Client.find({
    $or: [
      { 'orders.0': { $exists: true } },
      { 'paymentPlan.installments.0': { $exists: true } },
      { 'paymentPlan.totalAmount': { $gt: 0 } }
    ]
  })
    .select('personalInfo businessInfo orders paymentPlan assessmentForm status metadata')
    .lean();

  console.log(`📊 Found ${clients.length} clients with transactional data`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const client of clients) {
    if (!hasTransactionalData(client)) {
      skipped++;
      continue;
    }

    const projectName = generateProjectName(client);

    try {
      const existingProject = await Project.findOne({
        clientId: client._id,
        name: projectName
      });

      if (existingProject) {
        console.log(`⏭️  Skip: Project already exists for client ${client._id} (${projectName})`);
        skipped++;
        continue;
      }

      const stage = CLIENT_STATUS_TO_STAGE[client.status] || 'lead';
      const financials = computeFinancials(client);

      const projectData = {
        name: projectName,
        description: `פרויקט שנוצר בהגירה מ-Client ${client._id}`,
        clientId: client._id,
        ownerId: client.metadata?.assignedTo || null,
        stage,
        status: stage,
        orders: client.orders || [],
        paymentPlan: client.paymentPlan || {},
        assessmentSnapshot: client.assessmentForm || undefined,
        financials,
        startDate: new Date(),
        color: '#1976d2'
      };

      let newProject = null;
      if (!dryRun) {
        newProject = await Project.create(projectData);

        const invoiceIds = (client.paymentPlan?.installments || [])
          .map((i) => i.invoiceId)
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

        if (invoiceIds.length > 0) {
          await Invoice.updateMany(
            { _id: { $in: invoiceIds } },
            { $set: { projectId: newProject._id } }
          );
        }
      }

      console.log(
        `✅ ${dryRun ? '[DRY-RUN] Would create' : 'Created'} Project for ${client.businessInfo?.businessName || client._id} -> ${stage}`
      );
      created++;
    } catch (err) {
      console.error(`❌ Error migrating client ${client._id}:`, err.message);
      errors++;
    }
  }

  console.log('\n📊 Migration summary:');
  console.log(`  - Created: ${created}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Errors: ${errors}`);
  if (dryRun && created > 0) {
    console.log('\n⚠️  Run without --dry-run to apply changes');
  } else {
    console.log('\n🎉 Done.');
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  await run(dryRun);
}

main()
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
