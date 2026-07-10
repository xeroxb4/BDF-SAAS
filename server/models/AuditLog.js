import mongoose from 'mongoose';
<<<<<<< HEAD
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company'},user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},username:String,action:{type:String,enum:['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','IMPORT','SWITCH'],required:true},resource:String,resourceId:String,detail:String,ip:String},{timestamps:true});
s.index({createdAt:1},{expireAfterSeconds:365*24*60*60});
s.index({companyId:1,createdAt:-1});
export default mongoose.model('AuditLog',s);
=======

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
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
