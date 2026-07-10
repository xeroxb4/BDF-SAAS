import mongoose from 'mongoose';


const auditLogSchema = new mongoose.Schema({
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username:   { type: String },
  action:     { type: String, enum: ['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','IMPORT','SWITCH'], required: true },
  resource:   { type: String },
  resourceId: { type: String },
  detail:     { type: String },
  ip:         { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
auditLogSchema.index({ companyId: 1, createdAt: -1 });
export default mongoose.model('AuditLog', auditLogSchema);

