import mongoose from 'mongoose';

const roundSessionSchema = new mongoose.Schema({
  teamId: { type: String, required: true, index: true },
  round: { type: Number, required: true, default: 1 },
  startTime: { type: Date, required: true },
  overridden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('RoundSession', roundSessionSchema);
