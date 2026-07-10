
export default (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ status:'error', message:'Access denied. Role: '+roles.join(' or ')+'required.' });

// Usage: requireRole('super_admin')  or  requireRole('company_admin','super_admin')
export default (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ status:'error', message:`Access denied. Required role: ${roles.join(' or ')}.` });

  next();
};
