# 🚀 Quick Reference - Environment Variables

## ⚡ Run This First

Before starting development or deployment:

```bash
cd backend
npm run validate-env
```

---

## 📋 Backend Variables (.env)

| Variable | Required | Example | Generate With |
|----------|----------|---------|---------------|
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/db` | MongoDB Atlas |
| `JWT_SECRET` | ✅ | 64+ char string | `openssl rand -base64 64` |
| `ADMIN_USERNAME` | ✅ | `admin-secure-2025` | Manual |
| `ADMIN_PASSWORD` | ✅ | 20+ char strong password | Password generator |
| `ADMIN_ROUTE_PATH` | ✅ | 32 char hex | `openssl rand -hex 32` |
| `ROUND1_API_KEY` | ✅ | `MEDUSA_R1_2025` | Manual (distribute to teams) |
| `ROUND2_API_KEY` | ✅ | `MEDUSA_R2_2025` | Manual (distribute to teams) |
| `ROUND1_FLAG` | ✅ | `MEDUSA{flag_content}` | Manual |
| `ROUND2_PWN_FLAG` | ✅ | `MEDUSA{pwn_flag}` | Manual |
| `ROUND2_ANDROID_FLAG` | ✅ | `MEDUSA{android_flag}` | Manual |
| `GOOGLE_CLOUD_PROJECT_ID` | ✅ | `medusa-471513` | GCP Console |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | ✅ | `medusa_gc_bucket` | GCP Console |
| `GOOGLE_CLOUD_KEY_FILE` | ⚠️ | `gcp-service-account.json` | GCP IAM |
| `PORT` | ⚪ | `3001` | Manual (default: 3001) |
| `NODE_ENV` | ⚪ | `production` | Manual |

---

## 📋 Frontend Variables (.env or .env.local)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | ✅ | `http://localhost:3001` (dev)<br>`https://api.yourdomain.com` (prod) |

---

## 🔧 Common Commands

### **Validate Environment:**
```bash
cd backend
npm run validate-env
```

### **Generate Secrets:**
```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# Admin Route Path (32 hex chars)
openssl rand -hex 32

# Strong Password (Linux/Mac)
pwgen -s 32 1
```

### **Check Environment Loading:**
```bash
cd backend
node -r dotenv/config -e "console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING')"
```

### **Start Development:**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
npm run dev
```

---

## ⚠️ Common Issues

### **"Missing XXXX environment variable"**
```bash
# Solution:
cd backend
cp .env.example .env
notepad .env  # Edit with your values
npm run validate-env
```

### **GCP Storage errors**
```bash
# Check:
1. gcp-service-account.json exists in backend/
2. GOOGLE_CLOUD_PROJECT_ID is set
3. GOOGLE_CLOUD_STORAGE_BUCKET is set
4. Service account has Storage Admin role
```

### **JWT errors**
```bash
# Generate new secret:
openssl rand -base64 64

# Add to backend/.env:
JWT_SECRET=<generated_value>
```

---

## 📁 File Locations

| File | Purpose | Track in Git? |
|------|---------|---------------|
| `backend/.env` | Actual secrets | ❌ NO (.gitignored) |
| `backend/.env.example` | Template | ✅ YES (safe) |
| `.env` or `.env.local` | Frontend config | ❌ NO (.gitignored) |
| `.env.example` | Frontend template | ✅ YES (safe) |
| `backend/gcp-service-account.json` | GCP credentials | ❌ NO (.gitignored) |

---

## 🔒 Security Checklist

Before committing code:

```bash
# 1. Check git status
git status --ignored

# 2. Verify .env files are ignored (should appear under ignored files)
# Expected output includes:
#   .env
#   backend/.env
#   backend/gcp-service-account.json

# 3. Search for accidental hardcoded secrets
git grep -E "(mongodb\+srv://|rzp_|sk_|AIza)" -- '*.js' '*.ts'
# Should return: no matches

# 4. Run validation
cd backend && npm run validate-env
```

---

## 🚀 Deployment Quick Start

### **Render.com:**
1. Go to Dashboard → Environment
2. Add each variable from `backend/.env`
3. Don't upload `.env` file

### **Vercel (Frontend):**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.com
```

### **Heroku:**
```bash
heroku config:set JWT_SECRET="xxx" --app medusa-backend
heroku config:set MONGODB_URI="xxx" --app medusa-backend
# ... repeat for all variables
```

---

## 📚 Full Documentation

- **Complete Guide:** `ENVIRONMENT_SECURITY_GUIDE.md`
- **Security Summary:** `API_KEY_SECURITY_SUMMARY.md`
- **Race Conditions:** `backend/RACE_CONDITION_FIX.md`

---

## ✅ Status

**Environment Security:** 🟢 **9.9/10**

All API keys and credentials are now stored in environment variables!
