import express from 'express';
import Company from '../models/Company.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import protect from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (req.user.role==='super_admin') {
      const companies = await Company.find().sort({name:1});
      const withCounts = await Promise.all(companies.map(async c => {
        const userCount = await User.countDocuments({companyId:c._id});
        return {...c.toObject(), userCount};
      }));
      return res.json({status:'success', data:withCounts});
    }
    const company = await Company.findById(req.companyId);
    res.json({status:'success', data: company ? [company] : []});
  } catch(err){ res.status(500).json({status:'error', message:err.message}); }
});

router.post('/', requireRole('super_admin'), async (req, res) => {
  try {
    const company = await Company.create({...req.body, createdBy:req.user._id});
    await AuditLog.create({user:req.user._id, username:req.user.username, action:'CREATE', resource:'company', resourceId:company._id, detail:'Created company: '+company.name, ip:req.ip});
    res.status(201).json({status:'success', data:company});
  } catch(err){
    if (err.code===11000) return res.status(400).json({status:'error', message:'Company slug already exists.'});
    res.status(400).json({status:'error', message:err.message});
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.user.role!=='super_admin' && req.params.id!==req.companyId?.toString())
      return res.status(403).json({status:'error', message:'Access denied.'});
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});
    if (!company) return res.status(404).json({status:'error', message:'Company not found.'});
    res.json({status:'success', data:company});
  } catch(err){ res.status(400).json({status:'error', message:err.message}); }
});

router.patch('/:id/suspend', requireRole('super_admin'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, {isActive:false}, {new:true});
    res.json({status:'success', data:company});
  } catch(err){ res.status(400).json({status:'error', message:err.message}); }
});

router.patch('/:id/activate', requireRole('super_admin'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, {isActive:true}, {new:true});
    res.json({status:'success', data:company});
  } catch(err){ res.status(400).json({status:'error', message:err.message}); }
});

export default router;
