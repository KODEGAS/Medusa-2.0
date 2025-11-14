/**
 * Calculate points for flag submission based on time and attempt number
 * 
 * @param {Date} roundStartTime - When the round started
 * @param {Date} submitTime - When the flag was submitted
 * @param {number} attemptNumber - 1 or 2
 * @returns {number} - Calculated points
 */
export function calculatePoints(roundStartTime, submitTime, attemptNumber, options = {}) {
  // options: { basePoints, hintPenalty }
  const BASE_POINTS = typeof options.basePoints === 'number' ? options.basePoints : 1000;
  const hintPenalty = typeof options.hintPenalty === 'number' ? options.hintPenalty : 0;

  // Calculate time elapsed in seconds (with millisecond precision)
  const timeElapsedMs = new Date(submitTime) - new Date(roundStartTime);
  const secondsElapsed = timeElapsedMs / 1000;
  const minutesElapsed = secondsElapsed / 60;

  // Time-based multiplier (continuous linear decay for maximum granularity)
  let timeMultiplier = 1.0;
  
  if (secondsElapsed <= 300) {
    // First 5 minutes: Linear decay from 100% to 99%
    // Every second reduces by 0.00333%
    timeMultiplier = 1.0 - (secondsElapsed / 300) * 0.01;
  } else if (secondsElapsed <= 900) {
    // 5-15 minutes: Linear decay from 99% to 97%
    // Every second reduces by 0.00333%
    const secondsAfter300 = secondsElapsed - 300;
    timeMultiplier = 0.99 - (secondsAfter300 / 600) * 0.02;
  } else if (secondsElapsed <= 1800) {
    // 15-30 minutes: Linear decay from 97% to 95%
    // Every second reduces by 0.00222%
    const secondsAfter900 = secondsElapsed - 900;
    timeMultiplier = 0.97 - (secondsAfter900 / 900) * 0.02;
  } else if (secondsElapsed <= 3600) {
    // 30-60 minutes: Linear decay from 95% to 90%
    // Every second reduces by 0.00278%
    const secondsAfter1800 = secondsElapsed - 1800;
    timeMultiplier = 0.95 - (secondsAfter1800 / 1800) * 0.05;
  } else if (secondsElapsed <= 5400) {
    // 60-90 minutes: Linear decay from 90% to 85%
    const secondsAfter3600 = secondsElapsed - 3600;
    timeMultiplier = 0.90 - (secondsAfter3600 / 1800) * 0.05;
  } else if (secondsElapsed <= 7200) {
    // 90-120 minutes: Linear decay from 85% to 80%
    const secondsAfter5400 = secondsElapsed - 5400;
    timeMultiplier = 0.85 - (secondsAfter5400 / 1800) * 0.05;
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
  
  // Attempt penalty (25% penalty for 2nd attempt). For attempt numbers beyond 2, apply incremental penalties.
  let attemptPenalty = 0;
  if (attemptNumber === 2) attemptPenalty = 0.25;
  else if (attemptNumber >= 3) attemptPenalty = 0.40; // harsher penalty for 3rd+ attempts

  // Calculate raw points before hint penalty
  let rawPoints = BASE_POINTS * timeMultiplier * (1 - attemptPenalty);

  // Subtract hint penalty (flat deduction)
  let finalPoints = rawPoints - hintPenalty;
  if (finalPoints < 0) finalPoints = 0;

  // Round to 1 decimal place
  rawPoints = Math.round(rawPoints * 10) / 10;
  finalPoints = Math.round(finalPoints * 10) / 10;

  return {
    rawPoints,
    finalPoints,
    hintPenalty,
    basePoints: BASE_POINTS,
    timeMultiplier,
    attemptPenalty
  };
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
