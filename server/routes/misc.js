import express from 'express';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';
import Region from '../models/Region.js';
import SalesTarget from '../models/SalesTarget.js';
import Promotion from '../models/Promotion.js';
import AuditLog from '../models/AuditLog.js';

function makeRouter(fn){const r=express.Router();r.use(protect,scope);fn(r);return r;}

export const regR=makeRouter(r=>{
  r.get('/',async(req,res)=>{try{const f={isActive:true};if(req.scopedCompanyId)f.companyId=req.scopedCompanyId;res.json({status:'success',data:await Region.find(f).sort({name:1})});}catch(e){res.status(500).json({status:'error',message:e.message});}});
  r.post('/',async(req,res)=>{try{const doc=await Region.create({...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id});res.status(201).json({status:'success',data:doc});}catch(e){res.status(400).json({status:'error',message:e.message});}});
  r.put('/:id',async(req,res)=>{try{const doc=await Region.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},req.body,{new:true});if(!doc)return res.status(404).json({status:'error',message:'Not found.'});res.json({status:'success',data:doc});}catch(e){res.status(400).json({status:'error',message:e.message});}});
  r.delete('/:id',async(req,res)=>{try{await Region.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},{isActive:false});res.json({status:'success',message:'Removed.'});}catch(e){res.status(400).json({status:'error',message:e.message});}});
});

export const tarR=makeRouter(r=>{
  r.get('/',async(req,res)=>{try{const f={};if(req.scopedCompanyId)f.companyId=req.scopedCompanyId;if(req.query.agentId)f.agentId=req.query.agentId;if(req.query.month)f.month=parseInt(req.query.month);if(req.query.year)f.year=parseInt(req.query.year);res.json({status:'success',data:await SalesTarget.find(f).populate('agentId','name role').sort({year:-1,month:-1})});}catch(e){res.status(500).json({status:'error',message:e.message});}});
  r.post('/',async(req,res)=>{try{const doc=await SalesTarget.findOneAndUpdate({companyId:req.scopedCompanyId,agentId:req.body.agentId,month:req.body.month,year:req.body.year},{...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id},{upsert:true,new:true,runValidators:true});res.status(201).json({status:'success',data:doc});}catch(e){res.status(400).json({status:'error',message:e.message});}});
});

export const proR=makeRouter(r=>{
  r.get('/',async(req,res)=>{try{const f={isActive:true};if(req.scopedCompanyId)f.companyId=req.scopedCompanyId;res.json({status:'success',data:await Promotion.find(f).sort({createdAt:-1})});}catch(e){res.status(500).json({status:'error',message:e.message});}});
  r.post('/',async(req,res)=>{try{const doc=await Promotion.create({...req.body,companyId:req.scopedCompanyId,createdBy:req.user._id});res.status(201).json({status:'success',data:doc});}catch(e){res.status(400).json({status:'error',message:e.message});}});
  r.put('/:id',async(req,res)=>{try{const doc=await Promotion.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},req.body,{new:true});if(!doc)return res.status(404).json({status:'error',message:'Not found.'});res.json({status:'success',data:doc});}catch(e){res.status(400).json({status:'error',message:e.message});}});
  r.delete('/:id',async(req,res)=>{try{await Promotion.findOneAndUpdate({_id:req.params.id,companyId:req.scopedCompanyId},{isActive:false});res.json({status:'success',message:'Removed.'});}catch(e){res.status(400).json({status:'error',message:e.message});}});
});

export const audR=makeRouter(r=>{
  r.get('/',async(req,res)=>{try{const f={};if(req.user.role!=='super_admin')f.companyId=req.companyId;else if(req.query.companyId)f.companyId=req.query.companyId;if(req.query.action)f.action=req.query.action.toUpperCase();const limit=Math.min(parseInt(req.query.limit)||100,500);const page=Math.max(parseInt(req.query.page)||1,1);const[logs,total]=await Promise.all([AuditLog.find(f).sort({createdAt:-1}).skip((page-1)*limit).limit(limit),AuditLog.countDocuments(f)]);res.json({status:'success',total,page,data:logs});}catch(e){res.status(500).json({status:'error',message:e.message});}});
});
