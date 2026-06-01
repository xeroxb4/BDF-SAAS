import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product',     required: true },
  shopId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },       // optional — direct to shop
  date:          { type: String, required: true },
  qty:           { type: Number, required: true, min: 1 },
  price:         { type: Number, required: true, min: 0 },
  confirmed:     { type: Boolean, default: false },
  confirmedAt:   { type: Date },
  confirmedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

dispatchSchema.index({ companyId: 1, date: -1 });
dispatchSchema.index({ agentId: 1, date: -1 });
export default mongoose.model('Dispatch', dispatchSchema);
