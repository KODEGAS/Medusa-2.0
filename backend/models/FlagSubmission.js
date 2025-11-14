import mongoose from 'mongoose';

const flagSubmissionSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  flag: {
    type: String,
    required: true,
    trim: true
  },
  round: {
    type: Number,
    required: true,
    default: 1,
    enum: [1, 2],
    index: true
  },
  challengeType: {
    type: String,
    enum: ['android', 'pwn-user', 'pwn-root', null],
    default: null,
    index: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  },
  challengeId: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1,
    max: 3 // Changed to 3 for PWN challenge
  },
  pointDeduction: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  }
});

// Compound indexes to prevent duplicate submissions per challenge
flagSubmissionSchema.index({ teamId: 1, flag: 1, round: 1, challengeType: 1 }, { unique: true });
flagSubmissionSchema.index({ teamId: 1, round: 1, challengeType: 1 });

// Instance method to verify the flag
flagSubmissionSchema.methods.verify = function() {
  this.verified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const FlagSubmission = mongoose.model('FlagSubmission', flagSubmissionSchema);

export default FlagSubmission;
