# 🔐 Secure Flag Storage Setup Guide

## Why Environment Variables?

**NEVER hardcode flags in source code!** Here's why:

### Security Risks of Hardcoded Flags ❌
- ✗ Visible in git repository and history
- ✗ Anyone with code access can see flags
- ✗ Cannot rotate without code changes and redeployment
- ✗ May appear in logs, error messages, or stack traces
- ✗ Violates separation of code and configuration

### Benefits of Environment Variables ✅
- ✓ Flags never appear in version control
- ✓ Different flags for dev/staging/production
- ✓ Easy rotation without code changes
- ✓ Access control at infrastructure level
- ✓ Industry-standard best practice

---

## Setup Instructions

### Step 1: Create .env File

```bash
cd backend
cp .env.example .env
```

### Step 2: Edit .env with Real Flags

```bash
# Open .env in a text editor
nano .env   # or use VS Code
```

**Example .env file:**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/medusa-ctf

# JWT Secret
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Server
PORT=5000
NODE_ENV=production

# FLAGS - Keep these secret!
ROUND1_FLAG=MEDUSA{5t3g4n0_1n_7h3_d33p_4bY55_0f_7h3_0c34n_15_4_7r345ur3}
ROUND2_ANDROID_FLAG=MEDUSA{4ndr01d_r3v3r53_3ng1n33r1ng_m4st3r}
ROUND2_PWN_FLAG=MEDUSA{pwn_b1n4ry_3xpl01t4t10n_ch4mp10n}

# Frontend
FRONTEND_URL=https://medusa2025.vercel.app
```

### Step 3: Verify .gitignore

Ensure `.env` is in your `.gitignore`:

```bash
# Check if .env is ignored
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

### Step 4: Load Environment Variables

The backend automatically loads `.env` using `dotenv` package.

Verify in `server.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

### Step 5: Test Configuration

```bash
# Start the backend
cd backend
npm start

# You should see:
# ✅ Server started
# ✅ MongoDB connected
# ✅ All flags loaded from environment
```

If flags are missing, you'll see:
```
❌ CRITICAL: ROUND1_FLAG not set in environment variables!
Error: Missing ROUND1_FLAG environment variable
```

---

## Deployment Setup

### For GCP (Google Cloud Platform)

1. **Set environment variables in Cloud Run:**
```bash
gcloud run deploy medusa-backend \
  --set-env-vars "ROUND1_FLAG=MEDUSA{...}" \
  --set-env-vars "ROUND2_ANDROID_FLAG=MEDUSA{...}" \
  --set-env-vars "ROUND2_PWN_FLAG=MEDUSA{...}" \
  --set-env-vars "JWT_SECRET=your-secret" \
  --set-env-vars "MONGODB_URI=your-mongodb-uri"
```

2. **Or use Secret Manager (recommended):**
```bash
# Create secrets
echo -n "MEDUSA{your_flag}" | gcloud secrets create round1-flag --data-file=-
echo -n "MEDUSA{your_flag}" | gcloud secrets create round2-android-flag --data-file=-
echo -n "MEDUSA{your_flag}" | gcloud secrets create round2-pwn-flag --data-file=-

# Grant access to Cloud Run service
gcloud secrets add-iam-policy-binding round1-flag \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### For Docker

1. **Create .env file on server (never commit!):**
```bash
ssh your-server
cd /path/to/medusa-backend
nano .env
# Paste your environment variables
```

2. **Run Docker with env file:**
```bash
docker-compose --env-file .env up -d
```

Or pass directly:
```bash
docker run -d \
  -e ROUND1_FLAG="MEDUSA{...}" \
  -e ROUND2_ANDROID_FLAG="MEDUSA{...}" \
  -e ROUND2_PWN_FLAG="MEDUSA{...}" \
  medusa-backend
```

### For Vercel/Netlify Functions

1. Go to project settings
2. Add environment variables:
   - `ROUND1_FLAG`
   - `ROUND2_ANDROID_FLAG`
   - `ROUND2_PWN_FLAG`
   - `JWT_SECRET`
   - `MONGODB_URI`

3. Redeploy

---

## Flag Rotation

If a flag is compromised:

### Local Development
1. Update `.env` file with new flag
2. Restart backend: `npm start`

### Production (GCP)
1. Update environment variable:
```bash
gcloud run services update medusa-backend \
  --set-env-vars "ROUND1_FLAG=MEDUSA{new_flag_here}"
```

2. Service automatically restarts with new flag

**No code changes needed! No git commits! No redeployment!**

---

## Security Checklist

- [ ] `.env` file created with real flags
- [ ] `.env` is in `.gitignore`
- [ ] `.env` is never committed to git
- [ ] Production flags are different from development
- [ ] Environment variables set on production server
- [ ] Only necessary people have access to production environment
- [ ] Flags are rotated if compromised
- [ ] `.env.example` has placeholder values only (safe to commit)

---

## Testing Flag Validation

### Test Correct Flag
```bash
curl -X POST http://localhost:5000/api/flag/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flag": "MEDUSA{5t3g4n0_1n_7h3_d33p_4bY55_0f_7h3_0c34n_15_4_7r345ur3}",
    "round": 1
  }'
```

### Test Incorrect Flag
```bash
curl -X POST http://localhost:5000/api/flag/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flag": "MEDUSA{wrong_flag}",
    "round": 1
  }'
```

### Test Round 2 Android Challenge
```bash
curl -X POST http://localhost:5000/api/flag/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flag": "MEDUSA{4ndr01d_r3v3r53_3ng1n33r1ng_m4st3r}",
    "round": 2,
    "challengeType": "android"
  }'
```

---

## Troubleshooting

### Error: "Missing ROUND1_FLAG environment variable"
**Solution:** Create `.env` file and add `ROUND1_FLAG=MEDUSA{...}`

### Error: "Cannot find module 'dotenv'"
**Solution:** Install dotenv: `npm install dotenv`

### Flags not loading in production
**Solution:** Check environment variables are set on production platform

### Still seeing hardcoded flags
**Solution:** Make sure you've pulled latest code with environment variable implementation

---

## Additional Security Measures

1. **Use Secret Management Systems:**
   - GCP Secret Manager
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault

2. **Rotate Flags Regularly:**
   - After each competition round
   - If any developer leaves the team
   - If there's any suspicion of compromise

3. **Audit Access:**
   - Log who accesses production environment
   - Limit access to production secrets
   - Use service accounts with minimal permissions

4. **Monitor for Leaks:**
   - Use tools like `git-secrets` to prevent accidental commits
   - Scan for exposed secrets in logs
   - Monitor public repositories for leaked credentials

---

## Summary

✅ **DO:**
- Store flags in `.env` file (never commit)
- Use environment variables in code
- Different flags for dev/staging/production
- Rotate flags when compromised
- Use secret management systems in production

❌ **DON'T:**
- Hardcode flags in source code
- Commit `.env` file to git
- Share flags via email/chat
- Use same flags across environments
- Leave flags in code comments

---

**Remember:** A compromised flag means you must change code, commit, and redeploy. With environment variables, you just update one configuration value. This is the industry standard for a reason! 🔐
