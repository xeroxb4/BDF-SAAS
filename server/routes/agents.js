import express from 'express';
import protect  from '../middleware/auth.js';
import scope    from '../middleware/scopeCompany.js';
import { Agent, audit } from './_shared.js';

const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {
    const filter = { isActive:true };
    if (req.scopedCompanyId)    filter.companyId     = req.scopedCompanyId;
    if (req.query.distributorId) filter.distributorId = req.query.distributorId;
    const list = await Agent.find(filter)
      .populate('distributorId','name location type')
      .sort({ name:1 });
    res.json({ status:'success', data: list });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Agent.create({ ...req.body, companyId: req.scopedCompanyId, createdBy: req.user._id });
    const pop = await Agent.findById(doc._id).populate('distributorId','name location type');
    await audit(req,'CREATE','agent',doc._id,`Created ${doc.role}: ${doc.name}`);
    res.status(201).json({ status:'success', data: pop });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Agent.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      req.body, { new:true, runValidators:true }
    ).populate('distributorId','name location type');
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'UPDATE','agent',doc._id,`Updated ${doc.role}: ${doc.name}`);
    res.json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Agent.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { isActive:false }, { new:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'DELETE','agent',doc._id,`Removed ${doc.role}: ${doc.name}`);
    res.json({ status:'success', message:'Agent removed.' });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

export default router;
