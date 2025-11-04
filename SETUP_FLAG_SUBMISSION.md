# Quick Setup Guide for Flag Submission Feature

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

This will install the new `express-rate-limit` package needed for rate limiting.

### 2. Verify MongoDB Connection
Ensure your `.env` file in the backend folder has:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

### 3. Start the Backend Server
```bash
npm run dev
```

Or for production:
```bash
npm start
```

### 4. Test the Backend API
```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"ok"}`

### 5. Start the Frontend
In a new terminal:
```bash
cd ..
npm run dev
```

### 6. Test the Feature
1. Open browser to `http://localhost:5173/submit-flag`
2. Fill in test data:
   - Team ID: `TEST001`
   - Flag: `flag{test_submission}`
3. Click "Submit Flag"
4. Should see success message

## Verification

### Check Database
Connect to your MongoDB and verify the `flagsubmissions` collection:
```javascript
db.flagsubmissions.find().pretty()
```

### Check Backend Logs
You should see:
```
Server running on port 3001
```

## Common Issues

### Issue: "express-rate-limit not found"
**Solution:**
```bash
cd backend
npm install express-rate-limit
```

### Issue: "Cannot connect to MongoDB"
**Solution:** Verify `MONGODB_URI` in `.env` file

### Issue: CORS errors in browser
**Solution:** Update `corsOptions` in `backend/server.js` to include your frontend URL:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173', // Add for local development
    'https://medusa.ecsc-uok.com',
    'https://www.medusa.ecsc-uok.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Issue: 404 on `/submit-flag` route
**Solution:** Clear browser cache and hard reload (Ctrl+F5)

## Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medusa?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
```

### Frontend `.env` (optional)
```env
VITE_API_URL=https://your-backend-url.com
```

If not set, defaults to: `https://medusa-backend-production.up.railway.app`

## Next Steps

1. **Test all endpoints** using the examples in FLAG_SUBMISSION_FEATURE.md
2. **Add your frontend URL to CORS** if deploying
3. **Implement flag validation logic** in `backend/routes/flag.js`
4. **Create admin dashboard** for flag verification (optional)
5. **Set up monitoring** for rate limit violations

## Production Deployment

### Backend
1. Push backend code to your hosting (Railway, Heroku, etc.)
2. Set environment variables in hosting dashboard
3. Ensure MongoDB is accessible from your hosting provider

### Frontend
1. Build the frontend: `npm run build`
2. Deploy `dist` folder to your hosting (Vercel, Netlify, etc.)
3. Set `VITE_API_URL` environment variable if needed

### Update CORS
In `backend/server.js`, add your production frontend URL:
```javascript
const corsOptions = {
  origin: [
    'https://your-production-frontend.com',
    'https://medusa.ecsc-uok.com',
    'https://www.medusa.ecsc-uok.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads `/submit-flag` page
- [ ] Empty form shows validation errors
- [ ] Valid submission succeeds
- [ ] Duplicate submission shows error
- [ ] Rate limiting works after 10 submissions
- [ ] Success message displays correctly
- [ ] Navigation back to home works
- [ ] Mobile responsive design works
- [ ] Database records submissions correctly

## Support

For issues, check:
1. Backend logs: `npm run dev` output
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab for API calls
4. MongoDB logs: Check your database connection

Created: November 4, 2025
