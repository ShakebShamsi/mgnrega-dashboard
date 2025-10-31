import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
  districtName: {
    type: String,
    required: true,
    trim: true,
  },
  stateName: {
    type: String,
    required: true,
    trim: true,
  },
  finYear: {
    type: String,
    required: true,
  },
  metrics: {
    totalWorkers: Number,
    householdsBenefited: Number,
    personDays: Number,
    totalExpenditure: Number,
    avgWagePerDay: Number,
    workCompletionRate: Number,
    activeWorks: Number,
    completedWorks: Number,
  },
  rawData: mongoose.Schema.Types.Mixed,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: 'data.gov.in',
  },
}, {
  timestamps: true,
});

// Indexes for fast queries
districtSchema.index({ stateName: 1, districtName: 1, finYear: 1 }, { unique: true });
districtSchema.index({ lastUpdated: -1 });

const District = mongoose.model('District', districtSchema);

export default District;