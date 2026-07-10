import mongoose from 'mongoose';
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},name:{type:String,required:true,trim:true},description:{type:String,trim:true},isActive:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
s.index({companyId:1});
export default mongoose.model('Region',s);
