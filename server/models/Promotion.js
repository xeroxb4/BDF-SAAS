import mongoose from 'mongoose';
<<<<<<< HEAD
const tier=new mongoose.Schema({name:{type:String,required:true},minSpend:{type:Number,required:true},rewardValue:{type:Number,required:true},durationMonths:{type:Number,default:3},color:{type:String,default:'#ffb300'}},{_id:false});
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},name:{type:String,required:true,trim:true},code:{type:String,required:true,uppercase:true,trim:true},description:{type:String,trim:true},tiers:[tier],isActive:{type:Boolean,default:true},startDate:{type:String},endDate:{type:String},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
export default mongoose.model('Promotion',s);
=======

const tierSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  minSpend:      { type: Number, required: true },
  rewardValue:   { type: Number, required: true },
  durationMonths:{ type: Number, default: 3 },
  color:         { type: String, default: '#ffb300' },
}, { _id: false });

const promotionSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name:        { type: String, required: true, trim: true },
  code:        { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  tiers:       [tierSchema],
  isActive:    { type: Boolean, default: true },
  startDate:   { type: String },
  endDate:     { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

promotionSchema.index({ companyId: 1 });
export default mongoose.model('Promotion', promotionSchema);
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
