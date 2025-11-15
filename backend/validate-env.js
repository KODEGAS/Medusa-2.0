#!/usr/bin/env node

/**
 * Environment Variables Security Validator
 * Checks if all required environment variables are set and secure
 */

import 'dotenv/config';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}🔒 Environment Variables Security Check${RESET}\n`);

let errors = 0;
let warnings = 0;

// Required variables
const requiredVars = [
  { name: 'MONGODB_URI', minLength: 20 },
  { name: 'JWT_SECRET', minLength: 32 },
  { name: 'ADMIN_USERNAME', minLength: 5 },
  { name: 'ADMIN_PASSWORD_HASH', minLength: 60 }, // bcrypt hash is 60 chars
  { name: 'ROUND1_API_KEY', minLength: 10 },
  { name: 'ROUND2_API_KEY', minLength: 10 },
  { name: 'ROUND1_FLAG', minLength: 10 },
  { name: 'ROUND2_ANDROID_FLAG', minLength: 10 },
  { name: 'ROUND2_PWN_USER_FLAG', minLength: 10 },
  { name: 'ROUND2_PWN_ROOT_FLAG', minLength: 10 },
  { name: 'GOOGLE_CLOUD_PROJECT_ID', minLength: 5 },
  { name: 'GOOGLE_CLOUD_STORAGE_BUCKET', minLength: 3 },
];

// Optional variables (including migration fallback)
const migrationVars = [
  { name: 'ADMIN_PASSWORD', minLength: 16 }, // Fallback during migration period
];

// Optional but recommended
const optionalVars = [
  { name: 'ADMIN_ROUTE_PATH', minLength: 32 },
  { name: 'NODE_ENV' },
  { name: 'PORT' },
  { name: 'ENABLE_GCP_LOGGING' }, // Enable GCP Cloud Logging
];

console.log(`${BLUE}Required Variables:${RESET}`);
requiredVars.forEach(({ name, minLength }) => {
  const value = process.env[name];
  
  if (!value) {
    console.log(`${RED}❌ ${name}: MISSING${RESET}`);
    errors++;
  } else if (value.length < minLength) {
    console.log(`${YELLOW}⚠️  ${name}: TOO SHORT (${value.length} chars, min: ${minLength})${RESET}`);
    warnings++;
  } else if (value.includes('your-') || value.includes('change-this') || value.includes('example')) {
    console.log(`${RED}❌ ${name}: USING PLACEHOLDER VALUE${RESET}`);
    errors++;
  } else {
    console.log(`${GREEN}✅ ${name}: SET (${value.length} chars)${RESET}`);
  }
});

console.log(`\n${BLUE}Optional Variables:${RESET}`);
optionalVars.forEach(({ name, minLength }) => {
  const value = process.env[name];
  
  if (!value) {
    console.log(`${YELLOW}⚠️  ${name}: NOT SET (using default)${RESET}`);
  } else if (minLength && value.length < minLength) {
    console.log(`${YELLOW}⚠️  ${name}: SET but weak (${value.length} chars, recommended: ${minLength})${RESET}`);
    warnings++;
  } else {
    console.log(`${GREEN}✅ ${name}: SET${RESET}`);
  }
});

// Migration period check
console.log(`\n${BLUE}Migration Period Variables:${RESET}`);
migrationVars.forEach(({ name, minLength }) => {
  const value = process.env[name];
  if (!value) {
    console.log(`${YELLOW}⚠️  ${name}: NOT SET (migration to ADMIN_PASSWORD_HASH recommended)${RESET}`);
  } else if (minLength && value.length < minLength) {
    console.log(`${YELLOW}⚠️  ${name}: SET but weak (${value.length} chars, recommended: ${minLength})${RESET}`);
    warnings++;
  } else {
    console.log(`${YELLOW}⚠️  ${name}: SET (migrate to ADMIN_PASSWORD_HASH for security)${RESET}`);
    warnings++;
  }
});

// Security checks
console.log(`\n${BLUE}Security Checks:${RESET}`);

// Check JWT secret strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length >= 64) {
    console.log(`${GREEN}✅ JWT_SECRET: Strong (${jwtSecret.length} chars)${RESET}`);
  } else if (jwtSecret.length >= 32) {
    console.log(`${YELLOW}⚠️  JWT_SECRET: Adequate (${jwtSecret.length} chars, recommended: 64+)${RESET}`);
    warnings++;
  } else {
    console.log(`${RED}❌ JWT_SECRET: WEAK (${jwtSecret.length} chars, minimum: 32)${RESET}`);
    errors++;
  }
}

// Check admin password hash (bcrypt)
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const adminPassword = process.env.ADMIN_PASSWORD;

if (adminPasswordHash) {
  // Check if it looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (/^\$2[aby]\$\d{2}\$/.test(adminPasswordHash)) {
    console.log(`${GREEN}✅ ADMIN_PASSWORD_HASH: Valid bcrypt hash detected${RESET}`);
    if (adminPassword) {
      console.log(`${YELLOW}⚠️  ADMIN_PASSWORD: Still set - remove after migration complete${RESET}`);
      warnings++;
    }
  } else {
    console.log(`${RED}❌ ADMIN_PASSWORD_HASH: Invalid format (should be bcrypt hash)${RESET}`);
    errors++;
  }
} else if (adminPassword) {
  console.log(`${RED}❌ ADMIN_PASSWORD_HASH: NOT SET - Using insecure plain text password${RESET}`);
  console.log(`${YELLOW}   Run 'npm run hash-password' to generate secure hash${RESET}`);
  errors++;
  
  // Still check plain password strength for fallback
  const hasUpper = /[A-Z]/.test(adminPassword);
  const hasLower = /[a-z]/.test(adminPassword);
  const hasNumber = /[0-9]/.test(adminPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(adminPassword);
  
  if (adminPassword.length >= 20 && hasUpper && hasLower && hasNumber && hasSpecial) {
    console.log(`${YELLOW}   ADMIN_PASSWORD (plain): Strong but needs hashing${RESET}`);
  } else if (adminPassword.length >= 16) {
    console.log(`${YELLOW}   ADMIN_PASSWORD (plain): Adequate but needs hashing${RESET}`);
  } else {
    console.log(`${RED}   ADMIN_PASSWORD (plain): WEAK and needs hashing${RESET}`);
  }
}

// Check MongoDB URI security
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.includes('mongodb+srv://')) {
    console.log(`${GREEN}✅ MONGODB_URI: Using secure SRV connection${RESET}`);
  } else if (mongoUri.includes('mongodb://')) {
    console.log(`${YELLOW}⚠️  MONGODB_URI: Consider using mongodb+srv:// for better security${RESET}`);
    warnings++;
  }
  
  if (mongoUri.includes('retryWrites=true')) {
    console.log(`${GREEN}✅ MONGODB_URI: Retry writes enabled${RESET}`);
  }
}

// Check flag formats
// MEDUSA{...} format for Round 1 and Android
['ROUND1_FLAG', 'ROUND2_ANDROID_FLAG'].forEach(flagName => {
  const flag = process.env[flagName];
  if (flag && /^MEDUSA\{.+\}$/.test(flag)) {
    console.log(`${GREEN}✅ ${flagName}: Valid MEDUSA{...} format${RESET}`);
  } else if (flag) {
    console.log(`${RED}❌ ${flagName}: Invalid format (should be MEDUSA{...})${RESET}`);
    errors++;
  }
});

// HashX{...} format for PWN challenge
['ROUND2_PWN_USER_FLAG', 'ROUND2_PWN_ROOT_FLAG'].forEach(flagName => {
  const flag = process.env[flagName];
  if (flag && /^HashX\{.+\}$/.test(flag)) {
    console.log(`${GREEN}✅ ${flagName}: Valid HashX{...} format${RESET}`);
  } else if (flag) {
    console.log(`${RED}❌ ${flagName}: Invalid format (should be HashX{...})${RESET}`);
    errors++;
  }
});

// Check GCP Cloud Logging configuration
const enableGCPLogging = process.env.ENABLE_GCP_LOGGING === 'true';
if (enableGCPLogging) {
  console.log(`\n${BLUE}GCP Cloud Logging Configuration:${RESET}`);
  
  const gcpProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const gcpKeyFile = process.env.GOOGLE_CLOUD_KEY_FILE;
  
  if (gcpProjectId) {
    console.log(`${GREEN}✅ GOOGLE_CLOUD_PROJECT_ID: SET${RESET}`);
  } else {
    console.log(`${RED}❌ GOOGLE_CLOUD_PROJECT_ID: MISSING (required when ENABLE_GCP_LOGGING=true)${RESET}`);
    errors++;
  }
  
  if (gcpKeyFile) {
    console.log(`${GREEN}✅ GOOGLE_CLOUD_KEY_FILE: SET (${gcpKeyFile})${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️  GOOGLE_CLOUD_KEY_FILE: NOT SET (will use default credentials)${RESET}`);
    warnings++;
  }
  
  console.log(`${GREEN}✅ GCP Cloud Logging: ENABLED${RESET}`);
} else {
  console.log(`\n${BLUE}GCP Cloud Logging:${RESET} ${YELLOW}DISABLED${RESET}`);
  console.log(`${YELLOW}   Set ENABLE_GCP_LOGGING=true to enable centralized logging${RESET}`);
}

// Summary
console.log(`\n${BLUE}═══════════════════════════════════════${RESET}`);
if (errors === 0 && warnings === 0) {
  console.log(`${GREEN}✅ All checks passed! Environment is secure.${RESET}`);
  process.exit(0);
} else if (errors === 0) {
  console.log(`${YELLOW}⚠️  ${warnings} warning(s) found. Consider addressing them.${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}❌ ${errors} error(s) and ${warnings} warning(s) found.${RESET}`);
  console.log(`${RED}Please fix errors before deploying to production!${RESET}`);
  process.exit(1);
}
