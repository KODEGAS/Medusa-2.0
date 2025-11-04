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
  }
});

// Compound index to prevent duplicate submissions
flagSubmissionSchema.index({ teamId: 1, flag: 1, challengeId: 1 });

// Instance method to verify the flag
flagSubmissionSchema.methods.verify = function() {
  this.verified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const FlagSubmission = mongoose.model('FlagSubmission', flagSubmissionSchema);

export default FlagSubmission;
