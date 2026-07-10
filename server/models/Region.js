import mongoose from 'mongoose';
<<<<<<< HEAD
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},name:{type:String,required:true,trim:true},description:{type:String,trim:true},isActive:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
s.index({companyId:1});
export default mongoose.model('Region',s);
=======

const regionSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

regionSchema.index({ companyId: 1 });
export default mongoose.model('Region', regionSchema);
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
