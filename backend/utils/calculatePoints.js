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
  
  // Calculate time elapsed in minutes
  const timeElapsedMs = new Date(submitTime) - new Date(roundStartTime);
  const minutesElapsed = timeElapsedMs / (1000 * 60);
  
  // Time-based multiplier (based on minutes)
  let timeMultiplier = 1.0;
  
  if (minutesElapsed <= 30) {
    timeMultiplier = 1.0; // 100% - First 30 minutes
  } else if (minutesElapsed <= 60) {
    timeMultiplier = 0.95; // 95% - 30-60 minutes
  } else if (minutesElapsed <= 90) {
    timeMultiplier = 0.90; // 90% - 60-90 minutes
  } else if (minutesElapsed <= 120) {
    timeMultiplier = 0.85; // 85% - 90-120 minutes (2 hours)
  } else if (minutesElapsed <= 180) {
    timeMultiplier = 0.80; // 80% - 2-3 hours
  } else if (minutesElapsed <= 240) {
    timeMultiplier = 0.75; // 75% - 3-4 hours
  } else if (minutesElapsed <= 300) {
    timeMultiplier = 0.70; // 70% - 4-5 hours
  } else if (minutesElapsed <= 360) {
    timeMultiplier = 0.65; // 65% - 5-6 hours
  } else {
    timeMultiplier = 0.60; // 60% - After 6 hours
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
export function getTimeMultiplierInfo(minutesElapsed) {
  if (minutesElapsed <= 30) {
    return { multiplier: 1.0, description: 'Lightning Fast! 🔥', color: 'gold' };
  } else if (minutesElapsed <= 60) {
    return { multiplier: 0.95, description: 'Super Quick ⚡', color: 'gold' };
  } else if (minutesElapsed <= 90) {
    return { multiplier: 0.90, description: 'Very Fast 🚀', color: 'silver' };
  } else if (minutesElapsed <= 120) {
    return { multiplier: 0.85, description: 'Quick ⏱️', color: 'silver' };
  } else if (minutesElapsed <= 180) {
    return { multiplier: 0.80, description: 'Good Speed 🏃', color: 'bronze' };
  } else if (minutesElapsed <= 240) {
    return { multiplier: 0.75, description: 'Steady Pace 🚶', color: 'bronze' };
  } else if (minutesElapsed <= 300) {
    return { multiplier: 0.70, description: 'Moderate ⏳', color: 'blue' };
  } else if (minutesElapsed <= 360) {
    return { multiplier: 0.65, description: 'Taking Time 🕐', color: 'blue' };
  } else {
    return { multiplier: 0.60, description: 'Completed ✓', color: 'green' };
  }
}
