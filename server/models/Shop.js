import mongoose from 'mongoose';
<<<<<<< HEAD
const s=new mongoose.Schema({
=======

const shopSchema = new mongoose.Schema({
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
  companyId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  name:           { type: String, required: true, trim: true },
  ownerName:      { type: String, trim: true },
  ownerContact:   { type: String, trim: true },
  ownerWhatsapp:  { type: String, trim: true },
  address:        { type: String, trim: true },
  locationName:   { type: String, trim: true },
<<<<<<< HEAD
  lat:            { type: Number },
  lng:            { type: Number },
  googleMapsUrl:  { type: String, trim: true },
  photoUrl:       { type: String, trim: true },
  assignedAgent:  { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  // Financial
  creditBalance:  { type: Number, default: 0 },
  creditLimit:    { type: Number, default: 0 },
  // GRA compliance
  tin:            { type: String, trim: true },
  // AVC
  avcTier:        { type: String, enum: ['none','bronze','silver','gold'], default: 'none' },
  avcAccumulated: { type: Number, default: 0 },
  // Route days (Mon-Fri)
  routeDays:      [{ type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] }],
  isActive:       { type: Boolean, default: true },
  legacyId:       { type: String },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{timestamps:true});
s.index({companyId:1,distributorId:1});
s.index({legacyId:1});
export default mongoose.model('Shop',s);
=======
  // Location
  lat:            { type: Number },
  lng:            { type: Number },
  googleMapsUrl:  { type: String, trim: true },  // paste URL from Google Maps
  googlePlaceId:  { type: String, trim: true },  // optional place ID
  // Photo
  photoUrl:       { type: String, trim: true },  // URL of shop photo
  // Assigned agent
  assignedAgent:  { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  // Financial
  creditBalance:  { type: Number, default: 0 },
  // AVC
  avcTier:        { type: String, enum: ['none','bronze','silver','gold'], default: 'none' },
  avcAccumulated: { type: Number, default: 0 },
  avcPeriodStart: { type: Date },
  isActive:       { type: Boolean, default: true },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

shopSchema.index({ companyId: 1, distributorId: 1 });
shopSchema.index({ assignedAgent: 1 });
export default mongoose.model('Shop', shopSchema);
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
