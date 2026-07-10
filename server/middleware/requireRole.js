export default (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ status:'error', message:'Access denied. Role: '+roles.join(' or ')+'required.' });
  next();
};
