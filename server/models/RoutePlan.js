import mongoose from 'mongoose';

const routeDaySchema = new mongoose.Schema({
  day:     { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'], required: true },
  shops:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
  visited: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
}, { _id: false });

const routePlanSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
  month:         { type: Number, required: true },
  year:          { type: Number, required: true },
  week:          { type: Number, required: true, min: 1, max: 5 },
  days:          [routeDaySchema],
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

routePlanSchema.index({ companyId: 1, agentId: 1, year: 1, month: 1, week: 1 }, { unique: true });
export default mongoose.model('RoutePlan', routePlanSchema);
