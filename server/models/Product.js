import mongoose from 'mongoose';
const s=new mongoose.Schema({companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company',required:true},name:{type:String,required:true,trim:true},cat:{type:String,trim:true,default:'General'},sizeValue:{type:Number,default:0},sizeUnit:{type:String,enum:['ml','L','g','kg','pcs',''],default:'ml'},imageUrl:{type:String,trim:true},price:{type:Number,required:true,min:0},pcsPerPack:{type:Number,default:1},packsPerCarton:{type:Number,default:1},pcsPerCarton:{type:Number,default:1},isTop10:{type:Boolean,default:false},top10Rank:{type:Number},minAgentQty:{type:Number,default:0},minShopQty:{type:Number,default:0},isActive:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
s.pre('save',function(next){this.pcsPerCarton=this.pcsPerPack*this.packsPerCarton;next();});
s.index({companyId:1,isActive:1});
export default mongoose.model('Product',s);
