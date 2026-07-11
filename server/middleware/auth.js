
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies?.jwt)
      token = req.cookies.jwt;


    if (!token) {
      return res.status(401).json({
        status:'error',
        message:'Not logged in.'
      });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate(
        'companyId',
        'name slug accentColor logo currency isActive'
      )
      .populate('agentId', 'name distributorId');


    if (!user || !user.isActive) {
      return res.status(401).json({
        status:'error',
        message:'Account not found or deactivated.'
      });
    }


    if (user.companyId && !user.companyId.isActive) {
      return res.status(403).json({
        status:'error',
        message:'Company account suspended.'
      });
    }


    req.user = user;

    // shortcut for route filters
    req.companyId = user.companyId?._id || null;

    next();

  } catch(err) {
    return res.status(401).json({
      status:'error',
      message:'Invalid or expired session. Please log in again.'
    });
  }
};
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export default async (req, res, next) => {
//   try {
//     let token;
//     if (req.headers.authorization?.startsWith('Bearer '))
//       token = req.headers.authorization.split(' ')[1];
//     else if (req.cookies?.jwt)
//       token = req.cookies.jwt;

//     if (!token) return res.status(401).json({ status:'error', message:'Not logged in.' });
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password').populate('companyId','name slug accentColor logo currency isActive');
//     if (!user || !user.isActive) return res.status(401).json({ status:'error', message:'Account not found or deactivated.' });
//     if (user.companyId && !user.companyId.isActive) return res.status(403).json({ status:'error', message:'Company account suspended.' });
//     req.user = user;


//     if (!token) return res.status(401).json({ status:'error', message:'Not logged in.' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password').populate('companyId','name slug accentColor logo currency isActive');
//     if (!user || !user.isActive)
//       return res.status(401).json({ status:'error', message:'Account not found or deactivated.' });

//     // If user belongs to a company, ensure company is active
//     if (user.companyId && !user.companyId.isActive)
//       return res.status(403).json({ status:'error', message:'Your company account has been suspended.' });

//     req.user = user;
//     // Attach companyId shortcut for route handlers

//     req.companyId = user.companyId?._id || null;
//     next();
//   } catch(err) {
//     return res.status(401).json({ status:'error', message:'Invalid or expired session. Please log in again.' });
//   }
// };
