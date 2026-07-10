export default (req, res, next) => {
  if (req.user.role === 'super_admin') {
    req.scopedCompanyId = req.query.companyId || req.headers['x-company-id'] || null;
  } else {
    if (!req.companyId) return res.status(403).json({ status:'error', message:'No company assigned.' });
    req.scopedCompanyId = req.companyId;
  }
  next();
};
