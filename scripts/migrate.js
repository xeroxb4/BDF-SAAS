/**
 * Migration Script — Sales Rep Tracker → SaaS Platform
 * Run with: node --env-file=.env scripts/migrate.js
 * SAFE TO RUN MULTIPLE TIMES
 */

import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const TRACKER_URI   = process.env.TRACKER_URI  || 'mongodb+srv://xeroxb4_db_user:jpWqpiTT2fzGaj8c@cluster0.nkkflsy.mongodb.net/salesrep?appName=Cluster0';
const PLATFORM_URI  = process.env.MONGODB_URI;
const TEMP_PASSWORD = process.env.TEMP_REP_PASSWORD || 'Rep@1234';

if (!PLATFORM_URI) { console.error('❌  MONGODB_URI not set'); process.exit(1); }

async function migrate() {
  console.log('\n🔄  BDF Sales Tracker → SaaS Platform Migration');
  console.log('─'.repeat(55));

  const trackerConn  = await mongoose.createConnection(TRACKER_URI).asPromise();
  const platformConn = await mongoose.createConnection(PLATFORM_URI).asPromise();
  console.log('✅  Connected to both databases');

  const trackerDB  = trackerConn.db;
  const platformDB = platformConn.db;

  const company = await platformDB.collection('companies').findOne({ slug: 'beiersdorf-ghana' });
  if (!company) { console.error('❌  Run: npm run seed  first.'); process.exit(1); }
  console.log('🏢  Target company:', company.name);

  const firstDist = await platformDB.collection('distributors').findOne({ companyId: company._id, isActive: true });

  const trackerUsers  = await trackerDB.collection('users').find({}).toArray();
  const trackerShops  = await trackerDB.collection('shops').find({}).toArray();
  const trackerOrders = await trackerDB.collection('orders').find({}).toArray();

  console.log(`📊  Tracker: ${trackerUsers.length} users | ${trackerShops.length} shops | ${trackerOrders.length} orders`);

  // ── Print FULL order to understand structure ──────────────────────────────
  if (trackerOrders.length > 0) {
    console.log('\n🔍  Full order structure:');
    console.log(JSON.stringify(trackerOrders[0], null, 2));
  }

  // ── 1. Users (skip if already migrated) ──────────────────────────────────
  console.log('\n👥  Checking users...');
  const userIdMap   = {};  // tracker userId string → platform agent _id
  const hashedPw    = await bcrypt.hash(TEMP_PASSWORD, 12);
  let uCreated = 0, uSkipped = 0;

  for (const tu of trackerUsers) {
    const tId = String(tu._id);
    const isManager = (tu.role||'').toLowerCase() === 'manager';
    const username  = (tu.username || tu.name || 'user')
      .toLowerCase().replace(/\s+/g,'.').replace(/[^a-z0-9.]/g,'');

    const exists = await platformDB.collection('users').findOne({
      $or: [{ legacyId: tId }, { username }]
    });
    if (exists) {
      uSkipped++;
      // Still need the agentId mapping
      if (!isManager && exists.agentId) userIdMap[tId] = exists.agentId;
      continue;
    }

    const newUser = {
      username, password: hashedPw,
      fullName:  tu.name || tu.fullName || username,
      role:      isManager ? 'company_admin' : 'salesperson',
      companyId: company._id,
      email:     tu.email || undefined,
      phone:     tu.phone || undefined,
      isActive:  true, legacyId: tId,
      createdAt: new Date(), updatedAt: new Date(),
    };
    await platformDB.collection('users').insertOne(newUser);
    uCreated++;
    console.log(`   ✅  ${isManager?'Manager':'Rep'}: ${newUser.fullName} → ${username} / ${TEMP_PASSWORD}`);
  }
  console.log(`   Created: ${uCreated} | Skipped: ${uSkipped}`);

  // ── 2. Agents ──────────────────────────────────────────────────────────────
  console.log('\n🪪  Checking agents...');
  for (const tu of trackerUsers) {
    if ((tu.role||'').toLowerCase() === 'manager') continue;
    const tId = String(tu._id);

    let agent = await platformDB.collection('agents').findOne({ legacyId: tId });
    if (!agent && firstDist) {
      const r = await platformDB.collection('agents').insertOne({
        companyId: company._id, distributorId: firstDist._id,
        name: tu.name||tu.fullName||'Unknown', role: 'Salesman',
        phone: tu.phone||'', email: tu.email||'',
        isActive: true, legacyId: tId,
        createdAt: new Date(), updatedAt: new Date(),
      });
      agent = { _id: r.insertedId };
      console.log(`   ✅  Agent created: ${tu.name}`);
    }
    if (agent) {
      userIdMap[tId] = agent._id;
      await platformDB.collection('users').updateOne(
        { legacyId: tId },
        { $set: { agentId: agent._id } }
      );
    }
  }

  // ── 3. Shops ───────────────────────────────────────────────────────────────
  console.log('\n🏪  Checking shops...');
  const shopIdMap = {}; // tracker shop _id string → platform shop _id
  let sCreated = 0, sSkipped = 0;

  for (const ts of trackerShops) {
    const tId = String(ts._id);
    const exists = await platformDB.collection('shops').findOne({ legacyId: tId });
    if (exists) {
      shopIdMap[tId] = exists._id;
      sSkipped++; continue;
    }

    const repId   = String(ts.repId || '');
    const agentId = userIdMap[repId] || null;

    const r = await platformDB.collection('shops').insertOne({
      companyId:     company._id,
      distributorId: firstDist?._id || null,
      name:          ts.name || 'Unknown Shop',
      ownerName:     ts.owner || ts.ownerName || '',
      ownerContact:  ts.contact || ts.phone || '',
      address:       ts.location || ts.address || '',
      locationName:  ts.location || '',
      tin:           ts.tin || '',
      creditLimit:   Number(ts.creditLimit)||0,
      routeDays:     ts.routeDays || [],
      assignedAgent: agentId,
      creditBalance: 0,
      avcTier:       'none',
      isActive:      true,
      legacyId:      tId,
      createdAt:     new Date(ts.createdAt||Date.now()),
      updatedAt:     new Date(),
    });
    shopIdMap[tId] = r.insertedId;
    sCreated++;
    console.log(`   ✅  Shop: ${ts.name}`);
  }
  console.log(`   Created: ${sCreated} | Skipped: ${sSkipped}`);
  console.log('   Shop ID map:', Object.keys(shopIdMap).join(', '));

  // ── 4. Orders ──────────────────────────────────────────────────────────────
  // From the debug output we know:
  //   - orders have NO shopId field (it's undefined)
  //   - orders have repId → links to a rep
  //   - orders have distributor (string name, not ObjectId)
  // Strategy: assign order to the FIRST shop belonging to that rep
  // (since shopId is missing, this is the best we can do)
  console.log('\n📋  Migrating orders...');
  let oCreated = 0, oSkipped = 0, oFailed = 0;

  // Build repId → [shopIds] map from tracker shops
  const repShopMap = {};
  for (const ts of trackerShops) {
    const repId = String(ts.repId || '');
    if (!repShopMap[repId]) repShopMap[repId] = [];
    repShopMap[repId].push(String(ts._id));
  }
  console.log('   Rep→Shop map:', JSON.stringify(
    Object.fromEntries(Object.entries(repShopMap).map(([k,v])=>[k,v.length+' shops']))
  ));

  for (const to of trackerOrders) {
    const tOrderId = String(to._id);

    const exists = await platformDB.collection('orders').findOne({ legacyId: tOrderId });
    if (exists) { oSkipped++; continue; }

    const repId  = String(to.repId || '');
    const agentId = userIdMap[repId] || null;

    // shopId is undefined in tracker — find shop by repId
    let shopPlatId = null;
    const repShops = repShopMap[repId] || [];
    if (repShops.length > 0) {
      // Use first shop of this rep
      shopPlatId = shopIdMap[repShops[0]] || null;
    }

    // If still no shop — use any platform shop under this company
    if (!shopPlatId) {
      const anyShop = await platformDB.collection('shops').findOne({ companyId: company._id });
      if (anyShop) shopPlatId = anyShop._id;
    }

    if (!shopPlatId) {
      console.warn(`   ⚠️  Order ${to.orderNum} — no shop to assign, skipping`);
      oFailed++; continue;
    }

    const products = (to.products||[]).map(p => ({
      name:      p.name || 'Unknown',
      variant:   p.variant || p.size || '',
      qty:       Number(p.qty||p.quantity) || 0,
      unit:      p.unit || 'cartons',
      unitPrice: Number(p.unitPrice||p.price) || 0,
    }));

    const payments = (to.payments||[]).map(p => ({
      amount: Number(p.amount) || 0,
      date:   p.date || to.date || new Date().toISOString().slice(0,10),
      method: (p.note||'cash').toLowerCase().includes('momo') ? 'momo'
            : (p.note||'cash').toLowerCase().includes('cheque') ? 'cheque'
            : 'cash',
      note: p.note || '',
    }));

    const totalInv  = products.reduce((s,p) => s + p.qty * p.unitPrice, 0);
    const totalPaid = payments.reduce((s,p) => s + p.amount, 0);
    const balance   = Math.max(0, totalInv - totalPaid);

    await platformDB.collection('orders').insertOne({
      companyId:      company._id,
      distributorId:  firstDist?._id || null,
      shopId:         shopPlatId,
      agentId,
      orderNum:       to.orderNum || ('ORD-MIG-' + String(oCreated+1).padStart(4,'0')),
      date:           to.date || new Date().toISOString().slice(0,10),
      products,
      paymentType:    to.paymentType || 'cash',
      payments,
      creditWeeks:    to.creditWeeks || null,
      creditDue:      to.creditDue   || null,
      deliveryStatus: to.deliveryStatus || 'pending',
      deliveredAt:    to.deliveredAt ? new Date(to.deliveredAt) : undefined,
      notes:          to.notes || '',
      legacyId:       tOrderId,
      createdAt:      new Date(to.createdAt || to.date || Date.now()),
      updatedAt:      new Date(),
    });

    // Update shop credit balance
    if (to.paymentType === 'credit' && balance > 0) {
      await platformDB.collection('shops').updateOne(
        { _id: shopPlatId },
        { $inc: { creditBalance: balance } }
      );
    }

    oCreated++;
    console.log(`   ✅  Order ${to.orderNum} migrated (${products.length} products, ${payments.length} payments)`);
  }
  console.log(`   Created: ${oCreated} | Skipped: ${oSkipped} | Failed: ${oFailed}`);

  // ── DONE ──────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(55));
  console.log('✅  Migration complete!');
  console.log('─'.repeat(55));
  console.log('\n🔑  Migrated rep logins:');
  for (const tu of trackerUsers) {
    if ((tu.role||'').toLowerCase() !== 'manager') {
      const uname = (tu.username||tu.name||'user').toLowerCase().replace(/\s+/g,'.').replace(/[^a-z0-9.]/g,'');
      console.log(`    ${(tu.name||'').padEnd(28)} →  ${uname}  /  ${TEMP_PASSWORD}`);
    }
  }
  console.log('─'.repeat(55) + '\n');

  await trackerConn.close();
  await platformConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('\n❌  Migration failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
