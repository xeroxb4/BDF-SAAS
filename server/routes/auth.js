
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Create JWT token
function signToken(id) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  );
}

// Send token response
function sendToken(user, code, res) {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000
  });

  const c = user.companyId;

  res.status(code).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,

        // 👇 ADD THESE
        agentId: user.agentId || null,
        distributorId: user.distributorId || null,

        company: c
          ? {
            id: c._id,
            name: c.name,
            slug: c.slug,
            accentColor: c.accentColor,
            logo: c.logo,
            currency: c.currency
          }
          : null
      }
    }
  });
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: 'error', message: 'Username and password required.' });
    const user = await User.findOne({ username: username.toLowerCase().trim() }).populate('companyId', 'name slug accentColor logo currency isActive').populate('agentId', 'name distributorId');
    if (!user || !user.isActive) return res.status(401).json({ status: 'error', message: 'Incorrect username or password.' });
    const ok = await user.correctPassword(password);
    if (!ok) return res.status(401).json({ status: 'error', message: 'Incorrect username or password.' });
    if (user.companyId && !user.companyId.isActive) return res.status(403).json({ status: 'error', message: 'Company account suspended.' });
    await AuditLog.create({ companyId: user.companyId?._id, user: user._id, username: user.username, action: 'LOGIN', resource: 'auth', detail: user.fullName + ' logged in', ip: req.ip });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

router.post('/logout', protect, async (req, res) => {
  try {
    await AuditLog.create({ companyId: req.companyId, user: req.user._id, username: req.user.username, action: 'LOGOUT', resource: 'auth', detail: req.user.fullName + ' logged out', ip: req.ip });
    res.cookie('jwt', 'loggedout', { httpOnly: true, expires: new Date(Date.now() + 1000) });
    res.json({ status: 'success', message: 'Logged out.' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

router.get('/me', protect, async (req, res) => {
  try {
    const u = req.user;
    const c = u.companyId; // already populated by auth middleware

    // Build company object in exact same format as login response
    const company = (c && typeof c === 'object' && c._id) ? {
      id: c._id,
      name: c.name,
      slug: c.slug,
      accentColor: c.accentColor,
      logo: c.logo,
      currency: c.currency,
    } : null;

    res.json({
      status: 'success',
      data: {
        user: {
          id: u._id,
          username: u.username,
          fullName: u.fullName,
          role: u.role,
          agentId: u.agentId,
          regionId: u.regionId,
          isActive: u.isActive,
          company,   // same key as login response
        }
      }
    });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

router.post('/register', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(403).json({ status: 'error', message: 'Registration closed. Contact your administrator.' });
    const { username, password, fullName } = req.body;
    if (!username || !password || !fullName) return res.status(400).json({ status: 'error', message: 'All fields required.' });
    const user = await User.create({ username, password, fullName, role: 'super_admin' });
    const populated = await User.findById(user._id).populate('companyId', 'name slug accentColor logo currency isActive');
    sendToken(populated, 201, res);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ status: 'error', message: 'Username already taken.' });
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.post('/users', protect, async (req, res) => {
  try {
    const { username, password, fullName, role, regionId, agentId } = req.body;
    const allowed = req.user.role === 'super_admin' ? ['super_admin', 'company_admin', 'regional_admin', 'salesperson'] : ['regional_admin', 'salesperson'];
    if (!allowed.includes(role)) return res.status(403).json({ status: 'error', message: 'Cannot assign this role.' });
    const u = await User.create({ username, password, fullName, role, companyId: req.companyId, regionId: regionId || undefined, agentId: agentId || undefined });
    res.status(201).json({ status: 'success', data: { id: u._id, username: u.username, fullName: u.fullName, role: u.role } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ status: 'error', message: 'Username already taken.' });
    res.status(400).json({ status: 'error', message: err.message });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' && req.query.companyId
      ? { companyId: req.query.companyId }
      : { companyId: req.companyId };

    const users = await User.find(filter)
      .select('-password')
      .sort({ fullName: 1 });

    res.json({
      status: 'success',
      data: users
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});   // <-- missing this

export default router;