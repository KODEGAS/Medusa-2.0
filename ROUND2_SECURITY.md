# Round 2 Security Implementation

## 🔒 Security Features Implemented

### 1. **Timing Attack Prevention**
- **Issue**: Direct string comparison (`===`) can leak information through execution time differences
- **Solution**: Implemented `secureCompare()` function using constant-time comparison
- **How it works**:
  ```javascript
  const secureCompare = (a, b) => {
    // Convert to buffers
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    
    // XOR all bytes and OR results
    let result = 0;
    for (let i = 0; i < aLen; i++) {
      result |= bufA[i] ^ bufB[i];
    }
    
    // Only returns true if all bits are 0
    return result === 0;
  };
  ```
- **Protection**: Prevents attackers from guessing flags character-by-character using timing analysis

---

### 2. **No Flag Leakage in Responses**
- **Issue**: Revealing partial flag information helps attackers
- **Solution**: 
  - Never send correct flag in any API response
  - Only return boolean `correct: true/false`
  - Generic error messages that don't reveal flag structure
  
- **Example Response**:
  ```json
  {
    "success": true,
    "correct": false,  // ← Only boolean
    "message": "❌ Incorrect flag. Please try again.",
    // NO HINTS ABOUT CORRECT FLAG
  }
  ```

---

### 3. **JWT-Based Authentication**
- **Issue**: Accepting teamId in request body allows impersonation
- **Solution**: Extract teamId from verified JWT token only
  ```javascript
  const teamId = req.user.teamId; // From JWT (middleware verified)
  // NEVER use: req.body.teamId
  ```
- **Protection**: Teams cannot submit flags on behalf of other teams

---

### 4. **Challenge Isolation**
- **Issue**: Teams could submit wrong flags to exhaust other teams' attempts
- **Solution**: 
  - Each challenge (android, pwn) has separate submission counters
  - Database indexes prevent duplicate submissions per challenge
  ```javascript
  const submissionQuery = round === 2 
    ? { teamId, round, challengeType }
    : { teamId, round };
  ```

---

### 5. **Rate Limiting (Two Layers)**

#### **IP + Team Rate Limiter**
```javascript
keyGenerator: (req) => {
  const ip = req.ip;
  const teamId = req.user?.teamId || 'unauthenticated';
  return `${ip}-${teamId}`;
}
```
- **Limit**: 20 submissions per 5 minutes per IP+Team combination
- **Protection**: Prevents brute force from shared IPs (mobile networks)

#### **Per-Team Rate Limiter**
```javascript
keyGenerator: (req) => {
  return req.user?.teamId || req.ip;
}
```
- **Limit**: 10 submissions per 5 minutes per team
- **Protection**: Prevents rapid-fire guessing attacks

---

### 6. **Input Validation & Sanitization**
```javascript
// Length validation
if (flag.length < 5 || flag.length > 200) {
  return res.status(400).json({ error: 'Invalid flag length' });
}

// Type validation
if (typeof flag !== 'string') {
  return res.status(400).json({ error: 'Flag must be string' });
}

// Sanitization
req.body.flag = flag.trim();
```
- **Protection**: Prevents injection attacks, buffer overflows, and malformed input

---

### 7. **Submission Limits Per Challenge**
- **Limit**: 2 attempts per challenge (android and pwn separately)
- **Tracking**: Database query counts submissions for specific challenge
- **Penalty**: 25% point deduction on 2nd attempt
- **Protection**: Prevents unlimited guessing

---

### 8. **Duplicate Submission Prevention**
```javascript
// Compound unique index in MongoDB
flagSubmissionSchema.index({ 
  teamId: 1, 
  flag: 1, 
  round: 1, 
  challengeType: 1 
}, { unique: true });
```
- **Protection**: Database-level guarantee against duplicate submissions

---

### 9. **Audit Logging**
```javascript
console.log(`[AUDIT] Flag submitted by team ${teamId} for Round 2 (${challengeType}) - Attempt ${submissionCount + 1}/2 - ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} - ${points} points - IP: ${ipAddress} - Time: ${new Date().toISOString()}`);
```
- **Logged Data**:
  - Team ID
  - Challenge type (android/pwn)
  - Attempt number
  - Success/failure
  - Points awarded
  - IP address
  - Timestamp
- **Protection**: Full audit trail for investigation

---

### 10. **Secure Flag Storage**
```javascript
// Flags stored in environment variables (recommended)
const CORRECT_FLAGS_R2 = {
  android: process.env.ROUND2_ANDROID_FLAG || 'MEDUSA{android_flag}',
  pwn: process.env.ROUND2_PWN_FLAG || 'MEDUSA{pwn_flag}'
};
```
- **Best Practice**: Use environment variables instead of hardcoding
- **Protection**: Flags not visible in version control

---

## 🚨 Security Vulnerabilities PREVENTED

### ❌ **Attack 1: Timing Attack**
**Before:**
```javascript
if (flag === CORRECT_FLAG) { ... }
```
- Attacker could measure response times to guess characters

**After:**
```javascript
if (secureCompare(flag, CORRECT_FLAG)) { ... }
```
- Constant-time comparison prevents timing analysis

---

### ❌ **Attack 2: Team ID Spoofing**
**Before:**
```javascript
const { teamId, flag } = req.body;
// Attacker sends: { teamId: "victim_team", flag: "wrong" }
```
- Attacker could exhaust victim's submission attempts

**After:**
```javascript
const teamId = req.user.teamId; // From JWT only
```
- Team ID cannot be spoofed

---

### ❌ **Attack 3: Brute Force Flag Guessing**
**Before:** No rate limiting
- Attacker could try thousands of flags per second

**After:** Two-layer rate limiting
- Max 10 attempts per 5 minutes per team
- Max 20 attempts per 5 minutes per IP+Team

---

### ❌ **Attack 4: Flag Theft via Response**
**Before:**
```json
{
  "error": "Incorrect. Expected MEDUSA{...}, got MEDUSA{wrong}"
}
```
- Flag leaked in error message

**After:**
```json
{
  "correct": false,
  "message": "❌ Incorrect flag. Please try again."
}
```
- No flag information in any response

---

### ❌ **Attack 5: Cross-Challenge Exploitation**
**Before:** Shared submission counter for all challenges
- Team submits wrong android flag → pwn attempts exhausted too

**After:** Separate counters per challenge
- Android and PWN have independent 2-attempt limits

---

## 🔐 Backend Configuration

### **1. Set Environment Variables**
```bash
# .env file
ROUND2_ANDROID_FLAG=MEDUSA{your_android_flag_here}
ROUND2_PWN_FLAG=MEDUSA{your_pwn_flag_here}
```

### **2. Update flag.js**
```javascript
const CORRECT_FLAGS_R2 = {
  android: process.env.ROUND2_ANDROID_FLAG || 'MEDUSA{android_exploitation_flag_here}',
  pwn: process.env.ROUND2_PWN_FLAG || 'MEDUSA{pwn_box_exploitation_flag_here}'
};
```

---

## 📊 Database Schema Updates

### **FlagSubmission Model**
```javascript
{
  teamId: String,          // From JWT token
  flag: String,            // Submitted flag (trimmed)
  round: Number,           // 1 or 2
  challengeType: String,   // 'android', 'pwn', or null (for Round 1)
  isCorrect: Boolean,
  points: Number,
  attemptNumber: Number,   // 1 or 2
  pointDeduction: Number,  // 0 or 0.25
  ipAddress: String,
  userAgent: String,
  submittedAt: Date,
  verified: Boolean
}
```

### **Unique Constraints**
```javascript
// Prevents duplicate submissions
{ teamId: 1, flag: 1, round: 1, challengeType: 1 } // unique

// Efficient queries
{ teamId: 1, round: 1, challengeType: 1 }
```

---

## 🧪 Testing Security

### **Test 1: Timing Attack**
```bash
# Try to guess flag character-by-character
for i in {A..Z}; do
  time curl -X POST .../api/flag/submit \
    -d "flag=MEDUSA{$i}"
done
# All requests should take same time
```

### **Test 2: Team ID Spoofing**
```bash
# Try to submit as another team
curl -X POST .../api/flag/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"teamId": "victim_team", "flag": "wrong"}'
# Should use YOUR teamId from JWT, not request body
```

### **Test 3: Rate Limiting**
```bash
# Try 15 rapid submissions
for i in {1..15}; do
  curl -X POST .../api/flag/submit \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"flag": "MEDUSA{wrong'$i'}"}'
done
# Should block after 10 attempts
```

### **Test 4: Challenge Isolation**
```bash
# Submit 2 android flags (exhaust android attempts)
curl ... -d '{"round": 2, "challengeType": "android", "flag": "wrong1"}'
curl ... -d '{"round": 2, "challengeType": "android", "flag": "wrong2"}'

# Try PWN flag (should still have 2 attempts)
curl ... -d '{"round": 2, "challengeType": "pwn", "flag": "test"}'
# Should succeed (separate counters)
```

---

## ✅ Security Checklist

- [x] Timing attack prevention (constant-time comparison)
- [x] No flag leakage in responses
- [x] JWT-based authentication (no teamId in body)
- [x] Challenge isolation (separate counters)
- [x] Two-layer rate limiting
- [x] Input validation & sanitization
- [x] Submission limits (2 per challenge)
- [x] Duplicate prevention (DB unique index)
- [x] Audit logging
- [x] Secure flag storage (environment variables)

---

## 🚀 Deployment

1. **Update database**: Restart to apply new schema indexes
2. **Set environment variables**: Add Round 2 flags to `.env`
3. **Deploy backend**: Restart server to load new code
4. **Test thoroughly**: Run all security tests above
5. **Monitor logs**: Watch for suspicious activity

---

## 📝 Notes

- Flags are **never** sent to clients
- All validation happens **server-side only**
- JWT tokens are **verified** before processing
- Rate limits are **enforced** at multiple layers
- All submissions are **logged** for audit
- Challenge isolation prevents **cross-challenge attacks**

This implementation provides **defense in depth** against common CTF exploitation techniques.
