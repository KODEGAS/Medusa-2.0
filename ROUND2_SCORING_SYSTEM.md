# Round 2 Scoring System

## Overview
Round 2 features a sophisticated weighted scoring system with hint penalties and time-based decay. Total available points: **1500 pts**

## Point Distribution

### Base Points (Weighted)
- **Android Challenge**: 750 pts (50% of 1500)
- **PWN User Challenge**: 450 pts (30% of 1500)
- **PWN Root Challenge**: 300 pts (20% of 1500)

### Scoring Formula
```
Final Points = (Base Points × Time Multiplier × Attempt Penalty) - Hint Penalty
```

### Time Multiplier (Decay)
Points decay over 6 hours from competition start:
- **0-2 hours**: 100% of base points
- **2-4 hours**: 80% of base points
- **4-6 hours**: 60% of base points
- **After 6 hours**: 60% of base points (minimum)

Formula: `timeMultiplier = Math.max(0.6, 1 - (hoursElapsed / 12))`

### Attempt Penalty
- **1st attempt**: 100% (no penalty)
- **2nd attempt**: 75% (25% penalty)
- **3rd attempt**: 60% (40% penalty)

Formula: `attemptPenalty = attemptNumber === 1 ? 1 : attemptNumber === 2 ? 0.75 : 0.6`

### Hint Penalty (Flat Deduction)
Points are **deducted** (not multiplied) from final score:
- **Hint 1**: -50 pts
- **Hint 2**: -100 pts
- **Hint 3**: -150 pts

**Sequential Unlock Requirement**: Hints must be unlocked in order (1→2→3)

## Scoring Examples

### Example 1: Perfect Android Submission
- Challenge: Android (base 750 pts)
- Time: 1 hour after start (100% multiplier)
- Attempts: 1st attempt (100% penalty)
- Hints: None (0 penalty)
- **Calculation**: (750 × 1.0 × 1.0) - 0 = **750 pts**

### Example 2: PWN User with 1 Hint
- Challenge: PWN User (base 450 pts)
- Time: 3 hours after start (80% multiplier)
- Attempts: 1st attempt (100% penalty)
- Hints: Hint 1 unlocked (-50 pts)
- **Calculation**: (450 × 0.8 × 1.0) - 50 = 360 - 50 = **310 pts**

### Example 3: PWN Root Late with Multiple Attempts
- Challenge: PWN Root (base 300 pts)
- Time: 5 hours after start (60% multiplier)
- Attempts: 3rd attempt (60% penalty)
- Hints: Hint 1 & 2 unlocked (-150 pts total)
- **Calculation**: (300 × 0.6 × 0.6) - 150 = 108 - 150 = **0 pts** (minimum 0)

## API Response Breakdown

Flag submission response includes detailed breakdown:
```json
{
  "correct": true,
  "message": "Correct flag!",
  "points": 310,
  "breakdown": {
    "basePoints": 450,
    "timeMultiplier": 0.8,
    "attemptPenalty": 1.0,
    "hintPenalty": 50,
    "rawPoints": 360,
    "finalPoints": 310
  }
}
```

## Hint System

### Unlocking Hints
- **Endpoint**: `POST /api/hints/unlock`
- **Body**: `{ round: 2, challengeType: 'android'|'pwn-user'|'pwn-root', hintNumber: 1-3 }`
- **Response**: `{ success: true, pointCost: 50 }`

### Viewing Unlocked Hints
- **Endpoint**: `GET /api/hints/unlocked?round=2`
- **Response**: 
```json
{
  "hints": [
    { "challengeType": "android", "hintNumber": 1, "pointCost": 50, "unlockedAt": "2024-..." }
  ],
  "totalPenalty": 50
}
```

### Checking Total Penalty
- **Endpoint**: `GET /api/hints/penalty?round=2&challengeType=android`
- **Response**: `{ totalPenalty: 50 }`

## Database Models

### HintUnlock Schema
```javascript
{
  teamId: ObjectId,
  round: Number (1 or 2),
  challengeType: String ('android', 'pwn-user', 'pwn-root'),
  hintNumber: Number (1-3),
  pointCost: Number (50, 100, or 150),
  unlockedAt: Date
}
```

Compound unique index on: `[teamId, round, challengeType, hintNumber]`

## Frontend Integration

### Hint Unlock UI (Round2Page.tsx)
- **3 columns**: One for each challenge (Android, PWN User, PWN Root)
- **Color coded**: 
  - Android hints: Emerald theme
  - PWN User hints: Yellow theme
  - PWN Root hints: Red theme
- **Sequential unlock**: Disabled buttons until previous hint unlocked
- **Visual feedback**: Shows total penalty at top, "✓ Unlocked" for completed hints
- **Cost display**: Shows point cost (50/100/150) for each hint

### State Management
```typescript
const [unlockedHints, setUnlockedHints] = useState<{[key: string]: number[]}>({
  android: [],
  'pwn-user': [],
  'pwn-root': []
});
const [hintPenalty, setHintPenalty] = useState(0);
```

## Security Features

1. **Authentication Required**: All hint endpoints require valid JWT token
2. **Sequential Validation**: Backend enforces hint 1→2→3 order
3. **Duplicate Prevention**: MongoDB unique constraint prevents double unlocking
4. **Team Isolation**: Hints are team-specific (teamId in schema)
5. **Automatic Penalty Calculation**: Flag submission queries HintUnlock model directly

## Implementation Files

- **Backend Scoring Logic**: `backend/utils/calculatePoints.js`
- **Flag Submission Handler**: `backend/routes/flag.js`
- **Hint API Routes**: `backend/routes/hints.js`
- **Hint Model**: `backend/models/HintUnlock.js`
- **Frontend UI**: `src/pages/Round2Page.tsx`
- **Server Integration**: `backend/server.js` (route registration)

## Testing Checklist

- [ ] Flag submission returns breakdown object
- [ ] Time decay works correctly (test at different hours)
- [ ] Attempt penalties calculated properly (1st, 2nd, 3rd)
- [ ] Hint unlock requires authentication
- [ ] Sequential unlock enforced (can't unlock hint 3 before 2)
- [ ] Duplicate unlock prevented (returns error)
- [ ] Hint penalty deducted from flag submission score
- [ ] UI shows correct unlocked hints after refresh
- [ ] Total penalty displays at top of hint section
- [ ] Color coding matches challenge types
- [ ] Three shared attempts for PWN challenges (user + root)

## Notes

- **PWN Attempts**: Both PWN flags (user + root) share the same 3 attempts counter
- **Flag Formats**: 
  - Android: `MEDUSA{...}`
  - PWN: `HashX{...}`
- **Minimum Score**: Final points cannot go below 0 (no negative scores)
- **Competition Start**: Uses `GLOBAL_COMPETITION_START` environment variable for fair time calculation across all teams
