import mongoose from 'mongoose';

const productLineSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  variant:   { type: String },
  qty:       { type: Number, required: true, min: 0 },
  unit:      { type: String, default: 'pcs' },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date:   { type: String, required: true },
  method: { type: String, enum: ['cash','momo','cheque','credit','other'], default: 'cash' },
  note:   { type: String, trim: true },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  companyId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor' },
  shopId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Shop',        required: true },
  agentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
  orderNum:       { type: String },
  date:           { type: String, required: true },
  products:       [productLineSchema],
  paymentType:    { type: String, enum: ['cash','momo','cheque','credit'], default: 'cash' },
  payments:       [paymentSchema],
  creditWeeks:    { type: Number },
  creditDue:      { type: String },
  deliveryStatus: { type: String, enum: ['pending','delivered'], default: 'pending' },
  deliveredAt:    { type: Date },
  notes:          { type: String, trim: true },
  // Migration tracking
  legacyId:       { type: String },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre('save', async function(next) {
  if (!this.orderNum) {
    const count = await this.constructor.countDocuments({ companyId: this.companyId });
    this.orderNum = 'ORD-' + String(count + 1).padStart(4, '0');
  }
  next();
});

// Virtual: total invoiced
orderSchema.virtual('totalInvoiced').get(function() {
  return (this.products || []).reduce((s, p) => s + p.qty * p.unitPrice, 0);
});
// Virtual: total paid
orderSchema.virtual('totalPaid').get(function() {
  return (this.payments || []).reduce((s, p) => s + p.amount, 0);
});
// Virtual: balance
orderSchema.virtual('balance').get(function() {
  return Math.max(0, this.totalInvoiced - this.totalPaid);
});
// Virtual: status
orderSchema.virtual('status').get(function() {
  const inv = this.totalInvoiced, paid = this.totalPaid;
  if (paid > inv) return 'credit';
  if (paid <= 0)  return 'owing';
  if (paid >= inv)return 'paid';
  return 'partial';
});
// Virtual: isOverdue
orderSchema.virtual('isOverdue').get(function() {
  if (this.paymentType !== 'credit' || !this.creditDue) return false;
  return this.balance > 0 && new Date().toISOString().slice(0,10) > this.creditDue;
});

orderSchema.set('toJSON',   { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

orderSchema.index({ companyId: 1, date: -1 });
orderSchema.index({ shopId: 1 });
orderSchema.index({ agentId: 1, date: -1 });

export default mongoose.model('Order', orderSchema);
