import express from 'express';
import Order   from '../models/Order.js';
import Shop    from '../models/Shop.js';
import protect from '../middleware/auth.js';
import scope   from '../middleware/scopeCompany.js';
import { audit } from './_crud.js';

const router = express.Router();
router.use(protect, scope);

// GET /api/orders?shopId=&agentId=&status=&from=&to=
router.get('/', async (req, res) => {
  try {
    const f = {};
    if (req.scopedCompanyId)   f.companyId = req.scopedCompanyId;
    if (req.query.shopId)      f.shopId    = req.query.shopId;
    if (req.query.agentId)     f.agentId   = req.query.agentId;
    if (req.query.distributorId) f.distributorId = req.query.distributorId;
    if (req.query.from || req.query.to) {
      f.date = {};
      if (req.query.from) f.date.$gte = req.query.from;
      if (req.query.to)   f.date.$lte = req.query.to;
    }
    const orders = await Order.find(f)
      .populate('shopId',        'name locationName ownerName ownerContact creditBalance tin')
      .populate('agentId',       'name role')
      .populate('distributorId', 'name location')
      .sort({ date: -1, createdAt: -1 });
    res.json({ status:'success', data: orders });
  } catch(e) { res.status(500).json({ status:'error', message: e.message }); }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, companyId: req.scopedCompanyId })
      .populate('shopId','name locationName ownerName ownerContact address tin creditLimit')
      .populate('agentId','name role phone')
      .populate('distributorId','name');
    if (!order) return res.status(404).json({ status:'error', message:'Order not found.' });
    res.json({ status:'success', data: order });
  } catch(e) { res.status(500).json({ status:'error', message: e.message }); }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const order = new Order({ ...req.body, companyId: req.scopedCompanyId, createdBy: req.user._id });
    await order.save();
    // If credit order — update shop credit balance
    if (order.paymentType === 'credit' && order.balance > 0) {
      await Shop.findByIdAndUpdate(order.shopId, { $inc: { creditBalance: order.balance } });
    }
    const populated = await Order.findById(order._id)
      .populate('shopId','name locationName ownerName')
      .populate('agentId','name role');
    await audit(req, 'CREATE', 'order', order._id, 'New order ' + order.orderNum + ' for shop ' + order.shopId);
    res.status(201).json({ status:'success', data: populated });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// PUT /api/orders/:id
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, companyId: req.scopedCompanyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('shopId','name locationName ownerName').populate('agentId','name role');
    if (!order) return res.status(404).json({ status:'error', message:'Order not found.' });
    res.json({ status:'success', data: order });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// POST /api/orders/:id/payments  — record a payment against an order
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, date, method, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ status:'error', message:'Valid amount required.' });
    const order = await Order.findOne({ _id: req.params.id, companyId: req.scopedCompanyId });
    if (!order) return res.status(404).json({ status:'error', message:'Order not found.' });
    const prevBalance = order.balance;
    order.payments.push({ amount: parseFloat(amount), date, method: method||'cash', note: note||'' });
    await order.save();
    const newBalance = order.balance;
    // If credit balance reduced — update shop
    if (order.paymentType === 'credit' && newBalance < prevBalance) {
      await Shop.findByIdAndUpdate(order.shopId, { $inc: { creditBalance: -(prevBalance - newBalance) } });
    }
    await audit(req, 'UPDATE', 'order', order._id, 'Payment of GH₵' + amount + ' recorded on order ' + order.orderNum);
    res.json({ status:'success', data: order });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// PATCH /api/orders/:id/deliver
router.patch('/:id/deliver', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, companyId: req.scopedCompanyId },
      { deliveryStatus: 'delivered', deliveredAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ status:'error', message:'Not found.' });
    res.json({ status:'success', data: order });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, companyId: req.scopedCompanyId });
    if (!order) return res.status(404).json({ status:'error', message:'Not found.' });
    // Reverse credit balance if needed
    if (order.paymentType === 'credit' && order.balance > 0) {
      await Shop.findByIdAndUpdate(order.shopId, { $inc: { creditBalance: -order.balance } });
    }
    await audit(req, 'DELETE', 'order', order._id, 'Deleted order ' + order.orderNum);
    res.json({ status:'success', message:'Order deleted.' });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

export default router;
