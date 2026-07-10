import mongoose from 'mongoose';
<<<<<<< HEAD
const s=new mongoose.Schema({name:{type:String,required:true,trim:true},slug:{type:String,required:true,unique:true,lowercase:true,trim:true},industry:{type:String,trim:true,default:'FMCG'},country:{type:String,trim:true,default:'Ghana'},currency:{type:String,default:'GH₵'},logo:{type:String,trim:true},accentColor:{type:String,default:'#00e5ff'},plan:{type:String,enum:['trial','starter','pro','enterprise'],default:'trial'},isActive:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
export default mongoose.model('Company',s);
=======

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  industry:    { type: String, trim: true, default: 'FMCG' },
  country:     { type: String, trim: true, default: 'Ghana' },
  currency:    { type: String, default: 'GH₵' },
  logo:        { type: String, trim: true },       // URL
  accentColor: { type: String, default: '#00e5ff' },
  plan:        { type: String, enum: ['trial','starter','pro','enterprise'], default: 'trial' },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
