import mongoose from 'mongoose';
import FlagSubmission from './models/FlagSubmission.js';
import RoundSession from './models/RoundSession.js';
import 'dotenv/config';

async function checkRoundSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const teamIds = ['In0US55', 'ro1EA15', '408UR58', 'Th5SA16'];
    
    console.log('\n=== Round Session Start Times ===\n');
    
    for (const teamId of teamIds) {
      const session = await RoundSession.findOne({ teamId, round: 1 });
      const submission = await FlagSubmission.findOne({ teamId, isCorrect: true, verified: true });
      
      if (session && submission) {
        const startTime = new Date(session.startTime);
        const submitTime = new Date(submission.submittedAt);
        const elapsedMs = submitTime - startTime;
        const elapsedMinutes = elapsedMs / (1000 * 60);
        
        console.log(`Team: ${teamId}`);
        console.log(`  Round Start: ${session.startTime}`);
        console.log(`  Submission:  ${submission.submittedAt}`);
        console.log(`  Time Elapsed: ${elapsedMinutes.toFixed(2)} minutes`);
        console.log(`  Points: ${submission.points}`);
        console.log('---');
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRoundSessions();
