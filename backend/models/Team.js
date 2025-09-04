import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  university: String,
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  university: String,
  members: [memberSchema], // Array of member subdocuments
  payment: {
    slip: String // filename of uploaded payment slip
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Team', teamSchema);
