import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  fullName:     { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['super_admin','company_admin','regional_admin','salesperson'],
    default: 'company_admin'
  },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },   // null for super_admin
  regionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },    // for regional_admin
  agentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },     // for salesperson
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.correctPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);

