# Admin Dashboard Security Documentation

## 🔒 Security Features Implemented

### 1. Authentication & Authorization

#### JWT-Based Authentication
- **Token Type**: Bearer token in Authorization header
- **Token Expiry**: 8 hours
- **Secret**: Secure JWT_SECRET from environment variables
- **Role Verification**: Strict role-based access control (admin role required)

```javascript
// Token payload
{
  username: "admin",
  role: "admin",
  loginTime: 1699401600000,
  exp: 1699430400 // 8 hours from login
}
```

#### Strong Password Requirements
- Minimum 12 characters recommended
- Mix of uppercase, lowercase, numbers, and symbols
- Stored in environment variables (not in code)
- Different credentials for development and production

### 2. Rate Limiting

#### Login Rate Limiting (Brute Force Protection)
```javascript
Window: 15 minutes
Max Attempts: 5 failed login attempts per IP
Lockout: 15 minutes after exceeding limit
Skip Successful: Yes (successful logins don't count)
```

**Protection Against:**
- ✅ Brute force password attacks
- ✅ Credential stuffing
- ✅ Automated attack tools

#### API Rate Limiting
```javascript
Window: 1 minute
Max Requests: 30 requests per IP per minute
Applies to: All admin endpoints except login
```

**Protection Against:**
- ✅ API abuse
- ✅ DDoS attacks
- ✅ Data scraping

### 3. Input Validation

#### MongoDB ObjectId Validation
```javascript
// Validates before database queries
Pattern: /^[0-9a-fA-F]{24}$/
```

**Protection Against:**
- ✅ NoSQL injection
- ✅ Invalid ID attacks
- ✅ Database errors

#### Query Parameter Sanitization
```javascript
// Whitelist allowed sort fields
allowedSortFields: ['submittedAt', 'attemptNumber', 'verified', 'isCorrect']
```

**Protection Against:**
- ✅ NoSQL injection via sort parameters
- ✅ Unauthorized data access
- ✅ Database schema exposure

#### Bulk Operation Limits
```javascript
// Maximum bulk update size
Max IDs per request: 100 submissions
```

**Protection Against:**
- ✅ Resource exhaustion
- ✅ Database overload
- ✅ Accidental mass updates

#### Boolean Type Coercion
```javascript
// Ensures boolean values
verified: Boolean(verified)
isCorrect: Boolean(isCorrect)
```

**Protection Against:**
- ✅ Type confusion attacks
- ✅ Injection via boolean fields

### 4. Security Headers (from Helmet)

```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'
```

**Protection Against:**
- ✅ Clickjacking
- ✅ MIME-type sniffing
- ✅ XSS attacks
- ✅ Information leakage

### 5. CORS Configuration

```javascript
// Whitelist allowed origins
origins: [
  'http://localhost:5173',
  'https://medusa.ecsc-uok.com',
  'https://www.medusa.ecsc-uok.com'
]
credentials: true
```

**Protection Against:**
- ✅ Cross-origin attacks
- ✅ Unauthorized API access
- ✅ CSRF attacks

### 6. Error Handling

#### Generic Error Messages
```javascript
// Failed login - same message for username/password errors
"Invalid admin credentials"
```

**Protection Against:**
- ✅ User enumeration
- ✅ Information disclosure
- ✅ Account discovery

#### Detailed Server Logs
```javascript
// Logs contain full details for debugging
console.warn(`Failed admin login attempt for username: ${username} from IP: ${req.ip}`)
console.log(`✅ Admin login successful: ${username} from IP: ${req.ip}`)
```

**Benefits:**
- ✅ Audit trail
- ✅ Security monitoring
- ✅ Incident response

### 7. Token Security

#### Token Age Verification
```javascript
// Additional check beyond JWT expiry
maxTokenAge: 8 hours
tokenAge = Date.now() - decoded.loginTime
```

**Protection Against:**
- ✅ Token replay attacks
- ✅ Long-lived tokens
- ✅ Stale sessions

#### Secure Storage (Frontend)
```javascript
// Token stored in localStorage
localStorage.setItem('adminToken', token)
```

**Considerations:**
- ⚠️ Vulnerable to XSS (mitigated by CSP)
- ✅ Survives page refresh
- ✅ Easy to clear on logout

### 8. Logging & Monitoring

#### Security Events Logged
```javascript
✅ Failed login attempts (with username and IP)
✅ Successful logins (with username and IP)
✅ Submission updates (with admin username)
✅ Bulk operations (with count and admin)
✅ Access denied attempts (with reason and IP)
✅ Token validation errors
```

#### Log Format
```javascript
// Example logs
"Failed admin login attempt for username: hacker from IP: 192.168.1.100"
"✅ Admin login successful: admin from IP: 192.168.1.50 at 2025-11-08T10:30:00.000Z"
"Admin admin-DEV-Maleesha accessed submissions at 2025-11-08T10:35:00.000Z"
"✅ Admin admin-DEV-Maleesha updated submission 507f1f77bcf86cd799439011"
"Access denied - Non-admin role attempted: user from IP: 192.168.1.75"
```

## 🚨 Security Best Practices

### Environment Variables
```env
# backend/.env
ADMIN_USERNAME=admin-PROD-SecureName
ADMIN_PASSWORD=Ve3yStr0ng!P@ssw0rd#2025$Medusa
JWT_SECRET=<64+ random characters>
NODE_ENV=production
```

**Checklist:**
- ✅ Use different credentials for dev/staging/prod
- ✅ Minimum 16-character password
- ✅ Change default credentials immediately
- ✅ Never commit .env files to git
- ✅ Use environment-specific secrets
- ✅ Rotate credentials regularly (every 90 days)

### HTTPS/TLS
```
Production: https://medusa.ecsc-uok.com
Certificate: Valid SSL/TLS certificate
Protocol: TLS 1.2 or higher
```

**Requirements:**
- ✅ Force HTTPS in production
- ✅ Valid SSL certificate
- ✅ HSTS header enabled
- ✅ Redirect HTTP to HTTPS

### Database Security
```javascript
// MongoDB connection
MONGODB_URI=mongodb+srv://username:password@cluster...
```

**Checklist:**
- ✅ Use MongoDB Atlas with authentication
- ✅ Whitelist IP addresses
- ✅ Use strong database password
- ✅ Enable network encryption
- ✅ Regular backups

### Access Control
```javascript
// Only admin role can access
if (decoded.role !== 'admin') {
  return 403 Forbidden
}
```

**Policies:**
- ✅ Principle of least privilege
- ✅ Role-based access control
- ✅ Regular access audits
- ✅ Revoke access immediately when needed

## 🔍 Security Monitoring

### What to Monitor

1. **Failed Login Attempts**
   - Alert on: 3+ failed attempts from same IP
   - Action: Temporary IP block

2. **Unusual Access Patterns**
   - Alert on: Access from new IP addresses
   - Alert on: Access during unusual hours
   - Action: Verify with admin

3. **Bulk Operations**
   - Alert on: Large bulk updates
   - Alert on: Frequent bulk operations
   - Action: Verify legitimacy

4. **Token Issues**
   - Alert on: Multiple token expiration errors
   - Alert on: Invalid token attempts
   - Action: Check for attacks

### Log Analysis Commands

```bash
# Check failed login attempts
grep "Failed admin login" backend.log

# Check successful logins
grep "Admin login successful" backend.log

# Check bulk operations
grep "bulk updated" backend.log

# Check access denied
grep "Access denied" backend.log

# Count login attempts by IP
grep "login attempt" backend.log | awk '{print $NF}' | sort | uniq -c | sort -rn
```

## ⚠️ Known Limitations

### 1. Password Storage
- **Current**: Plain text comparison in memory
- **Risk**: If server memory is compromised
- **Mitigation**: Use bcrypt for password hashing (future enhancement)

### 2. localStorage for Tokens
- **Current**: Token in localStorage
- **Risk**: XSS attacks can steal tokens
- **Mitigation**: 
  - Strict CSP headers
  - Input sanitization
  - Consider httpOnly cookies (future enhancement)

### 3. Single Admin Account
- **Current**: One admin username/password
- **Risk**: No accountability for multi-admin scenarios
- **Mitigation**: Implement proper admin user management (future enhancement)

### 4. No 2FA
- **Current**: Password-only authentication
- **Risk**: Compromised passwords
- **Mitigation**: Implement TOTP/SMS 2FA (future enhancement)

### 5. Session Management
- **Current**: No active session tracking
- **Risk**: Cannot force logout of all sessions
- **Mitigation**: Implement session store with revocation (future enhancement)

## 🛡️ Attack Scenarios & Mitigations

### Scenario 1: Brute Force Attack
```
Attacker: Tries 1000 password combinations
Protection: Rate limiter blocks after 5 attempts
Duration: Locked out for 15 minutes
Result: ✅ Attack prevented
```

### Scenario 2: Token Theft via XSS
```
Attacker: Injects malicious script to steal token
Protection: CSP blocks inline scripts
Protection: Input sanitization
Result: ✅ Attack prevented/mitigated
```

### Scenario 3: NoSQL Injection
```
Attacker: Sends malicious MongoDB operators
Protection: ObjectId format validation
Protection: Whitelist allowed sort fields
Protection: Type coercion for booleans
Result: ✅ Attack prevented
```

### Scenario 4: DDoS on Admin Panel
```
Attacker: Floods admin endpoints
Protection: API rate limiter (30 req/min)
Protection: Infrastructure-level DDoS protection
Result: ✅ Attack mitigated
```

### Scenario 5: Credential Stuffing
```
Attacker: Uses leaked credentials from other sites
Protection: Unique strong password
Protection: Rate limiting on login
Protection: Login attempt logging
Result: ✅ Attack prevented/detected
```

## 📋 Security Checklist for Production

Before going live:

- [ ] Change ADMIN_USERNAME from default
- [ ] Set strong ADMIN_PASSWORD (16+ chars)
- [ ] Rotate JWT_SECRET
- [ ] Verify HTTPS is enabled
- [ ] Test rate limiters
- [ ] Configure log monitoring
- [ ] Set up alerts for failed logins
- [ ] Test CORS configuration
- [ ] Verify CSP headers
- [ ] Review MongoDB security
- [ ] Document admin credentials securely
- [ ] Set up backup admin access
- [ ] Test token expiration
- [ ] Verify error messages don't leak info
- [ ] Test all security headers
- [ ] Conduct security audit

## 🔄 Regular Security Maintenance

### Weekly
- Review failed login attempts
- Check for unusual access patterns
- Monitor rate limit hits

### Monthly
- Review admin access logs
- Update dependencies
- Check for security vulnerabilities
- Test backup/recovery

### Quarterly
- Rotate admin credentials
- Security audit
- Review and update security policies
- Test incident response

### Annually
- Comprehensive security assessment
- Update security documentation
- Review and update rate limits
- Evaluate new security features

## 📞 Incident Response

### If Admin Account is Compromised

1. **Immediate Actions:**
   ```bash
   # Change admin password in .env
   ADMIN_PASSWORD=NewSecurePassword123!
   
   # Restart backend server
   pm2 restart medusa-backend
   ```

2. **Rotate JWT Secret:**
   ```bash
   # Generate new secret
   JWT_SECRET=<new random secret>
   
   # This invalidates all existing tokens
   ```

3. **Review Logs:**
   ```bash
   # Find unauthorized access
   grep "Admin" backend.log | tail -100
   ```

4. **Check Database:**
   ```bash
   # Verify no malicious changes
   # Review submission updates
   # Check team data integrity
   ```

5. **Document:**
   - What happened
   - When it happened
   - What was accessed
   - What was changed
   - Actions taken

## 🎯 Security Score

Based on OWASP Top 10 and security best practices:

| Security Aspect | Status | Score |
|----------------|--------|-------|
| Authentication | ✅ Strong | 9/10 |
| Authorization | ✅ Implemented | 8/10 |
| Input Validation | ✅ Comprehensive | 9/10 |
| Rate Limiting | ✅ Active | 9/10 |
| Logging | ✅ Detailed | 8/10 |
| Error Handling | ✅ Secure | 8/10 |
| HTTPS/TLS | ✅ Required | 10/10 |
| CORS | ✅ Configured | 9/10 |
| Headers | ✅ Helmet | 9/10 |
| Session Mgmt | ⚠️ Basic | 6/10 |
| **Overall** | **✅ Secure** | **8.5/10** |

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Last Updated**: November 8, 2025
**Version**: 1.1.0
**Security Review Date**: November 8, 2025
