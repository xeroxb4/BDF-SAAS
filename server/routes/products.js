import express from 'express';

import Product from '../models/Product.js';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';
import { audit } from './_crud.js';

import protect  from '../middleware/auth.js';
import scope    from '../middleware/scopeCompany.js';
import { Product, audit } from './_shared.js';


const router = express.Router();
router.use(protect, scope);

router.get('/', async (req, res) => {
  try {

    const f={isActive:true};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    res.json({status:'success', data: await Product.find(f).sort({cat:1, name:1})});
  } catch(e){ res.status(500).json({status:'error', message:e.message}); }
});
router.post('/', async (req, res) => {
  try {
    const body={...req.body, companyId:req.scopedCompanyId, createdBy:req.user._id};
    if(body.pcsPerPack && body.packsPerCarton) body.pcsPerCarton=body.pcsPerPack*body.packsPerCarton;
    const doc=await Product.create(body);
    await audit(req,'CREATE','product',doc._id,'Created: '+doc.name);
    res.status(201).json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.put('/:id', async (req, res) => {
  try {
    const body={...req.body};
    if(body.pcsPerPack && body.packsPerCarton) body.pcsPerCarton=body.pcsPerPack*body.packsPerCarton;
    const doc=await Product.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, body, {new:true, runValidators:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    await audit(req,'UPDATE','product',doc._id,'Updated: '+doc.name);
    res.json({status:'success', data:doc});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});
router.delete('/:id', async (req, res) => {
  try {
    const doc=await Product.findOneAndUpdate({_id:req.params.id, companyId:req.scopedCompanyId}, {isActive:false}, {new:true});
    if(!doc) return res.status(404).json({status:'error', message:'Not found.'});
    res.json({status:'success', message:'Removed.'});
  } catch(e){ res.status(400).json({status:'error', message:e.message}); }
});

    const filter = { isActive:true };
    if (req.scopedCompanyId) filter.companyId = req.scopedCompanyId;
    const list = await Product.find(filter).sort({ cat:1, name:1 });
    res.json({ status:'success', data: list });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Product.create({ ...req.body, companyId: req.scopedCompanyId, createdBy: req.user._id });
    await audit(req,'CREATE','product',doc._id,`Created product: ${doc.name}`);
    res.status(201).json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Product.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      req.body, { new:true, runValidators:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'UPDATE','product',doc._id,`Updated product: ${doc.name}`);
    res.json({ status:'success', data: doc });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Product.findOneAndUpdate(
      { _id:req.params.id, companyId:req.scopedCompanyId },
      { isActive:false }, { new:true }
    );
    if (!doc) return res.status(404).json({ status:'error', message:'Not found.' });
    await audit(req,'DELETE','product',doc._id,`Removed product: ${doc.name}`);
    res.json({ status:'success', message:'Product removed.' });
  } catch(e) { res.status(400).json({ status:'error', message:e.message }); }
});


export default router;
