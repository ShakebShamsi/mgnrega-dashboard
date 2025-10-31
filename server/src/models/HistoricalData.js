import mongoose from 'mongoose';

const historicalDataSchema = new mongoose.Schema({
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  metrics: {
    workers: Number,
    expenditure: Number,
    workDays: Number,
  },
}, {
  timestamps: true,
});

historicalDataSchema.index({ districtId: 1, year: -1, month: 1 });

const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

export default HistoricalData;