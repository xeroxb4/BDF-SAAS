import express from 'express';

import Distributor from '../models/Distributor.js';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';
import { audit } from './_crud.js';

import protect  from '../middleware/auth.js';
import scope    from '../middleware/scopeCompany.js';
import { Distributor, audit } from './_shared.js';


const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {

    const f={isActive:true};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    if(req.query.regionId) f.regionId=req.query.regionId;
    res.json({status:'success', data: await Distributor.find(f).populate('regionId','name').sort({name:1})});
  } catch(e){ res.status(500).json({status:'error', message:e.message}); }
});
router.post('/', async (req, res) => {
  try {
    const doc=await Distributor.create({...req.body, companyId:req.scopedCompanyId, createdBy:req.user._id});
    await audit(req,'CREATE','distributor',doc._id,'Created distributor: '+doc.name);
    res.status(201).json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.put('/:id', async (req, res) => {
  try {
    const doc=await Distributor.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, req.body, {new:true, runValidators:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    await audit(req,'UPDATE','distributor',doc._id,'Updated distributor: '+doc.name);
    res.json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.delete('/:id', async (req, res) => {
  try {
    const doc=await Distributor.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, {isActive:false}, {new:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    await audit(req,'DELETE','distributor',doc._id,'Removed: '+doc.name);
    res.json({status:'success', message:'Removed.'});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});

    const filter = { isActive:true };
    if (req.scopedCompanyId) filter.companyId = req.scopedCompanyId;
    if (req.query.regionId) filter.regionId = req.query.regionId;
    const list = await Distributor.find(filter)
      .populate('regionId','name')
      .sort({ name:1 });
    res.json({ status:'success', data: list });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Distributor.create({ ...req.body, companyId: req.scopedCompanyId, createdBy: req.user._id });
    await audit(req,'CREATE','distributor',doc._id,`Created distributor: ${doc.name}`);
    res.status(201).json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Distributor.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      req.body, { new:true, runValidators:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'UPDATE','distributor',doc._id,`Updated distributor: ${doc.name}`);
    res.json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Distributor.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { isActive:false }, { new:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'DELETE','distributor',doc._id,`Removed distributor: ${doc.name}`);
    res.json({ status:'success', message:'Distributor removed.' });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});


export default router;
