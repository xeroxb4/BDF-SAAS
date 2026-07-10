import express from 'express';
import Stock from '../models/Stock.js';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';
import { audit } from './_crud.js';

const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {
    const f={};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    if(req.query.distributorId) f.distributorId=req.query.distributorId;
    res.json({status:'success', data: await Stock.find(f).populate('productId','name cat price isTop10 pcsPerPack pcsPerCarton').populate('distributorId','name')});
  } catch(e){ res.status(500).json({status:'error', message:e.message}); }
});
router.put('/:distributorId/:productId', async (req, res) => {
  try {
    const {distributorId, productId}=req.params;
    const entry=await Stock.findOneAndUpdate(
      {companyId:req.scopedCompanyId, distributorId, productId},
      {qty:Math.max(0,parseInt(req.body.qty)||0), updatedBy:req.user._id},
      {upsert:true, new:true}
    );
    res.json({status:'success', data:entry});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.post('/import/:distributorId', async (req, res) => {
  try {
    const {distributorId}=req.params;
    const {updates}=req.body;
    if(!Array.isArray(updates)||!updates.length) return res.status(400).json({status:'error', message:'No updates provided.'});
    const ops=updates.map(u=>({updateOne:{filter:{companyId:req.scopedCompanyId, distributorId, productId:u.productId}, update:{$set:{qty:Math.max(0,parseInt(u.qty)||0), updatedBy:req.user._id}}, upsert:true}}));
    await Stock.bulkWrite(ops);
    await audit(req,'IMPORT','stock',distributorId,'Imported '+updates.length+' stock entries');
    res.json({status:'success', message:updates.length+' entries updated.'});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
export default router;
