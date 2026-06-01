import express  from 'express';
import protect  from '../middleware/auth.js';
import scope    from '../middleware/scopeCompany.js';
import { Dispatch, audit } from './_shared.js';

const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.scopedCompanyId)    filter.companyId     = req.scopedCompanyId;
    if (req.query.distributorId) filter.distributorId = req.query.distributorId;
    if (req.query.agentId)       filter.agentId       = req.query.agentId;
    if (req.query.from||req.query.to){
      filter.date={};
      if(req.query.from) filter.date.$gte=req.query.from;
      if(req.query.to)   filter.date.$lte=req.query.to;
    }
    const list = await Dispatch.find(filter)
      .populate('distributorId','name location')
      .populate('agentId','name role')
      .populate('productId','name cat price')
      .populate('shopId','name locationName')
      .sort({ date:-1, createdAt:-1 });
    res.json({ status:'success', data: list });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Dispatch.create({ ...req.body, companyId:req.scopedCompanyId, createdBy:req.user._id });
    res.status(201).json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.patch('/:id/confirm', async (req, res) => {
  try {
    const doc = await Dispatch.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { confirmed:true, confirmedAt:new Date(), confirmedBy:req.user._id },
      { new:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    res.json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Dispatch.findOneAndDelete({ _id:req.params.id, companyId:req.scopedCompanyId });
    res.json({ status:'success', message:'Deleted.' });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

export default router;
