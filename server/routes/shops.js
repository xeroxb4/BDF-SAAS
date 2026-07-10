import express from 'express';
import Shop from '../models/Shop.js';
import ShopSale from '../models/ShopSale.js';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';
import { audit } from './_crud.js';

const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {
    const f={isActive:true};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    if(req.query.distributorId) f.distributorId=req.query.distributorId;
    if(req.query.agentId) f.assignedAgent=req.query.agentId;
    res.json({status:'success', data: await Shop.find(f).populate('distributorId','name location').populate('assignedAgent','name role').sort({name:1})});
  } catch(e){ res.status(500).json({status:'error', message:e.message}); }
});
router.post('/', async (req, res) => {
  try {
    const doc=await Shop.create({...req.body, companyId:req.scopedCompanyId, createdBy:req.user._id});
    await audit(req,'CREATE','shop',doc._id,'Created shop: '+doc.name);
    res.status(201).json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.put('/:id', async (req, res) => {
  try {
    const doc=await Shop.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, req.body, {new:true, runValidators:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    res.json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.delete('/:id', async (req, res) => {
  try {
    const doc=await Shop.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, {isActive:false}, {new:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    res.json({status:'success', message:'Removed.'});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.patch('/:id/pay', async (req, res) => {
  try {
    const shop=await Shop.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, {$inc:{creditBalance:-(parseFloat(req.body.amount)||0)}}, {new:true});
    if(!shop) return res.status(404).json({status:'error', message:'Not found.'});
    res.json({status:'success', data:shop});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
export default router;
