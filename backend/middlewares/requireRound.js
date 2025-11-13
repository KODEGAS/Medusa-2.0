/**
 * Round-specific authentication middleware
 * Validates that the user's JWT token is for the correct round
 * Must be used AFTER the authenticate middleware
 */
export default function requireRound(requiredRound) {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required. Please log in.' 
      });
    }

    // Check if user's token has the correct round
    const userRound = req.user.round;

    if (userRound !== requiredRound) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. This requires Round ${requiredRound} authentication. You are authenticated for Round ${userRound}.`,
        requiredRound: requiredRound,
        currentRound: userRound,
        message: `Please authenticate with the Round ${requiredRound} API key (MEDUSA_R${requiredRound}_2025)`
      });
    }

    // User has correct round, proceed
    return next();
  };
}
