# Admin Password Security Migration Guide

## Overview
This guide helps you migrate from plain text admin passwords to secure bcrypt hashed passwords.

## Why This Matters
🔴 **CRITICAL SECURITY ISSUE**: Storing passwords in plain text is a major security vulnerability (OWASP A07:2021 - Identification and Authentication Failures). If your environment variables are ever exposed, attackers can immediately access the admin panel.

✅ **Solution**: bcrypt hashing makes passwords computationally expensive to crack, even if the hash is exposed.

---

## Migration Steps

### Step 1: Generate Password Hash
Run the password hashing script:

```bash
npm run hash-password
```

This will:
- Read your current `ADMIN_PASSWORD` from .env
- Generate a secure bcrypt hash (salt rounds: 12)
- Display the hash to add to your environment

**Example output:**
```
🔐 Hashing admin password...
   Salt rounds: 12
   Original password length: 24 characters

✅ Password hashed successfully!

📋 ADD THIS TO YOUR .env FILE:
────────────────────────────────────────────────────────────────────────────────
ADMIN_PASSWORD_HASH=$2b$12$abcd1234EXAMPLEHASH5678...
────────────────────────────────────────────────────────────────────────────────
```

### Step 2: Update Your .env File
Add the `ADMIN_PASSWORD_HASH` variable to your `.env` file:

```bash
# Old (keep for now during migration):
ADMIN_PASSWORD=your-secure-password-here

# New (add this):
ADMIN_PASSWORD_HASH=$2b$12$abcd1234EXAMPLEHASH5678...
```

**Important**: Keep both variables during testing to ensure rollback capability.

### Step 3: Test Admin Login
1. Restart your server:
   ```bash
   npm run dev
   ```

2. Try logging in to the admin panel with your original password

3. Verify you can access all admin functions

### Step 4: Verify Environment Validation
Run the validation script:

```bash
npm run validate-env
```

You should see:
```
✅ ADMIN_PASSWORD_HASH: Valid bcrypt hash detected
⚠️  ADMIN_PASSWORD: Still set - remove after migration complete
```

### Step 5: Update Production Environment
For GCP Cloud Run or other production environments:

```bash
# Add the new hash variable
gcloud run services update medusa-backend \
  --set-env-vars ADMIN_PASSWORD_HASH=$2b$12$your-hash-here...

# Or update via console/terraform/other deployment method
```

### Step 6: Remove Plain Text Password (After Confirmation)
Once you've confirmed login works in production for 24-48 hours:

1. Remove `ADMIN_PASSWORD` from your `.env` file
2. Remove `ADMIN_PASSWORD` from production environment variables
3. Run `npm run validate-env` to confirm

---

## Fallback Behavior

The system supports **graceful fallback** during migration:

### Priority Order:
1. ✅ **ADMIN_PASSWORD_HASH** (preferred, secure)
2. ⚠️  **ADMIN_PASSWORD** (fallback, shows warning in logs)

### Warning Messages:
If using plain text fallback, you'll see:
```
⚠️  WARNING: Using plain text password comparison. Migrate to ADMIN_PASSWORD_HASH immediately!
```

---

## Security Details

### Bcrypt Configuration
- **Salt Rounds**: 12 (recommended for 2025)
- **Hash Format**: `$2b$` (bcrypt version)
- **Hash Length**: 60 characters
- **Computation Time**: ~300ms per verification (prevents brute force)

### Password Requirements
Ensure your admin password meets these criteria:
- Minimum 16 characters (20+ recommended)
- Mix of uppercase and lowercase letters
- Numbers
- Special characters

---

## Troubleshooting

### Problem: "Invalid admin credentials" after migration
**Solution**: 
1. Check that `ADMIN_PASSWORD_HASH` is correctly copied (all 60 characters)
2. Verify no extra spaces or line breaks in the .env file
3. Restart the server to reload environment variables

### Problem: Hash generation fails
**Solution**:
1. Ensure `ADMIN_PASSWORD` is set in your .env file
2. Verify bcrypt package is installed: `npm list bcrypt`
3. Check Node.js version compatibility (Node 16+ recommended)

### Problem: Server won't start after migration
**Solution**:
1. Check environment validation errors: `npm run validate-env`
2. Ensure either `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD` is set
3. Verify .env file is being loaded correctly

---

## Production Deployment Checklist

- [ ] Generate password hash with `npm run hash-password`
- [ ] Add `ADMIN_PASSWORD_HASH` to production environment variables
- [ ] Test login in production environment
- [ ] Monitor logs for any authentication issues (24-48 hours)
- [ ] Remove `ADMIN_PASSWORD` from production environment
- [ ] Remove `ADMIN_PASSWORD` from local .env files
- [ ] Update deployment documentation
- [ ] Rotate admin password and regenerate hash (optional but recommended)

---

## Security Best Practices

### After Migration:
1. **Rotate passwords regularly** (every 90 days recommended)
2. **Use strong passwords** (20+ characters, high entropy)
3. **Enable audit logging** (already implemented)
4. **Monitor failed login attempts** (rate limiting active)
5. **Consider implementing MFA** (future enhancement)

### Password Storage:
- ✅ Never commit `.env` files to version control
- ✅ Use secret management systems in production (GCP Secret Manager, AWS Secrets Manager)
- ✅ Restrict access to environment configuration
- ✅ Rotate passwords after team member departures

---

## Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

## Support

If you encounter issues during migration:
1. Check server logs for detailed error messages
2. Verify environment variable configuration
3. Test locally before deploying to production
4. Keep the plain text password as fallback until fully verified

**Remember**: Security is a continuous process. Regular audits and updates are essential.
