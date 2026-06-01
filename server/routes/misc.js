import express    from 'express';
import protect    from '../middleware/auth.js';
import scope      from '../middleware/scopeCompany.js';
import requireRole from '../middleware/requireRole.js';
import { SalesTarget, RoutePlan, Promotion, Region, audit } from './_shared.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();
router.use(protect, scope);

/* ─── REGIONS ─── */
const regR = express.Router();
regR.use(protect, scope);
regR.get('/', async(req,res)=>{
  try{
    const f={isActive:true};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    res.json({status:'success',data:await Region.find(f).sort({name:1})});
  }catch(e){res.status(500).json({status:'error',message:e.message});}
});
regR.post('/', async(req,res)=>{
  try{
    const doc=await Region.create({...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id});
    res.status(201).json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});
regR.put('/:id', async(req,res)=>{
  try{
    const doc=await Region.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},req.body,{new:true});
    if(!doc) return res.status(404).json({status:'error',message:'Not found.'});
    res.json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});
regR.delete('/:id', async(req,res)=>{
  try{
    await Region.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},{isActive:false});
    res.json({status:'success',message:'Region removed.'});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});

/* ─── TARGETS ─── */
const tarR = express.Router();
tarR.use(protect, scope);
tarR.get('/', async(req,res)=>{
  try{
    const f={};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    if(req.query.agentId)   f.agentId=req.query.agentId;
    if(req.query.month)     f.month=parseInt(req.query.month);
    if(req.query.year)      f.year=parseInt(req.query.year);
    res.json({status:'success',data:await SalesTarget.find(f).populate('agentId','name role').sort({year:-1,month:-1})});
  }catch(e){res.status(500).json({status:'error',message:e.message});}
});
tarR.post('/', async(req,res)=>{
  try{
    const doc=await SalesTarget.findOneAndUpdate(
      {companyId:req.scopedCompanyId,agentId:req.body.agentId,month:req.body.month,year:req.body.year},
      {...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id},
      {upsert:true,new:true,runValidators:true}
    );
    res.status(201).json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});

/* ─── ROUTE PLANS ─── */
const rpR = express.Router();
rpR.use(protect, scope);
rpR.get('/', async(req,res)=>{
  try{
    const f={};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    if(req.query.agentId)   f.agentId=req.query.agentId;
    if(req.query.month)     f.month=parseInt(req.query.month);
    if(req.query.year)      f.year=parseInt(req.query.year);
    if(req.query.week)      f.week=parseInt(req.query.week);
    const list=await RoutePlan.find(f)
      .populate('agentId','name role')
      .populate({path:'days.shops',select:'name locationName ownerName'})
      .populate({path:'days.visited',select:'name'})
      .sort({year:-1,month:-1,week:1});
    res.json({status:'success',data:list});
  }catch(e){res.status(500).json({status:'error',message:e.message});}
});
rpR.post('/', async(req,res)=>{
  try{
    const doc=await RoutePlan.findOneAndUpdate(
      {companyId:req.scopedCompanyId,agentId:req.body.agentId,year:req.body.year,month:req.body.month,week:req.body.week},
      {...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id},
      {upsert:true,new:true,runValidators:true}
    );
    res.status(201).json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});
rpR.patch('/:id/visit', async(req,res)=>{
  try{
    const {day,shopId}=req.body;
    const plan=await RoutePlan.findOne({_id:req.params.id,companyId:req.scopedCompanyId});
    if(!plan) return res.status(404).json({status:'error',message:'Not found.'});
    const d=plan.days.find(x=>x.day===day);
    if(d&&!d.visited.map(String).includes(String(shopId))) d.visited.push(shopId);
    await plan.save();
    res.json({status:'success',data:plan});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});

/* ─── PROMOTIONS ─── */
const proR = express.Router();
proR.use(protect, scope);
proR.get('/', async(req,res)=>{
  try{
    const f={isActive:true};
    if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
    res.json({status:'success',data:await Promotion.find(f).sort({createdAt:-1})});
  }catch(e){res.status(500).json({status:'error',message:e.message});}
});
proR.post('/', async(req,res)=>{
  try{
    const doc=await Promotion.create({...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id});
    res.status(201).json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});
proR.put('/:id', async(req,res)=>{
  try{
    const doc=await Promotion.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},req.body,{new:true});
    if(!doc) return res.status(404).json({status:'error',message:'Not found.'});
    res.json({status:'success',data:doc});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});
proR.delete('/:id', async(req,res)=>{
  try{
    await Promotion.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},{isActive:false});
    res.json({status:'success',message:'Removed.'});
  }catch(e){res.status(400).json({status:'error',message:e.message});}
});

/* ─── AUDIT ─── */
const audR = express.Router();
audR.use(protect);
audR.get('/', async(req,res)=>{
  try{
    const f={};
    if(req.user.role!=='super_admin') f.companyId=req.companyId;
    else if(req.query.companyId) f.companyId=req.query.companyId;
    if(req.query.action) f.action=req.query.action.toUpperCase();
    const limit=Math.min(parseInt(req.query.limit)||100,500);
    const page=Math.max(parseInt(req.query.page)||1,1);
    const [logs,total]=await Promise.all([
      AuditLog.find(f).sort({createdAt:-1}).skip((page-1)*limit).limit(limit),
      AuditLog.countDocuments(f)
    ]);
    res.json({status:'success',total,page,data:logs});
  }catch(e){res.status(500).json({status:'error',message:e.message});}
});

export { regR, tarR, rpR, proR, audR };
