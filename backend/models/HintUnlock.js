import mongoose from 'mongoose';

const hintUnlockSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  round: {
    type: Number,
    required: true,
    enum: [1, 2],
    index: true
  },
  challengeType: {
    type: String,
    enum: ['android', 'pwn', null],
    default: null,
    index: true
  },
  hintNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  pointCost: {
    type: Number,
    required: true,
    default: 50
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index to prevent duplicate hint unlocks
hintUnlockSchema.index({ teamId: 1, round: 1, challengeType: 1, hintNumber: 1 }, { unique: true });

const HintUnlock = mongoose.model('HintUnlock', hintUnlockSchema);

export default HintUnlock;
