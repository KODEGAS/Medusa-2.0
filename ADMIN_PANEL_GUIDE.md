# Admin Panel Documentation

## Overview

The Admin Panel provides a secured interface for administrators to monitor and manage flag submissions for the Medusa CTF Round 1 challenge.

## Features

### 🔐 Secure Authentication
- Username/password authentication
- JWT-based session management (8-hour token validity)
- Automatic logout on token expiration

### 📊 Dashboard Statistics
- **Teams Overview**: Total teams, participating teams, participation rate
- **Submissions**: Total submissions, verified count, correct count, pending count
- **Attempts Analysis**: Teams using both attempts

### 📋 Submissions Management
- **Detailed Team View**: Expandable rows showing all team submissions
- **Attempt Tracking**: 
  - Clear display of Attempt #1 and Attempt #2
  - Exact submission timestamps (date + time with seconds)
  - Time difference between attempts (e.g., "5m 23s after first attempt")
  - Point deduction indicator (25% penalty on second attempt)
- **Status Indicators**:
  - ✅ Solved (Green) - Verified and correct
  - ❌ Incorrect (Red) - Verified but wrong
  - ⏳ Pending (Yellow) - Awaiting verification
- **Flag Preview**: Full flag text displayed in code format

### 🎯 Key Information Displayed

For each team submission:
1. **Team Information**
   - Team Name
   - Team ID
   - University

2. **First Attempt**
   - Submission date and time
   - Submitted flag
   - Verification status
   - No point deduction

3. **Second Attempt** (if exists)
   - Submission date and time
   - Time elapsed since first attempt
   - Submitted flag
   - 25% point deduction indicator
   - Verification status

## Access

### Login Credentials

**Default Admin Credentials:**
- Username: `admin`
- Password: Set in `.env` file (`ADMIN_PASSWORD`)

### URLs

- **Production**: `https://medusa.ecsc-uok.com/admin/login`
- **Development**: `http://localhost:5173/admin/login`

## Environment Setup

### Backend (.env)

Add these variables to `backend/.env`:

```env
# Admin Credentials (REQUIRED for admin panel access)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
```

⚠️ **Security Note**: Use a strong password with:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Not used anywhere else

## API Endpoints

### Admin Authentication

#### POST `/api/admin/login`
Login to admin panel

**Request:**
```json
{
  "username": "admin",
  "password": "YourPassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "username": "admin",
    "role": "admin"
  }
}
```

### Submissions Management

#### GET `/api/admin/submissions`
Get all submissions grouped by team

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `teamId` (optional): Filter by specific team
- `verified` (optional): Filter by verification status (true/false)
- `sortBy` (optional): Sort field (default: submittedAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "totalSubmissions": 102,
  "totalTeams": 51,
  "submissions": {
    "TEST001": {
      "teamInfo": {
        "teamId": "TEST001",
        "teamName": "Test Team Alpha",
        "university": "Test University"
      },
      "attempts": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "flag": "FLAG{first_attempt}",
          "attemptNumber": 1,
          "pointDeduction": 0,
          "isCorrect": false,
          "verified": true,
          "submittedAt": "2025-11-07T10:30:15.000Z"
        },
        {
          "_id": "507f1f77bcf86cd799439012",
          "flag": "FLAG{second_attempt}",
          "attemptNumber": 2,
          "pointDeduction": 0.25,
          "isCorrect": true,
          "verified": true,
          "submittedAt": "2025-11-07T10:35:38.000Z"
        }
      ]
    }
  }
}
```

#### GET `/api/admin/statistics`
Get dashboard statistics

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "teams": {
      "total": 51,
      "withSubmissions": 45,
      "withTwoAttempts": 30,
      "participationRate": "88.24%"
    },
    "submissions": {
      "total": 75,
      "verified": 60,
      "correct": 25,
      "pending": 15
    },
    "timeline": [
      {
        "_id": "2025-11-07 10:00",
        "count": 15
      }
    ]
  }
}
```

#### PATCH `/api/admin/submissions/:id`
Update submission verification status

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "verified": true,
  "isCorrect": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission updated successfully",
  "submission": { ... }
}
```

#### PATCH `/api/admin/submissions/bulk/verify`
Bulk update submissions

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "submissionIds": ["id1", "id2", "id3"],
  "verified": true,
  "isCorrect": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 3 submissions",
  "modifiedCount": 3
}
```

## Usage Guide

### 1. Login to Admin Panel

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Click "Login to Admin Panel"
4. You'll be redirected to the dashboard

### 2. View Submissions

**Dashboard Overview:**
- View statistics cards at the top
- See total teams, submissions, verified count, pending count

**Detailed Team View:**
1. Scroll to the submissions table
2. Click on any team row to expand
3. View both attempts with:
   - Exact timestamps
   - Time difference between attempts
   - Point deduction indicators
   - Verification status
   - Full flag text

### 3. Analyze Submission Patterns

**Time Analysis:**
- See when teams made their first attempt
- Track how long they took before second attempt
- Identify teams who rushed vs. teams who took time

**Scoring Insights:**
- Teams with 2 attempts have 25% penalty risk
- Quick successive attempts may indicate guessing
- Long gaps may indicate thoughtful attempts

### 4. Monitor Real-time

- Refresh the page to see new submissions
- Dashboard auto-loads latest data
- Statistics update in real-time

## Security Features

✅ **JWT Authentication**: 8-hour token validity
✅ **Role-based Access**: Only admin role can access
✅ **Password Protection**: Strong password required
✅ **Token Expiration**: Automatic logout on token expiry
✅ **HTTPS Required**: Secure transmission in production

## Troubleshooting

### "Admin access denied" error
- Check if ADMIN_USERNAME and ADMIN_PASSWORD are set in backend/.env
- Verify credentials are correct

### "Admin token expired" error
- Login again (tokens expire after 8 hours)
- Token is automatically cleared on expiration

### Can't see submissions
- Verify backend is running
- Check browser console for errors
- Ensure admin token is valid (try logging out and back in)

### Wrong submission times displayed
- Times are displayed in your local timezone
- Check browser timezone settings
- Backend stores UTC timestamps

## Best Practices

1. **Change Default Password**: Set a strong password in .env
2. **Keep Token Secure**: Don't share admin login credentials
3. **Regular Monitoring**: Check dashboard periodically during the event
4. **Verify Carefully**: Double-check flags before marking as correct/incorrect
5. **Note Timestamps**: Use timestamp data for scoring calculations

## Technical Details

### Frontend
- React + TypeScript
- shadcn/ui components
- Tailwind CSS styling
- Local storage for token management

### Backend
- Express.js routes (`/api/admin/*`)
- JWT authentication middleware
- MongoDB queries with aggregation
- Protected endpoints

### Data Flow
```
Login → JWT Token → localStorage → Authorization Header → Protected Routes → Dashboard Data
```

## Support

For technical issues or questions:
- Check browser console for errors
- Verify backend logs
- Ensure all environment variables are set
- Test with test teams first (TEST001, TEST002, etc.)

---

**Created for**: Medusa CTF 2025 - Round 1
**Version**: 1.0.0
**Last Updated**: November 7, 2025
