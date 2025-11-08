import mongoose from 'mongoose';
import FlagSubmission from './models/FlagSubmission.js';
import 'dotenv/config';

async function checkTeams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const teamIds = ['In0US55', 'ro1EA15', '408UR58', 'Th5SA16'];
    
    const submissions = await FlagSubmission.find({ 
      teamId: { $in: teamIds }, 
      isCorrect: true, 
      verified: true 
    }).sort({ submittedAt: 1 });
    
    console.log('\n=== Submissions by Timestamp (Earliest First) ===\n');
    submissions.forEach(s => {
      console.log(`Team: ${s.teamId}`);
      console.log(`  Points: ${s.points}`);
      console.log(`  Submitted: ${s.submittedAt}`);
      console.log(`  Attempt: ${s.attemptNumber}`);
      console.log('---');
    });
    
    console.log('\n=== Sorted by Points DESC, then Time ASC ===\n');
    const sorted = [...submissions].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points; // Higher points first
      }
      return new Date(a.submittedAt) - new Date(b.submittedAt); // Earlier time first
    });
    
    sorted.forEach((s, index) => {
      console.log(`${index + 1}. Team: ${s.teamId}, Points: ${s.points}, Time: ${s.submittedAt}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTeams();
