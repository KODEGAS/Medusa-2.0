/**
 * Calculate points for flag submission based on time and attempt number
 * 
 * @param {Date} roundStartTime - When the round started
 * @param {Date} submitTime - When the flag was submitted
 * @param {number} attemptNumber - 1 or 2
 * @returns {number} - Calculated points
 */
export function calculatePoints(roundStartTime, submitTime, attemptNumber) {
  const BASE_POINTS = 1000;
  
  // Calculate time elapsed in hours
  const timeElapsedMs = new Date(submitTime) - new Date(roundStartTime);
  const hoursElapsed = timeElapsedMs / (1000 * 60 * 60);
  
  // Time-based multiplier
  let timeMultiplier = 1.0;
  
  if (hoursElapsed <= 1) {
    timeMultiplier = 1.0; // 100% - First hour
  } else if (hoursElapsed <= 2) {
    timeMultiplier = 0.9; // 90% - 1-2 hours
  } else if (hoursElapsed <= 4) {
    timeMultiplier = 0.8; // 80% - 2-4 hours
  } else if (hoursElapsed <= 6) {
    timeMultiplier = 0.7; // 70% - 4-6 hours
  } else {
    timeMultiplier = 0.6; // 60% - After 6 hours
  }
  
  // Attempt penalty (25% penalty for 2nd attempt)
  const attemptPenalty = attemptNumber === 2 ? 0.25 : 0;
  
  // Calculate final points
  const points = Math.round(BASE_POINTS * timeMultiplier * (1 - attemptPenalty));
  
  return points;
}

/**
 * Get time multiplier description for display
 */
export function getTimeMultiplierInfo(hoursElapsed) {
  if (hoursElapsed <= 1) {
    return { multiplier: 1.0, description: 'Lightning Fast! 🔥', color: 'gold' };
  } else if (hoursElapsed <= 2) {
    return { multiplier: 0.9, description: 'Very Quick ⚡', color: 'silver' };
  } else if (hoursElapsed <= 4) {
    return { multiplier: 0.8, description: 'Good Speed 🚀', color: 'bronze' };
  } else if (hoursElapsed <= 6) {
    return { multiplier: 0.7, description: 'Steady Pace 🏃', color: 'blue' };
  } else {
    return { multiplier: 0.6, description: 'Completed ✓', color: 'green' };
  }
}
