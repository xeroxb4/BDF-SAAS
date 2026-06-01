import express from 'express';
import protect  from '../middleware/auth.js';
import scope    from '../middleware/scopeCompany.js';
import { Shop, ShopSale, audit } from './_shared.js';

const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {
    const filter = { isActive:true };
    if (req.scopedCompanyId)    filter.companyId     = req.scopedCompanyId;
    if (req.query.distributorId) filter.distributorId = req.query.distributorId;
    if (req.query.agentId)       filter.assignedAgent  = req.query.agentId;
    const list = await Shop.find(filter)
      .populate('distributorId','name location')
      .populate('assignedAgent','name role')
      .sort({ name:1 });
    res.json({ status:'success', data: list });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Shop.create({ ...req.body, companyId:req.scopedCompanyId, createdBy:req.user._id });
    await audit(req,'CREATE','shop',doc._id,`Created shop: ${doc.name}`);
    res.status(201).json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Shop.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      req.body, { new:true, runValidators:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'UPDATE','shop',doc._id,`Updated shop: ${doc.name}`);
    res.json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Shop.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { isActive:false }, { new:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'DELETE','shop',doc._id,`Removed shop: ${doc.name}`);
    res.json({ status:'success', message:'Shop removed.' });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

// ─── SHOP SALES ───────────────────────────────────────────────────────────────
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await ShopSale.find({ shopId:req.params.id, companyId:req.scopedCompanyId })
      .populate('productId','name cat price')
      .populate('agentId','name role')
      .sort({ date:-1 });
    res.json({ status:'success', data: sales });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/:id/sales', async (req, res) => {
  try {
    const sale = await ShopSale.create({
      ...req.body, shopId:req.params.id,
      companyId:req.scopedCompanyId, createdBy:req.user._id,
    });
    if (!sale.isPaid) {
      await Shop.findByIdAndUpdate(req.params.id, { $inc:{ creditBalance: sale.qty * sale.price } });
    }
    res.status(201).json({ status:'success', data: sale });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

// PATCH /api/shops/:id/pay  — mark credit as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const shop = await Shop.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { $inc:{ creditBalance: -(parseFloat(amount)||0) } },
      { new:true }
    );
    if (!shop) return res.status(404).json({ status:'error', message:'Not found.' });
    res.json({ status:'success', data: shop });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

export default router;
