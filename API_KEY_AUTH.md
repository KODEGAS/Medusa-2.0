# Round 1 API Key Authentication System

## Overview
An API key authentication system to control access to Round 1 challenges. Teams must enter a valid API key and their Team ID to access the challenge page.

---

## Features

### Security
- ✅ **API Key verification** before accessing Round 1
- ✅ **Rate limiting** (5 attempts per minute per IP)
- ✅ **Session storage** for authenticated state
- ✅ **Team ID tracking** for audit purposes
- ✅ **Backend verification** (optional but recommended)

### User Experience
- ✅ Clean authentication page with Greek theme
- ✅ Error handling for invalid keys
- ✅ Automatic redirect after successful auth
- ✅ Helpful hints for users without keys

---

## How It Works

### Flow:
1. User clicks "Round 1" in navigation
2. Redirected to `/round1-auth` (authentication page)
3. User enters Team ID + API Key
4. System verifies credentials
5. If valid: redirect to `/round1` (challenge page)
6. If invalid: show error message

### Session Management:
- Authentication stored in `sessionStorage`
- Valid only for current browser session
- Cleared when tab/browser closes
- Round 1 page checks auth on load

---

## API Key Configuration

### Current Default Key:
```
MEDUSA_R1_2025
```

### Where to Change:
**Frontend:** `src/pages/Round1Auth.tsx` (line 21)
```typescript
const VALID_API_KEY = "YOUR_NEW_KEY_HERE";
```

**Backend:** `backend/routes/auth.js` (lines 16-22)
```javascript
const VALID_API_KEYS = {
  'YOUR_NEW_KEY_HERE': {
    round: 1,
    name: 'Round 1 Access',
    active: true,
    expiresAt: null
  }
};
```

---

## Distributing API Keys

### Methods:
1. **Email** - Send to registered teams
2. **WhatsApp Channel** - Post announcement
3. **Website Dashboard** - Display after registration
4. **Physical Event** - Announce at orientation

### Recommended Approach:
```
Subject: MEDUSA 2.0 - Round 1 API Key

Dear Team [TEAM_NAME],

Your Round 1 API Key: MEDUSA_R1_2025

Access Round 1 at: https://medusa.ecsc-uok.com/round1-auth

Instructions:
1. Visit the link above
2. Enter your Team ID: [TEAM_ID]
3. Enter the API key above
4. Access the challenge

Keep this key confidential. Do not share with other teams.

Good luck!
- MEDUSA Organizing Team
```

---

## API Endpoints

### POST `/api/auth/verify`
Verify API key and team credentials.

**Request:**
```json
{
  "apiKey": "MEDUSA_R1_2025",
  "teamId": "TEAM001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "authenticated": true,
  "round": 1,
  "message": "Access granted to Round 1 Access",
  "teamId": "TEAM001"
}
```

**Error Responses:**
```json
// Invalid key
{
  "error": "Invalid API Key",
  "authenticated": false
}

// Rate limit exceeded
{
  "error": "Too many authentication attempts. Please try again later.",
  "retryAfter": "1 minute"
}
```

### GET `/api/auth/rounds`
List available rounds (public).

**Response:**
```json
{
  "success": true,
  "rounds": [
    {
      "round": 1,
      "name": "Round 1 Access",
      "requiresAuth": true
    }
  ]
}
```

---

## Frontend Integration

### Authentication Page (`/round1-auth`)
```
http://localhost:8082/round1-auth
```

Features:
- Team ID input
- API Key input
- Validation & error handling
- Automatic redirect on success

### Challenge Page (`/round1`)
Protected route that:
- Checks sessionStorage for auth
- Redirects to `/round1-auth` if not authenticated
- Displays challenge content if authenticated

---

## Testing

### Manual Test:
1. Visit `http://localhost:8082/round1-auth`
2. Enter:
   - Team ID: `TEST001`
   - API Key: `MEDUSA_R1_2025`
3. Click "Access Round 1"
4. Should redirect to `/round1` challenge page

### Test Invalid Key:
1. Enter Team ID: `TEST001`
2. Enter wrong key: `WRONG_KEY`
3. Should show error: "Invalid API Key"

### Test Direct Access:
1. Try visiting `/round1` directly
2. Should redirect to `/round1-auth`
3. After authentication, can access `/round1`

---

## Backend Verification (Optional)

### Enable Backend Verification:

Update `src/pages/Round1Auth.tsx` to call backend:

```typescript
const response = await fetch(`${apiUrl}/api/auth/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey, teamId })
});

const data = await response.json();

if (response.ok && data.authenticated) {
  // Store auth
  sessionStorage.setItem('round1_authenticated', 'true');
  sessionStorage.setItem('round1_team_id', teamId);
  navigate('/round1');
} else {
  setError(data.error || 'Authentication failed');
}
```

---

## Security Best Practices

### ✅ Do:
- Change default API key before competition
- Use backend verification in production
- Rotate keys between rounds
- Monitor authentication attempts
- Log all access for audit trail

### ❌ Don't:
- Share keys publicly
- Use same key for multiple rounds
- Store keys in git/public repos
- Hardcode production keys in frontend
- Allow unlimited authentication attempts

---

## Multiple API Keys

### For Different Rounds:
```javascript
const VALID_API_KEYS = {
  'MEDUSA_R1_2025': {
    round: 1,
    name: 'Round 1 Access',
    active: true
  },
  'MEDUSA_R2_2025': {
    round: 2,
    name: 'Round 2 Access',
    active: false  // Activate when round 2 starts
  },
  'MEDUSA_FINAL_2025': {
    round: 3,
    name: 'Finals Access',
    active: false
  }
};
```

### For Different Teams:
```javascript
const TEAM_KEYS = {
  'TEAM001_KEY': { teamId: 'TEAM001', round: 1 },
  'TEAM002_KEY': { teamId: 'TEAM002', round: 1 }
};
```

---

## Monitoring & Analytics

### Track in Backend:
```javascript
// Log authentication attempts
console.log(`Team ${teamId} authenticated for ${keyInfo.name} at ${new Date().toISOString()}`);

// Store in database (recommended)
await AuthLog.create({
  teamId,
  apiKey: apiKey.substring(0, 10) + '***', // Partial key
  round: keyInfo.round,
  success: true,
  timestamp: new Date(),
  ipAddress: req.ip
});
```

### Useful Metrics:
- Total authentication attempts
- Successful vs failed attempts
- Most active times
- Teams still waiting for keys
- Invalid key patterns

---

## Troubleshooting

### "Invalid API Key" Error
- Check spelling (case-sensitive)
- Verify key hasn't changed
- Check backend logs for details
- Confirm key is marked `active: true`

### Redirects Back to Auth Page
- Check sessionStorage in browser DevTools
- Verify key `round1_authenticated` exists
- Clear session and re-authenticate

### Rate Limit Error
- Wait 1 minute before retrying
- Check for automated scripts hitting endpoint
- Increase limit if legitimate use case

---

## Files Created/Modified

### New Files:
- ✅ `src/pages/Round1Auth.tsx` - Authentication page
- ✅ `backend/routes/auth.js` - Authentication API
- ✅ `API_KEY_AUTH.md` - This documentation

### Modified Files:
- ✅ `src/pages/Round1Page.tsx` - Added auth check
- ✅ `src/App.tsx` - Added /round1-auth route
- ✅ `src/components/Header.tsx` - Link to auth page
- ✅ `backend/server.js` - Registered auth routes

---

## Deployment Checklist

- [ ] Change default API key from `MEDUSA_R1_2025`
- [ ] Enable backend verification (recommended)
- [ ] Test authentication flow
- [ ] Prepare email/announcement with key
- [ ] Set up monitoring/logging
- [ ] Configure rate limits appropriately
- [ ] Test on production domain
- [ ] Backup keys securely

---

## Future Enhancements

1. **Team-specific keys** - Unique key per team
2. **Key expiration** - Time-limited access
3. **Multi-factor** - Email verification + API key
4. **Dashboard** - Team sees their key after registration
5. **Key revocation** - Disable compromised keys
6. **Audit logs** - Full authentication history

---

**API Key authentication is now ready! Change the default key before going live.** 🔐
