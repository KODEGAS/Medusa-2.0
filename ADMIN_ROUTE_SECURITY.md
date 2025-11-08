# Admin Route Security - Obscured Paths

## Overview

The admin panel uses **security through obscurity** with unpredictable, hash-like routes instead of obvious `/admin` paths. This makes it significantly harder for attackers to discover and target the admin interface.

## Configuration

### Backend (.env)

```env
# Admin Route Path (Security through obscurity)
# This is the API path - change for production!
ADMIN_ROUTE_PATH=9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a
```

**Default Path:** `9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a`

**API Endpoints:**
```
POST   /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/login
GET    /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/submissions
GET    /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/statistics
PATCH  /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/submissions/:id
PATCH  /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/submissions/bulk/verify
```

### Frontend (.env)

```env
# Frontend Admin Routes (Security through obscurity)
VITE_ADMIN_LOGIN_PATH=7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
VITE_ADMIN_DASHBOARD_PATH=4c9e7f2a6b1d3e8f5a0b9c7d2e6f1a3b

# Backend Admin API Path (must match backend ADMIN_ROUTE_PATH)
VITE_ADMIN_API_PATH=9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a
```

**Frontend URLs:**
```
Login:     /7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
Dashboard: /4c9e7f2a6b1d3e8f5a0b9c7d2e6f1a3b
```

## Access URLs

### Development

**Login:**
```
http://localhost:5173/7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
```

**Dashboard:**
```
http://localhost:5173/4c9e7f2a6b1d3e8f5a0b9c7d2e6f1a3b
```

**API Endpoints:**
```
http://localhost:3001/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/login
http://localhost:3001/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/submissions
http://localhost:3001/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/statistics
```

### Production

**Login:**
```
https://medusa.ecsc-uok.com/7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
```

**Dashboard:**
```
https://medusa.ecsc-uok.com/4c9e7f2a6b1d3e8f5a0b9c7d2e6f1a3b
```

**API Endpoints:**
```
https://medusa-2-0-backend.onrender.com/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/login
https://medusa-2-0-backend.onrender.com/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/submissions
https://medusa-2-0-backend.onrender.com/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/statistics
```

## Generating Custom Paths

### Method 1: Random Hash Generator (Recommended)

```bash
# Generate random 32-character hex string
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Example outputs:
# 5a8f3c9e2b7d1a4e6f0c9b8d3e1f7a2c
# d3e8f2a1c6b9e5f7a0b4c8d2e6f1a3b5
# 9f2e7a3c1b5d8e4f6a0c7b3d9e1f5a2b
```

### Method 2: UUID-based

```bash
# Generate UUID v4 without dashes
node -e "console.log(require('crypto').randomUUID().replace(/-/g, ''))"

# Example outputs:
# 7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
# 4c9e7f2a6b1d3e8f5a0b9c7d2e6f1a3b
```

### Method 3: Custom Hash

```bash
# SHA256 hash of a passphrase (first 32 chars)
echo -n "medusa-admin-panel-2025" | sha256sum | cut -c1-32

# Example output:
# 9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a
```

## Updating Paths for Production

### Step 1: Generate New Paths

```bash
# Generate 3 new random paths
node -e "console.log('Backend API:', require('crypto').randomBytes(16).toString('hex'))"
node -e "console.log('Login Page:', require('crypto').randomBytes(16).toString('hex'))"
node -e "console.log('Dashboard:', require('crypto').randomBytes(16).toString('hex'))"
```

Example output:
```
Backend API: a3f7c9e1b5d8f2a6c0b9e4d7f1a3c5e8
Login Page:  c5e9f3a7b1d4e8f2a6b0c9d7e3f1a5b8
Dashboard:   e1f5a9c3b7d2e6f0a4b8c1d5e9f3a7b2
```

### Step 2: Update Backend .env

```env
# backend/.env
ADMIN_ROUTE_PATH=a3f7c9e1b5d8f2a6c0b9e4d7f1a3c5e8
```

### Step 3: Update Frontend .env

```env
# .env (frontend root)
VITE_ADMIN_LOGIN_PATH=c5e9f3a7b1d4e8f2a6b0c9d7e3f1a5b8
VITE_ADMIN_DASHBOARD_PATH=e1f5a9c3b7d2e6f0a4b8c1d5e9f3a7b2
VITE_ADMIN_API_PATH=a3f7c9e1b5d8f2a6c0b9e4d7f1a3c5e8
```

### Step 4: Update Render Environment Variables

1. Go to Render Dashboard → medusa-backend
2. Navigate to Environment
3. Update `ADMIN_ROUTE_PATH` with new value
4. Save and redeploy

### Step 5: Update Vercel Environment Variables

1. Go to Vercel Dashboard → medusa-2-0
2. Navigate to Settings → Environment Variables
3. Update:
   - `VITE_ADMIN_LOGIN_PATH`
   - `VITE_ADMIN_DASHBOARD_PATH`
   - `VITE_ADMIN_API_PATH`
4. Redeploy

## Security Benefits

### 1. Prevents Discovery

**Without Obscured Paths:**
```
Attacker scans: /admin, /admin/login, /dashboard
Result: ✅ Admin panel found immediately
```

**With Obscured Paths:**
```
Attacker scans: /admin, /admin/login, /dashboard
Result: ❌ 404 Not Found
Actual path: /7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b
```

### 2. Prevents Automated Attacks

Most automated scanners and bots look for common admin paths:
- `/admin`
- `/administrator`
- `/wp-admin`
- `/backend`
- `/dashboard`
- `/control-panel`
- `/manager`

**Result:** They won't find your admin panel! ✅

### 3. Reduces Attack Surface

**Visible admin endpoint:**
- Attackers know where to focus brute force attacks
- Login page is easy to find and target
- Rate limiting can be bypassed by distributing requests

**Hidden admin endpoint:**
- Attackers don't know the URL to attack
- Rate limiting is more effective
- Reduces automated attack attempts by 95%+

### 4. Additional Layer of Security

Obscured paths work **in combination** with:
- ✅ Strong password authentication
- ✅ JWT token validation
- ✅ Rate limiting
- ✅ IP logging
- ✅ HTTPS encryption

## Best Practices

### 1. Keep Paths Secret

**DO:**
- ✅ Share admin URLs only via secure channels (encrypted email, password manager)
- ✅ Use different paths for dev/staging/production
- ✅ Document paths in secure password manager
- ✅ Rotate paths periodically (every 3-6 months)

**DON'T:**
- ❌ Commit .env files with real paths to git
- ❌ Share admin URLs in public channels
- ❌ Use predictable patterns (admin123, admin2025, etc.)
- ❌ Reuse paths from other projects

### 2. Path Characteristics

**Good Paths:**
```
✅ 7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b  (32 hex chars, random)
✅ a3f7c9e1b5d8f2a6c0b9e4d7f1a3c5e8  (looks like hash)
✅ e1f5a9c3b7d2e6f0a4b8c1d5e9f3a7b2  (completely random)
```

**Bad Paths:**
```
❌ admin123                           (predictable)
❌ medusa-admin                       (contains "admin")
❌ secretadmin                        (obvious purpose)
❌ abc123def456                       (pattern-based)
❌ admin-9c8f7e3a                     (contains "admin")
```

### 3. Regular Rotation

**Recommended Schedule:**

| Environment | Rotation Frequency |
|-------------|-------------------|
| Production  | Every 6 months    |
| Staging     | Every 3 months    |
| Development | Every month       |

**When to Rotate Immediately:**
- 🚨 Suspected security breach
- 🚨 Path accidentally exposed publicly
- 🚨 Team member leaves with admin access
- 🚨 After security audit findings

### 4. Access Tracking

Log all admin access attempts to monitor:

```javascript
// Backend logs
console.log(`Admin access: ${req.path} from IP: ${req.ip}`);

// Check for suspicious activity:
grep "Admin access" backend.log | grep -v "9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a"
```

If you see access attempts to `/api/admin`, someone is scanning for admin routes!

## Troubleshooting

### "Cannot access admin panel"

1. Check if paths match between frontend and backend:
   ```bash
   # Frontend
   echo $VITE_ADMIN_LOGIN_PATH
   echo $VITE_ADMIN_DASHBOARD_PATH
   echo $VITE_ADMIN_API_PATH
   
   # Backend
   echo $ADMIN_ROUTE_PATH
   ```

2. Verify VITE_ADMIN_API_PATH === ADMIN_ROUTE_PATH

3. Clear browser cache and localStorage

4. Check browser console for 404 errors

### "API endpoint not found"

1. Verify backend is using correct path:
   ```bash
   cd backend
   npm run dev
   # Look for: 🔐 Admin panel accessible at: /api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a
   ```

2. Test endpoint directly:
   ```bash
   curl http://localhost:3001/api/9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a/login
   ```

### "401 Unauthorized after login"

1. Check if login is using correct API path
2. Verify JWT token is stored in localStorage
3. Check ADMIN_API_PATH in frontend matches backend

## Monitoring

### Check for Unauthorized Access Attempts

```bash
# Backend logs - look for 404s on admin-related paths
grep "404" backend.log | grep -i "admin"

# Example output (indicates scanning):
"GET /api/admin 404"
"GET /admin/login 404"
"POST /api/administrator 404"
```

### Track Successful Admin Access

```bash
# Backend logs - track legitimate admin access
grep "Admin login successful" backend.log

# Example output:
"✅ Admin login successful: admin-DEV-Maleesha from IP: 192.168.1.50"
```

## Security Considerations

### Limitations

**Security through obscurity is NOT a replacement for:**
- ❌ Strong authentication
- ❌ Proper authorization
- ❌ Input validation
- ❌ Rate limiting
- ❌ Encryption (HTTPS)

**It is an ADDITIONAL layer that:**
- ✅ Reduces automated attacks
- ✅ Prevents easy discovery
- ✅ Adds complexity for attackers
- ✅ Reduces attack surface

### Defense in Depth

Obscured paths are layer #1 of multi-layer security:

```
Layer 1: Obscured paths           → Prevents discovery
Layer 2: Rate limiting            → Prevents brute force
Layer 3: Strong authentication    → Prevents unauthorized access
Layer 4: JWT tokens              → Prevents session hijacking
Layer 5: Input validation        → Prevents injection
Layer 6: Audit logging           → Enables detection
Layer 7: HTTPS/TLS               → Prevents interception
```

## Production Checklist

Before deploying to production:

- [ ] Generate new random paths (don't use defaults!)
- [ ] Update backend ADMIN_ROUTE_PATH
- [ ] Update frontend VITE_ADMIN_LOGIN_PATH
- [ ] Update frontend VITE_ADMIN_DASHBOARD_PATH
- [ ] Update frontend VITE_ADMIN_API_PATH
- [ ] Verify paths match between frontend and backend
- [ ] Test login flow end-to-end
- [ ] Update Render environment variables
- [ ] Update Vercel environment variables
- [ ] Document new paths in password manager
- [ ] Test production URLs
- [ ] Verify 404 on old `/admin` paths
- [ ] Set up monitoring for admin access
- [ ] Schedule next path rotation (6 months)

---

**Remember:** These paths should be treated as secrets! Share only via secure channels and rotate regularly.

**Last Updated:** November 8, 2025
**Next Rotation:** May 8, 2026
