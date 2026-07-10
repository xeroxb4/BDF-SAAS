import mongoose from 'mongoose';
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company'},user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},username:String,action:{type:String,enum:['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','IMPORT','SWITCH'],required:true},resource:String,resourceId:String,detail:String,ip:String},{timestamps:true});
s.index({createdAt:1},{expireAfterSeconds:365*24*60*60});
s.index({companyId:1,createdAt:-1});
export default mongoose.model('AuditLog',s);
