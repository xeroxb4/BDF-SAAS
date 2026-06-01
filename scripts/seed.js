/**
 * Seed Script — run with: npm run seed
 * Creates: 1 super_admin + 2 demo companies with full data sets
 */
import mongoose  from 'mongoose';
import bcrypt    from 'bcryptjs';
import Company   from '../server/models/Company.js';
import User      from '../server/models/User.js';
import Region    from '../server/models/Region.js';
import Distributor from '../server/models/Distributor.js';
import Agent     from '../server/models/Agent.js';
import Product   from '../server/models/Product.js';
import Stock     from '../server/models/Stock.js';
import Shop      from '../server/models/Shop.js';
import Dispatch  from '../server/models/Dispatch.js';
import Promotion from '../server/models/Promotion.js';
import SalesTarget from '../server/models/SalesTarget.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌  MONGODB_URI not set in .env'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // ── WIPE existing demo data ──────────────────────────────────────────────
  await Promise.all([
    Company.deleteMany({}), User.deleteMany({}), Region.deleteMany({}),
    Distributor.deleteMany({}), Agent.deleteMany({}), Product.deleteMany({}),
    Stock.deleteMany({}), Shop.deleteMany({}), Dispatch.deleteMany({}),
    Promotion.deleteMany({}), SalesTarget.deleteMany({}),
  ]);
  console.log('🧹  Cleared existing data');

  // ── SUPER ADMIN ──────────────────────────────────────────────────────────
  const superAdmin = await User.create({
    username: 'superadmin',
    password: 'Admin@1234',
    fullName: 'Platform Super Admin',
    role: 'super_admin',
  });
  console.log('👤  Super admin created  →  username: superadmin  |  password: Admin@1234');

  // ══════════════════════════════════════════════════════════
  // COMPANY 1 — Beiersdorf Ghana
  // ══════════════════════════════════════════════════════════
  const bdf = await Company.create({
    name: 'Beiersdorf Ghana',
    slug: 'beiersdorf-ghana',
    industry: 'FMCG — Personal Care',
    country: 'Ghana',
    currency: 'GH₵',
    accentColor: '#00e5ff',
    plan: 'pro',
    createdBy: superAdmin._id,
  });

  const bdfAdmin = await User.create({
    username: 'bdf_admin',
    password: 'Bdf@1234',
    fullName: 'Kofi Mensah',
    role: 'company_admin',
    companyId: bdf._id,
  });
  console.log('🏢  Beiersdorf Ghana created  →  username: bdf_admin  |  password: Bdf@1234');

  // Regions
  const [accraReg, ashReg] = await Region.insertMany([
    { companyId:bdf._id, name:'Greater Accra', description:'Accra Metro + Tema', createdBy:bdfAdmin._id },
    { companyId:bdf._id, name:'Ashanti',        description:'Kumasi & surrounding', createdBy:bdfAdmin._id },
  ]);

  // Distributors
  const [daady, kwesi, tema] = await Distributor.insertMany([
    { companyId:bdf._id, regionId:accraReg._id, name:'Daady Ash Ltd',        type:'Distributor', location:'Accra Central', address:'Ring Road Central, Accra', contact:'Asher Boateng',   phone:'+233 24 111 2233', whatsapp:'+233 24 111 2233', email:'daady@example.com' },
    { companyId:bdf._id, regionId:accraReg._id, name:'Kwesi Wholesale Hub',  type:'Wholesaler',  location:'Osu, Accra',    address:'Oxford Street, Osu',       contact:'Kwesi Appiah',     phone:'+233 20 333 4455', whatsapp:'+233 20 333 4455', email:'kwesi@example.com' },
    { companyId:bdf._id, regionId:ashReg._id,   name:'Tema Distribution Co', type:'Distributor', location:'Tema',          address:'Community 1, Tema',        contact:'Ama Darko',        phone:'+233 27 555 6677', whatsapp:'+233 27 555 6677', email:'tema@example.com'  },
  ]);

  // Products (Beiersdorf catalogue)
  // Packaging reference:
  // Roll-On:  6 pcs/Pk  × 5 Pks/Ctn  = 30 pcs/Ctn
  // Spray:    6 pcs/Pk  × 5 Pks/Ctn  = 30 pcs/Ctn  (150ml, 200ml, 250ml)
  // Lotion:   6 pcs/Pk  × 2 Pks/Ctn  = 12 pcs/Ctn
  // Cream:    6 pcs/Pk  × 2 Pks/Ctn  = 12 pcs/Ctn
  // Lip Balm: 6 pcs/Pk  × 4 Pks/Ctn  = 24 pcs/Ctn
  // Shower Gel:6 pcs/Pk × 2 Pks/Ctn  = 12 pcs/Ctn
  // Eucerin:  6 pcs/Pk  × 2 Pks/Ctn  = 12 pcs/Ctn
  // Plasters: 12 pcs/Pk × 2 Pks/Ctn  = 24 pcs/Ctn

  const ROLL_ON  = { pcsPerPack:6, packsPerCarton:5,  pcsPerCarton:30 };
  const SPRAY    = { pcsPerPack:6, packsPerCarton:5,  pcsPerCarton:30 };
  const LOTION   = { pcsPerPack:6, packsPerCarton:2,  pcsPerCarton:12 };
  const CREAM    = { pcsPerPack:6, packsPerCarton:2,  pcsPerCarton:12 };
  const LIP      = { pcsPerPack:6, packsPerCarton:4,  pcsPerCarton:24 };
  const SHOWER   = { pcsPerPack:6, packsPerCarton:2,  pcsPerCarton:12 };
  const EUCERIN  = { pcsPerPack:6, packsPerCarton:2,  pcsPerCarton:12 };
  const PLASTERS = { pcsPerPack:12,packsPerCarton:2,  pcsPerCarton:24 };

  const bdfProducts = await Product.insertMany([
    // ── DEODORANT ROLL-ONS ──────────────────────────────
    { companyId:bdf._id, name:'Nivea Men Deep Roll-On',         cat:'Deodorant Roll-On', sizeValue:50,  sizeUnit:'ml', price:18.50, ...ROLL_ON, imageUrl:'', isTop10:true,  top10Rank:1, minAgentQty:30, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Men Fresh Active Roll-On', cat:'Deodorant Roll-On', sizeValue:50,  sizeUnit:'ml', price:18.50, ...ROLL_ON, imageUrl:'', isTop10:true,  top10Rank:2, minAgentQty:30, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Whitening Roll-On',        cat:'Deodorant Roll-On', sizeValue:50,  sizeUnit:'ml', price:20.00, ...ROLL_ON, imageUrl:'', isTop10:true,  top10Rank:3, minAgentQty:30, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Pearl & Beauty Roll-On',   cat:'Deodorant Roll-On', sizeValue:25,  sizeUnit:'ml', price:11.00, ...ROLL_ON, imageUrl:'', isTop10:false },
    // ── DEODORANT SPRAYS ─────────────────────────────────
    { companyId:bdf._id, name:'Nivea Men Deep Spray',           cat:'Deodorant Spray',   sizeValue:150, sizeUnit:'ml', price:32.00, ...SPRAY,   imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Nivea Men Fresh Power Spray',    cat:'Deodorant Spray',   sizeValue:200, sizeUnit:'ml', price:38.00, ...SPRAY,   imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Nivea Black & White Spray',      cat:'Deodorant Spray',   sizeValue:250, sizeUnit:'ml', price:42.00, ...SPRAY,   imageUrl:'', isTop10:false },
    // ── BODY LOTIONS ─────────────────────────────────────
    { companyId:bdf._id, name:'Nivea Body Milk Original',       cat:'Body Lotion',        sizeValue:250, sizeUnit:'ml', price:38.00, ...LOTION,  imageUrl:'', isTop10:true,  top10Rank:6, minAgentQty:12, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Body Milk Shea',           cat:'Body Lotion',        sizeValue:400, sizeUnit:'ml', price:55.00, ...LOTION,  imageUrl:'', isTop10:true,  top10Rank:5, minAgentQty:12, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Body Lotion Aloe Vera',    cat:'Body Lotion',        sizeValue:500, sizeUnit:'ml', price:68.00, ...LOTION,  imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Nivea Body Lotion Soft',         cat:'Body Lotion',        sizeValue:600, sizeUnit:'ml', price:78.00, ...LOTION,  imageUrl:'', isTop10:false },
    // ── BODY CREAMS ──────────────────────────────────────
    { companyId:bdf._id, name:'Nivea Creme',                    cat:'Body Cream',         sizeValue:150, sizeUnit:'ml', price:32.00, ...CREAM,   imageUrl:'', isTop10:true,  top10Rank:4, minAgentQty:12, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Creme Large',              cat:'Body Cream',         sizeValue:400, sizeUnit:'ml', price:65.00, ...CREAM,   imageUrl:'', isTop10:false },
    // ── FACE CARE ────────────────────────────────────────
    { companyId:bdf._id, name:'Nivea Men Face Wash',            cat:'Face Care',          sizeValue:100, sizeUnit:'ml', price:28.00, ...CREAM,   imageUrl:'', isTop10:true,  top10Rank:7, minAgentQty:12, minShopQty:4  },
    { companyId:bdf._id, name:'Nivea SPF 30 Day Cream',         cat:'Face Care',          sizeValue:50,  sizeUnit:'ml', price:42.00, ...CREAM,   imageUrl:'', isTop10:true,  top10Rank:8, minAgentQty:12, minShopQty:3  },
    // ── LIP BALM ─────────────────────────────────────────
    { companyId:bdf._id, name:'Nivea Lip Balm Original',        cat:'Lip Care',           sizeValue:4.8, sizeUnit:'g',  price:12.00, ...LIP,     imageUrl:'', isTop10:true,  top10Rank:9, minAgentQty:24, minShopQty:6  },
    { companyId:bdf._id, name:'Nivea Lip Balm Strawberry',      cat:'Lip Care',           sizeValue:4.8, sizeUnit:'g',  price:12.00, ...LIP,     imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Nivea Lip Balm Cherry',          cat:'Lip Care',           sizeValue:4.8, sizeUnit:'g',  price:12.00, ...LIP,     imageUrl:'', isTop10:false },
    // ── SHOWER GEL ───────────────────────────────────────
    { companyId:bdf._id, name:'Nivea Shower Gel Fresh',         cat:'Shower Gel',         sizeValue:250, sizeUnit:'ml', price:25.00, ...SHOWER,  imageUrl:'', isTop10:true,  top10Rank:10,minAgentQty:12, minShopQty:4  },
    { companyId:bdf._id, name:'Nivea Men Shower Gel Deep',      cat:'Shower Gel',         sizeValue:250, sizeUnit:'ml', price:27.00, ...SHOWER,  imageUrl:'', isTop10:false },
    // ── EUCERIN ──────────────────────────────────────────
    { companyId:bdf._id, name:'Eucerin Even Brighter Serum',    cat:'Eucerin',            sizeValue:30,  sizeUnit:'ml', price:195.00,...EUCERIN, imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Eucerin Hyaluron-Filler Day',    cat:'Eucerin',            sizeValue:50,  sizeUnit:'ml', price:220.00,...EUCERIN, imageUrl:'', isTop10:false },
    // ── PLASTERS ─────────────────────────────────────────
    { companyId:bdf._id, name:'Hansaplast Classic Roll',         cat:'Plasters',          sizeValue:5,   sizeUnit:'pcs',price:8.00,  ...PLASTERS,imageUrl:'', isTop10:false },
    { companyId:bdf._id, name:'Hansaplast Sensitive Strips',     cat:'Plasters',          sizeValue:20,  sizeUnit:'pcs',price:10.00, ...PLASTERS,imageUrl:'', isTop10:false },
  ]);

  // Agents
  const bdfAgents = await Agent.insertMany([
    { companyId:bdf._id, distributorId:daady._id, name:'Emmanuel Asante',  role:'OMR',      phone:'+233 24 700 1122', whatsapp:'+233 24 700 1122', email:'e.asante@bdf.com',  address:'Adenta, Accra',   emergency:'Grace Asante +233 24 700 1133' },
    { companyId:bdf._id, distributorId:daady._id, name:'Abena Owusu',      role:'Salesman',  phone:'+233 20 800 3344', whatsapp:'+233 20 800 3344', email:'a.owusu@bdf.com',   address:'Madina, Accra',   emergency:'Kwame Owusu +233 20 800 3355' },
    { companyId:bdf._id, distributorId:kwesi._id, name:'Joseph Darko',     role:'Salesman',  phone:'+233 27 900 5566', whatsapp:'+233 27 900 5566', email:'j.darko@bdf.com',   address:'Osu, Accra',      emergency:'Mary Darko +233 27 900 5577'  },
    { companyId:bdf._id, distributorId:tema._id,  name:'Fatima Al-Hassan', role:'OMR',       phone:'+233 24 600 7788', whatsapp:'+233 24 600 7788', email:'f.hassan@bdf.com',  address:'Tema Comm.4',     emergency:'Ibrahim Hassan +233 24 600 7799' },
    { companyId:bdf._id, distributorId:tema._id,  name:'Kofi Acheampong',  role:'Salesman',  phone:'+233 20 500 9900', whatsapp:'+233 20 500 9900', email:'k.acheampong@bdf.com', address:'Tema Comm.2',  emergency:'Akua Acheampong +233 20 500 9911' },
  ]);
  const [emmanuel, abena, joseph, fatima, kofiA] = bdfAgents;

  // Shops for Daady distributor
  const daadyShops = await Shop.insertMany([
    { companyId:bdf._id, distributorId:daady._id, assignedAgent:emmanuel._id, name:'Kwame Supermart',       ownerName:'Kwame Boateng',  ownerContact:'+233 24 111 9900', address:'Kaneshie Market, Accra', locationName:'Kaneshie',  avcTier:'gold',   creditBalance:0     },
    { companyId:bdf._id, distributorId:daady._id, assignedAgent:emmanuel._id, name:'Akosua General Store',  ownerName:'Akosua Fofie',   ownerContact:'+233 20 222 3344', address:'Lapaz, Accra',           locationName:'Lapaz',     avcTier:'silver', creditBalance:0     },
    { companyId:bdf._id, distributorId:daady._id, assignedAgent:abena._id,    name:'Mensah Cosmetics',      ownerName:'Yaw Mensah',     ownerContact:'+233 27 333 5566', address:'Circle, Accra',          locationName:'Circle',    avcTier:'bronze', creditBalance:120   },
    { companyId:bdf._id, distributorId:daady._id, assignedAgent:abena._id,    name:'Ghana Pride Beauty',    ownerName:'Esi Agyemang',   ownerContact:'+233 24 444 7788', address:'Nungua, Accra',          locationName:'Nungua',    avcTier:'none',   creditBalance:0     },
    { companyId:bdf._id, distributorId:daady._id, assignedAgent:abena._id,    name:'Bright Pharmacy',       ownerName:'Dr. Bright Kusi',ownerContact:'+233 20 555 8899', address:'East Legon, Accra',      locationName:'East Legon',avcTier:'gold',   creditBalance:0     },
  ]);

  // Shops for Kwesi distributor
  const kwesiShops = await Shop.insertMany([
    { companyId:bdf._id, distributorId:kwesi._id, assignedAgent:joseph._id, name:'Osu Minimart',          ownerName:'Adwoa Asare',    ownerContact:'+233 24 666 0011', address:'Oxford Street, Osu',    locationName:'Osu',      avcTier:'silver', creditBalance:0    },
    { companyId:bdf._id, distributorId:kwesi._id, assignedAgent:joseph._id, name:'La Beauty Spot',        ownerName:'Kojo Lartey',    ownerContact:'+233 20 777 2233', address:'La Beach Road, Accra',  locationName:'La',       avcTier:'none',   creditBalance:350  },
    { companyId:bdf._id, distributorId:kwesi._id, assignedAgent:joseph._id, name:'Airport Wholesale',     ownerName:'Patricia Addae', ownerContact:'+233 27 888 4455', address:'Airport Hills, Accra',  locationName:'Airport',  avcTier:'gold',   creditBalance:0    },
  ]);

  // Shops for Tema distributor
  const temaShops = await Shop.insertMany([
    { companyId:bdf._id, distributorId:tema._id, assignedAgent:fatima._id,  name:'Tema Central Stores',  ownerName:'Bashir Mahama',  ownerContact:'+233 24 101 2233', address:'Community 1, Tema',     locationName:'Tema C1',  avcTier:'silver', creditBalance:0    },
    { companyId:bdf._id, distributorId:tema._id, assignedAgent:fatima._id,  name:'Habiba Cosmetics',     ownerName:'Habiba Alidu',   ownerContact:'+233 20 202 3344', address:'Community 5, Tema',     locationName:'Tema C5',  avcTier:'none',   creditBalance:85   },
    { companyId:bdf._id, distributorId:tema._id, assignedAgent:kofiA._id,   name:'Meridian Pharmacy',    ownerName:'Dr. Kwame Kusi', ownerContact:'+233 27 303 5566', address:'Community 9, Tema',     locationName:'Tema C9',  avcTier:'gold',   creditBalance:0    },
  ]);

  // Stock — seed realistic quantities
  const stockEntries = [];
  const allDists = [daady, kwesi, tema];
  for (const dist of allDists) {
    for (const prod of bdfProducts) {
      const qty = Math.floor(Math.random()*80)+5;
      stockEntries.push({ companyId:bdf._id, distributorId:dist._id, productId:prod._id, qty, updatedBy:bdfAdmin._id });
    }
  }
  await Stock.insertMany(stockEntries);

  // Dispatches — last 30 days
  const allAgents = [emmanuel, abena, joseph, fatima, kofiA];
  const dispatchDocs = [];
  for (let i=29; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const dateStr = d.toISOString().split('T')[0];
    // 3-6 dispatches per day
    const count = Math.floor(Math.random()*4)+3;
    for (let j=0; j<count; j++) {
      const agent  = allAgents[Math.floor(Math.random()*allAgents.length)];
      const dist   = allDists.find(d=>d._id.equals(agent.distributorId));
      const prod   = bdfProducts[Math.floor(Math.random()*bdfProducts.length)];
      const qty    = Math.floor(Math.random()*15)+1;
      dispatchDocs.push({
        companyId:bdf._id, distributorId:dist._id,
        agentId:agent._id, productId:prod._id,
        date:dateStr, qty, price:prod.price,
        confirmed: Math.random()>0.3,
        createdBy:bdfAdmin._id,
      });
    }
  }
  await Dispatch.insertMany(dispatchDocs);

  // Sales targets
  const now = new Date();
  for (const agent of allAgents) {
    await SalesTarget.create({
      companyId:bdf._id, distributorId:agent.distributorId, agentId:agent._id,
      month:now.getMonth()+1, year:now.getFullYear(),
      monthlyTarget:15000,
      weeklyTargets:{ wk1:3000, wk2:3000, wk3:3500, wk4:3000, wk5:2500 },
      createdBy:bdfAdmin._id,
    });
  }

  // AVC Promotion
  await Promotion.create({
    companyId: bdf._id, name:'Nivea AVC 2025', code:'NIVAVC25',
    description:'Annual Volume Commitment promotion for outlet loyalty',
    tiers:[
      { name:'Gold',   minSpend:5000, rewardValue:500, durationMonths:3, color:'#ffb300' },
      { name:'Silver', minSpend:2500, rewardValue:200, durationMonths:3, color:'#90a4ae' },
      { name:'Bronze', minSpend:1000, rewardValue:75,  durationMonths:3, color:'#a1887f' },
    ],
    isActive:true, startDate:'2025-01-01', endDate:'2025-12-31',
    createdBy:bdfAdmin._id,
  });

  // ══════════════════════════════════════════════════════════
  // COMPANY 2 — Unilever Ghana
  // ══════════════════════════════════════════════════════════
  const unilever = await Company.create({
    name: 'Unilever Ghana',
    slug: 'unilever-ghana',
    industry: 'FMCG — Home & Personal Care',
    country: 'Ghana',
    currency: 'GH₵',
    accentColor: '#1565c0',
    plan: 'starter',
    createdBy: superAdmin._id,
  });

  const uniAdmin = await User.create({
    username: 'uni_admin',
    password: 'Uni@1234',
    fullName: 'Ama Serwaa',
    role: 'company_admin',
    companyId: unilever._id,
  });
  console.log('🏢  Unilever Ghana created   →  username: uni_admin   |  password: Uni@1234');

  const uniRegion = await Region.create({ companyId:unilever._id, name:'Greater Accra', createdBy:uniAdmin._id });
  const uniDist   = await Distributor.create({
    companyId:unilever._id, regionId:uniRegion._id, name:'Accra Premier Distributors',
    type:'Distributor', location:'Accra', contact:'Samuel Frimpong',
    phone:'+233 24 900 1234', email:'apd@example.com',
  });
  const uniProds = await Product.insertMany([
    { companyId:unilever._id, name:'Dove Soap 100g',          cat:'Soap',       price:12.00 },
    { companyId:unilever._id, name:'OMO Powder 500g',         cat:'Detergent',  price:22.00 },
    { companyId:unilever._id, name:'Rexona Roll-On 50ml',     cat:'Deodorant',  price:17.50 },
    { companyId:unilever._id, name:'Sunsilk Shampoo 200ml',   cat:'Hair Care',  price:20.00 },
    { companyId:unilever._id, name:'Vaseline Lotion 400ml',   cat:'Body Care',  price:40.00 },
  ]);
  const uniAgent = await Agent.create({
    companyId:unilever._id, distributorId:uniDist._id,
    name:'Kwabena Osei', role:'Salesman',
    phone:'+233 24 800 5678', email:'k.osei@unilever.com',
  });
  await Shop.insertMany([
    { companyId:unilever._id, distributorId:uniDist._id, assignedAgent:uniAgent._id, name:'Accra Mall Stores',    ownerName:'Nana Agyeman',  ownerContact:'+233 24 100 2200', locationName:'Accra Mall' },
    { companyId:unilever._id, distributorId:uniDist._id, assignedAgent:uniAgent._id, name:'West Hills Supermart', ownerName:'Kwesi Poku',    ownerContact:'+233 20 200 3300', locationName:'Weija'      },
  ]);
  for (const prod of uniProds) {
    await Stock.create({ companyId:unilever._id, distributorId:uniDist._id, productId:prod._id, qty:Math.floor(Math.random()*50)+10 });
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!\n');
  console.log('─────────────────────────────────────────────────────────');
  console.log('  LOGIN CREDENTIALS');
  console.log('─────────────────────────────────────────────────────────');
  console.log('  super_admin    →  superadmin  /  Admin@1234');
  console.log('  Beiersdorf     →  bdf_admin   /  Bdf@1234');
  console.log('  Unilever       →  uni_admin   /  Uni@1234');
  console.log('─────────────────────────────────────────────────────────\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌  Seed failed:', err); process.exit(1); });
