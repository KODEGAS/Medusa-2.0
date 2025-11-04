# Flag Submission Feature

## Overview
The Flag Submission feature allows CTF competitors to submit captured flags during the competition. The system validates submissions, prevents duplicates, and stores them for verification and scoring.

## Features

### Frontend (`/submit-flag`)
- **Clean, cyberpunk-themed UI** matching the Medusa design system
- **Real-time validation** of Team ID and Flag inputs
- **Success confirmation** with "Results coming soon" message
- **Error handling** for duplicates, rate limiting, and network issues
- **Mobile responsive** design
- **Accessible** from the main navigation header

### Backend API (`/api/flag/submit`)
- **Rate limiting**: 10 submissions per 5 minutes per IP
- **Input validation**: Sanitizes and validates Team ID and Flag
- **Duplicate prevention**: Checks for existing submissions
- **Tracking**: Records IP address, user agent, and timestamp
- **Database storage**: MongoDB with indexed fields for performance

## Security Features

1. **Input Sanitization**
   - Team ID: Max 50 characters, trimmed
   - Flag: 5-200 characters, trimmed
   - SQL injection and XSS prevention

2. **Rate Limiting**
   - 10 submissions per 5 minutes per IP
   - Prevents brute force attacks
   - Returns clear retry-after message

3. **Duplicate Detection**
   - Compound index on (teamId, flag, challengeId)
   - Prevents multiple submissions of same flag
   - Returns HTTP 409 Conflict with details

4. **Tracking & Audit**
   - IP address logging
   - User agent tracking
   - Timestamp recording
   - Verification status tracking

## API Endpoints

### POST `/api/flag/submit`
Submit a captured flag for verification.

**Request Body:**
```json
{
  "teamId": "TEAM001",
  "flag": "flag{example_flag_string}"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Flag submitted successfully and is being verified",
  "submissionId": "507f1f77bcf86cd799439011",
  "submittedAt": "2025-11-04T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `409 Conflict`: Duplicate submission
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### GET `/api/flag/submissions/:teamId`
Retrieve all submissions for a specific team.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "teamId": "TEAM001",
      "flag": "flag{example}",
      "isCorrect": true,
      "points": 100,
      "verified": true,
      "submittedAt": "2025-11-04T10:30:00.000Z"
    }
  ]
}
```

### GET `/api/flag/stats`
Get overall competition statistics and leaderboard.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSubmissions": 150,
    "verifiedSubmissions": 120,
    "correctSubmissions": 95,
    "topTeams": [
      {
        "_id": "TEAM001",
        "correctFlags": 12,
        "totalPoints": 1200
      }
    ]
  }
}
```

## Database Schema

### FlagSubmission Model
```javascript
{
  teamId: String (required, indexed),
  flag: String (required),
  isCorrect: Boolean (default: false),
  points: Number (default: 0),
  challengeId: String (optional),
  submittedAt: Date (default: now, indexed),
  ipAddress: String,
  userAgent: String,
  verified: Boolean (default: false),
  verifiedAt: Date (optional)
}
```

**Indexes:**
- `teamId` (single)
- `submittedAt` (single)
- `{ teamId, flag, challengeId }` (compound, unique)

## Usage

### For Competitors
1. Navigate to "Submit Flag" in the header menu
2. Enter your Team ID (provided during registration)
3. Enter the captured flag (case-sensitive)
4. Click "Submit Flag"
5. Wait for success confirmation
6. Results will be released after verification

### For Admins
1. Access MongoDB to review submissions
2. Update `verified` and `isCorrect` fields manually or via admin panel
3. Use `/api/flag/stats` endpoint for leaderboard data

## Environment Variables

Add to your `.env` file:
```env
# Backend (already configured)
MONGODB_URI=your_mongodb_connection_string
PORT=3001

# Frontend (add if needed)
VITE_API_URL=https://your-backend-url.com
```

## Testing

### Manual Testing
1. Visit `/submit-flag` page
2. Try submitting with empty fields (should show errors)
3. Try submitting with valid data (should succeed)
4. Try submitting the same flag twice (should show duplicate error)
5. Try submitting 11 times quickly (should hit rate limit)

### API Testing with curl
```bash
# Submit a flag
curl -X POST https://your-backend-url.com/api/flag/submit \
  -H "Content-Type: application/json" \
  -d '{"teamId":"TEAM001","flag":"flag{test}"}'

# Get team submissions
curl https://your-backend-url.com/api/flag/submissions/TEAM001

# Get statistics
curl https://your-backend-url.com/api/flag/stats
```

## Future Enhancements

1. **Real-time Validation**: Validate flags against correct answers immediately
2. **Live Leaderboard**: Display real-time team rankings
3. **Challenge Assignment**: Link flags to specific challenges
4. **Points System**: Automatic point calculation based on difficulty
5. **Hints System**: Allow teams to request hints for points
6. **Admin Dashboard**: Web interface for flag verification and management
7. **WebSocket Updates**: Real-time notifications for verified submissions
8. **Team Analytics**: Detailed performance metrics per team

## Troubleshooting

### Flag submission fails with network error
- Check backend is running and accessible
- Verify `VITE_API_URL` environment variable
- Check CORS settings in `backend/server.js`

### Rate limit errors
- Wait 5 minutes before retrying
- Contact admin if legitimate submissions are blocked

### Duplicate submission errors
- Verify the flag hasn't been submitted before
- Check team's submission history at `/api/flag/submissions/:teamId`

## Files Created/Modified

**New Files:**
- `src/pages/FlagSubmissionPage.tsx` - Frontend page
- `backend/models/FlagSubmission.js` - Database model
- `backend/routes/flag.js` - API routes
- `FLAG_SUBMISSION_FEATURE.md` - This documentation

**Modified Files:**
- `src/App.tsx` - Added route for flag submission
- `src/components/Header.tsx` - Added navigation link
- `backend/server.js` - Registered flag routes
- `src/index.css` - Added shake and bounce animations

## Contact

For issues or questions about flag submission:
- Check existing submissions: Contact your team lead
- Technical issues: Contact CTF organizers
- Suspected issues with verification: Email admin@medusa.com
