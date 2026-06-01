import mongoose from 'mongoose';

const distributorSchema = new mongoose.Schema({
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company',  required: true },
  regionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  name:       { type: String, required: true, trim: true },
  type:       { type: String, enum: ['Distributor','Wholesaler'], default: 'Distributor' },
  location:   { type: String, trim: true },
  address:    { type: String, trim: true },
  contact:    { type: String, trim: true },
  phone:      { type: String, trim: true },
  whatsapp:   { type: String, trim: true },
  email:      { type: String, trim: true, lowercase: true },
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

distributorSchema.index({ companyId: 1, isActive: 1 });
export default mongoose.model('Distributor', distributorSchema);
