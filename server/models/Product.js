import mongoose from 'mongoose';
<<<<<<< HEAD
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},name:{type:String,required:true,trim:true},cat:{type:String,trim:true,default:'General'},sizeValue:{type:Number,default:0},sizeUnit:{type:String,enum:['ml','L','g','kg','pcs',''],default:'ml'},imageUrl:{type:String,trim:true},price:{type:Number,required:true,min:0},pcsPerPack:{type:Number,default:1},packsPerCarton:{type:Number,default:1},pcsPerCarton:{type:Number,default:1},isTop10:{type:Boolean,default:false},top10Rank:{type:Number},minAgentQty:{type:Number,default:0},minShopQty:{type:Number,default:0},isActive:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
s.pre('save',function(next){this.pcsPerCarton=this.pcsPerPack*this.packsPerCarton;next();});
s.index({companyId:1,isActive:1});
export default mongoose.model('Product',s);
=======

const productSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name:          { type: String, required: true, trim: true },
  cat:           { type: String, trim: true, default: 'General' },
  // Volume / Weight
  sizeValue:     { type: Number, default: 0 },
  sizeUnit:      { type: String, enum: ['ml','L','g','kg','pcs',''], default: 'ml' },
  // Image
  imageUrl:      { type: String, trim: true },
  // Pricing — always per PIECE (Pc)
  price:         { type: Number, required: true, min: 0 },
  // Packaging hierarchy — all quantities stored in PIECES internally
  pcsPerPack:    { type: Number, default: 1 },      // e.g. 6  (6 pcs = 1 Pk)
  packsPerCarton:{ type: Number, default: 1 },      // e.g. 5  (5 Pks = 1 Ctn for roll-on) or 2 for lotion
  // Derived helper — stored for quick lookup (pcsPerPack × packsPerCarton)
  pcsPerCarton:  { type: Number, default: 1 },
  // Top 10
  isTop10:       { type: Boolean, default: false },
  top10Rank:     { type: Number },
  minAgentQty:   { type: Number, default: 0 },   // in PIECES
  minShopQty:    { type: Number, default: 0 },   // in PIECES
  isActive:      { type: Boolean, default: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-compute pcsPerCarton before save
productSchema.pre('save', function(next) {
  this.pcsPerCarton = this.pcsPerPack * this.packsPerCarton;
  next();
});
productSchema.pre('findOneAndUpdate', function(next) {
  const u = this.getUpdate();
  if (u.pcsPerPack !== undefined || u.packsPerCarton !== undefined) {
    const ppp = u.pcsPerPack    ?? this._update?.pcsPerPack    ?? 1;
    const ppc = u.packsPerCarton?? this._update?.packsPerCarton?? 1;
    u.pcsPerCarton = ppp * ppc;
  }
  next();
});

productSchema.index({ companyId: 1, isActive: 1 });
export default mongoose.model('Product', productSchema);
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
