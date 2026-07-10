import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const s=new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  fullName:     { type: String, required: true, trim: true },
  role:         { type: String, enum: ['super_admin','company_admin','regional_admin','salesperson'], default: 'company_admin' },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  regionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  agentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  email:        { type: String, trim: true, lowercase: true },
  phone:        { type: String, trim: true },
  isActive:     { type: Boolean, default: true },
  legacyId:     { type: String },
},{timestamps:true});
s.pre('save',async function(next){if(!this.isModified('password'))return next();this.password=await bcrypt.hash(this.password,12);next();});
s.methods.correctPassword=async function(e){return bcrypt.compare(e,this.password);};
s.index({legacyId:1});
export default mongoose.model('User',s);
