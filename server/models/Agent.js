import mongoose from 'mongoose';
const s=new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  name:          { type: String, required: true, trim: true },
  role:          { type: String, enum: ['OMR','Salesman'], required: true },
  phone:         { type: String, trim: true },
  whatsapp:      { type: String, trim: true },
  email:         { type: String, trim: true, lowercase: true },
  address:       { type: String, trim: true },
  emergency:     { type: String, trim: true },
  isActive:      { type: Boolean, default: true },
  legacyId:      { type: String },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{timestamps:true});
s.index({companyId:1,distributorId:1});
s.index({legacyId:1});
export default mongoose.model('Agent',s);
