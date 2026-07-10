<<<<<<< HEAD
export default (req, res, next) => {
  if (req.user.role === 'super_admin') {
    req.scopedCompanyId = req.query.companyId || req.headers['x-company-id'] || null;
  } else {
    if (!req.companyId) return res.status(403).json({ status:'error', message:'No company assigned.' });
=======
// Ensures non-super_admin users can only access their own company's data.
// Also allows super_admin to scope to a specific company via ?company= or X-Company-Id header.
export default (req, res, next) => {
  if (req.user.role === 'super_admin') {
    // Super admin can pass ?companyId=xxx to scope to a company, or see all
    const override = req.query.companyId || req.headers['x-company-id'];
    req.scopedCompanyId = override || null;
  } else {
    // All other roles are hard-locked to their own company
    if (!req.companyId)
      return res.status(403).json({ status:'error', message:'No company assigned to your account.' });
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
    req.scopedCompanyId = req.companyId;
  }
  next();
};
