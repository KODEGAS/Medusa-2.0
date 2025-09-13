/**
 * Input sanitization and validation utilities for registration forms
 */

// XSS protection - sanitize HTML and script tags
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .trim();
};

// SQL injection protection - escape special characters
export const sanitizeSql = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/union/gi, '')
    .replace(/select/gi, '')
    .replace(/insert/gi, '')
    .replace(/update/gi, '')
    .replace(/delete/gi, '')
    .replace(/drop/gi, '')
    .replace(/exec/gi, '')
    .trim();
};

// General text sanitization (names, descriptions)
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .replace(/[^\w\s\-_.,'()]/g, '') // Allow only alphanumeric, spaces, and safe punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 500) // Limit length
    .trim();
};

// Name sanitization (stricter)
export const sanitizeName = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .replace(/[^\w\s\-.']/g, '') // Allow only alphanumeric, spaces, hyphens, periods, apostrophes
    .replace(/\s+/g, ' ')
    .slice(0, 100)
    .trim();
};

// Email sanitization
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .toLowerCase()
    .replace(/[^\w@.-]/g, '')
    .slice(0, 254)
    .trim();
};

// Phone number sanitization
export const sanitizePhone = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .replace(/[^\d\s\+\-()]/g, '') // Allow only digits, spaces, +, -, ()
    .replace(/\s+/g, ' ')
    .slice(0, 20)
    .trim();
};

// University name sanitization
export const sanitizeUniversity = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .replace(/[^\w\s\-.,&']/g, '') // Allow alphanumeric, spaces, safe punctuation
    .replace(/\s+/g, ' ')
    .slice(0, 200)
    .trim();
};

// File name sanitization
export const sanitizeFileName = (input: string): string => {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .replace(/[^\w\s\-_.]/g, '') // Allow only safe file name characters
    .replace(/\s+/g, '_')
    .slice(0, 255)
    .trim();
};

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 8 && cleanPhone.length <= 15;
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s\-.']+$/.test(name);
};

export const validateTeamName = (teamName: string): boolean => {
  return teamName.length >= 2 && teamName.length <= 50 && /^[a-zA-Z0-9\s\-_.]+$/.test(teamName);
};

// Input rate limiting for form submissions
const submissionTracker = new Map<string, number[]>();

export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const attempts = submissionTracker.get(identifier) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  recentAttempts.push(now);
  submissionTracker.set(identifier, recentAttempts);
  
  return true; // Within rate limit
};

// Comprehensive sanitization for form data
export const sanitizeTeamInfo = (data: any) => ({
  teamName: sanitizeText(data.teamName),
  university: sanitizeUniversity(data.university),
  leaderName: sanitizeName(data.leaderName),
  leaderEmail: sanitizeEmail(data.leaderEmail),
  leaderPhone: sanitizePhone(data.leaderPhone),
  memberCount: Math.max(2, Math.min(5, parseInt(data.memberCount) || 3)),
  experience: sanitizeText(data.experience),
  expectations: sanitizeText(data.expectations)
});

export const sanitizeMemberInfo = (data: any) => ({
  name: sanitizeName(data.name),
  email: sanitizeEmail(data.email),
  phone: sanitizePhone(data.phone),
  year: sanitizeText(data.year)
});

// Security headers for API requests
export const getSecurityHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
});