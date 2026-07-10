import mongoose from 'mongoose';

const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},distributorId:{type:mongoose.Schema.Types.ObjectId,ref:'Distributor',required:true},productId:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},qty:{type:Number,default:0,min:0},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
s.index({companyId:1,distributorId:1,productId:1},{unique:true});
export default mongoose.model('Stock',s);


const stockSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product',     required: true },
  qty:           { type: Number, default: 0, min: 0 },
  updatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

stockSchema.index({ companyId: 1, distributorId: 1, productId: 1 }, { unique: true });
export default mongoose.model('Stock', stockSchema);

