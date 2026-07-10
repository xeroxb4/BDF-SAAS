
/**
 * Fix Script — Links salesperson users to their agent records
 * Run: node --env-file=.env scripts/fix_agent_links.js
 */
import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI;
if (!URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

async function fix() {
  await mongoose.connect(URI);
  console.log('✅ Connected');
  const db = mongoose.connection.db;

  // Find all salesperson users
  const users = await db.collection('users').find({ role: 'salesperson' }).toArray();
  console.log(`Found ${users.length} salesperson users`);

  for (const user of users) {
    // Check if already linked
    if (user.agentId) {
      const agent = await db.collection('agents').findOne({ _id: user.agentId });
      if (agent) {
        console.log(`✅ ${user.fullName} already linked to agent: ${agent.name}`);
        continue;
      }
    }

    // Try to find agent by legacyId or name
    let agent = null;
    if (user.legacyId) {
      agent = await db.collection('agents').findOne({ legacyId: user.legacyId });
    }
    if (!agent) {
      agent = await db.collection('agents').findOne({ 
        name: { $regex: new RegExp(user.fullName, 'i') }
      });
    }

    if (agent) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { agentId: agent._id } }
      );
      console.log(`✅ Linked ${user.fullName} → agent: ${agent.name} (${agent._id})`);
    } else {
      // Create agent record for this user
      const company = await db.collection('companies').findOne({ _id: user.companyId });
      const dist    = await db.collection('distributors').findOne({ 
        companyId: user.companyId, isActive: true 
      });
      
      if (dist) {
        const result = await db.collection('agents').insertOne({
          companyId:     user.companyId,
          distributorId: dist._id,
          name:          user.fullName,
          role:          'Salesman',
          phone:         user.phone || '',
          email:         user.email || '',
          isActive:      true,
          legacyId:      user.legacyId || null,
          createdAt:     new Date(),
          updatedAt:     new Date(),
        });
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { agentId: result.insertedId } }
        );
        console.log(`✅ Created & linked agent for: ${user.fullName}`);
      } else {
        console.log(`⚠️  No distributor found for ${user.fullName} — skipping`);
      }
    }
  }

  // Show all users and their agent links
  console.log('\n📋 Final state:');
  const allUsers = await db.collection('users').find({ role: 'salesperson' }).toArray();
  for (const u of allUsers) {
    const agent = u.agentId ? await db.collection('agents').findOne({ _id: u.agentId }) : null;
    console.log(`   ${u.username.padEnd(20)} → agentId: ${u.agentId||'NONE'} | agent name: ${agent?.name||'NOT FOUND'}`);
  }

  console.log('\n✅ Done!');
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(e => { console.error('❌', e.message); process.exit(1); });
