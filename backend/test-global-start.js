import { calculatePoints } from './utils/calculatePoints.js';

// GLOBAL COMPETITION START TIME - November 8, 2025 at 19:00:00 IST
const GLOBAL_COMPETITION_START = new Date('2025-11-08T19:00:00+05:30');

console.log('=== Testing Global Competition Start Time ===\n');
console.log(`Global Start: ${GLOBAL_COMPETITION_START}\n`);

// Test with the actual submission times
const teams = [
  { id: 'ro1EA15', submitTime: new Date('2025-11-08T19:18:19+05:30'), attempt: 1 },
  { id: '408UR58', submitTime: new Date('2025-11-08T19:22:03+05:30'), attempt: 1 },
  { id: 'Th5SA16', submitTime: new Date('2025-11-08T19:22:06+05:30'), attempt: 1 },
  { id: 'In0US55', submitTime: new Date('2025-11-08T19:30:11+05:30'), attempt: 1 }
];

console.log('=== Recalculated Points (from 19:00:00) ===\n');

teams.forEach(team => {
  const elapsedMs = team.submitTime - GLOBAL_COMPETITION_START;
  const elapsedMinutes = elapsedMs / (1000 * 60);
  const points = calculatePoints(GLOBAL_COMPETITION_START, team.submitTime, team.attempt);
  
  console.log(`Team: ${team.id}`);
  console.log(`  Submitted: ${team.submitTime.toLocaleTimeString()}`);
  console.log(`  Time Elapsed: ${elapsedMinutes.toFixed(2)} minutes`);
  console.log(`  Points: ${points}`);
  console.log('---');
});

// Sort by points DESC, then by time ASC
const sorted = [...teams].map(t => ({
  ...t,
  points: calculatePoints(GLOBAL_COMPETITION_START, t.submitTime, t.attempt)
})).sort((a, b) => {
  if (b.points !== a.points) {
    return b.points - a.points;
  }
  return a.submitTime - b.submitTime;
});

console.log('\n=== Expected Leaderboard Order ===\n');
sorted.forEach((team, index) => {
  console.log(`${index + 1}. ${team.id} - ${team.points.toFixed(4)} points - ${team.submitTime.toLocaleTimeString()}`);
});
