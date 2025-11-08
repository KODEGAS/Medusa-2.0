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
  
  // Calculate time elapsed in seconds
  const timeElapsedMs = new Date(submitTime) - new Date(roundStartTime);
  const secondsElapsed = timeElapsedMs / 1000;
  const minutesElapsed = secondsElapsed / 60;
  
  // Time-based multiplier (second-based with linear decay in early stages)
  let timeMultiplier = 1.0;
  
  if (secondsElapsed <= 300) {
    // First 5 minutes: Linear decay from 100% to 99% (0.2% per minute, ~0.0033% per second)
    timeMultiplier = 1.0 - (secondsElapsed / 300) * 0.01;
  } else if (secondsElapsed <= 900) {
    // 5-15 minutes: Linear decay from 99% to 97% (0.2% per minute)
    const secondsAfter300 = secondsElapsed - 300;
    timeMultiplier = 0.99 - (secondsAfter300 / 600) * 0.02;
  } else if (secondsElapsed <= 1800) {
    // 15-30 minutes: Linear decay from 97% to 95% (0.133% per minute)
    const secondsAfter900 = secondsElapsed - 900;
    timeMultiplier = 0.97 - (secondsAfter900 / 900) * 0.02;
  } else if (minutesElapsed <= 60) {
    // 30-60 minutes: 95%
    timeMultiplier = 0.95;
  } else if (minutesElapsed <= 90) {
    // 60-90 minutes: 90%
    timeMultiplier = 0.90;
  } else if (minutesElapsed <= 120) {
    // 90-120 minutes (2 hours): 85%
    timeMultiplier = 0.85;
  } else if (minutesElapsed <= 180) {
    // 2-3 hours: 80%
    timeMultiplier = 0.80;
  } else if (minutesElapsed <= 240) {
    // 3-4 hours: 75%
    timeMultiplier = 0.75;
  } else if (minutesElapsed <= 300) {
    // 4-5 hours: 70%
    timeMultiplier = 0.70;
  } else if (minutesElapsed <= 360) {
    // 5-6 hours: 65%
    timeMultiplier = 0.65;
  } else {
    // After 6 hours: 60%
    timeMultiplier = 0.60;
  }
  
  // Attempt penalty (25% penalty for 2nd attempt)
  const attemptPenalty = attemptNumber === 2 ? 0.25 : 0;
  
  // Calculate final points (round to 2 decimal places for precision)
  const points = Math.round((BASE_POINTS * timeMultiplier * (1 - attemptPenalty)) * 100) / 100;
  
  return points;
}

/**
 * Get time multiplier description for display
 */
export function getTimeMultiplierInfo(secondsElapsed) {
  const minutesElapsed = secondsElapsed / 60;
  
  if (secondsElapsed <= 300) {
    const multiplier = 1.0 - (secondsElapsed / 300) * 0.01;
    return { multiplier, description: 'Lightning Fast! 🔥', color: 'gold' };
  } else if (secondsElapsed <= 900) {
    const secondsAfter300 = secondsElapsed - 300;
    const multiplier = 0.99 - (secondsAfter300 / 600) * 0.02;
    return { multiplier, description: 'Super Quick ⚡', color: 'gold' };
  } else if (secondsElapsed <= 1800) {
    const secondsAfter900 = secondsElapsed - 900;
    const multiplier = 0.97 - (secondsAfter900 / 900) * 0.02;
    return { multiplier, description: 'Very Fast 🚀', color: 'gold' };
  } else if (minutesElapsed <= 60) {
    return { multiplier: 0.95, description: 'Fast ⚡', color: 'silver' };
  } else if (minutesElapsed <= 90) {
    return { multiplier: 0.90, description: 'Quick ⏱️', color: 'silver' };
  } else if (minutesElapsed <= 120) {
    return { multiplier: 0.85, description: 'Good Speed 🏃', color: 'bronze' };
  } else if (minutesElapsed <= 180) {
    return { multiplier: 0.80, description: 'Steady Pace 🚶', color: 'bronze' };
  } else if (minutesElapsed <= 240) {
    return { multiplier: 0.75, description: 'Moderate ⏳', color: 'blue' };
  } else if (minutesElapsed <= 300) {
    return { multiplier: 0.70, description: 'Taking Time 🕐', color: 'blue' };
  } else if (minutesElapsed <= 360) {
    return { multiplier: 0.65, description: 'Thoughtful 🤔', color: 'blue' };
  } else {
    return { multiplier: 0.60, description: 'Completed ✓', color: 'green' };
  }
}
