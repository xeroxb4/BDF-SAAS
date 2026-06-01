import mongoose from 'mongoose';

const shopSaleSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  shopId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop',        required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product',     required: true },
  date:          { type: String, required: true },
  qty:           { type: Number, required: true, min: 1 },
  price:         { type: Number, required: true, min: 0 },
  // Payment
  paymentMethod: { type: String, enum: ['cash','momo','credit'], default: 'cash' },
  momoNumber:    { type: String, trim: true },   // if momo
  isPaid:        { type: Boolean, default: true },
  paidAt:        { type: Date },
  receiptNo:     { type: String },               // auto-generated
  note:          { type: String, trim: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

shopSaleSchema.index({ companyId: 1, shopId: 1, date: -1 });
shopSaleSchema.index({ agentId: 1, date: -1 });

export default mongoose.model('ShopSale', shopSaleSchema);
