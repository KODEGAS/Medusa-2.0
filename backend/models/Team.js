import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  year: String,
  isLeader: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  teamId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    trim: true
  },
  teamName: { type: String, required: true },
  university: String,
  leaderName: { type: String, required: true },
  leaderEmail: { type: String },
  leaderPhone: { type: String },
  members: [memberSchema], // Array of member subdocuments
  payment: {
    slip: String // filename of uploaded payment slip
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Team', teamSchema);
