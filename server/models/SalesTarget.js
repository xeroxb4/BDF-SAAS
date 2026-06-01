import mongoose from 'mongoose';

const salesTargetSchema = new mongoose.Schema({
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company',     required: true },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', required: true },
  agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
  month:         { type: Number, required: true },
  year:          { type: Number, required: true },
  monthlyTarget: { type: Number, required: true, min: 0 },
  weeklyTargets: {
    wk1: { type: Number, default: 0 },
    wk2: { type: Number, default: 0 },
    wk3: { type: Number, default: 0 },
    wk4: { type: Number, default: 0 },
    wk5: { type: Number, default: 0 },
  },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

salesTargetSchema.index({ companyId: 1, agentId: 1, year: 1, month: 1 }, { unique: true });
export default mongoose.model('SalesTarget', salesTargetSchema);
