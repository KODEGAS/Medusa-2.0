/**
 * Environment-aware Logger Utility with GCP Cloud Logging
 * Provides controlled logging based on NODE_ENV
 * 
 * Production: Only errors and critical warnings
 * Development: Full verbose logging
 * GCP: Sends logs to Google Cloud Logging (optional)
 */

import { Logging } from '@google-cloud/logging';

const isProduction = process.env.NODE_ENV === 'production';
const enableGCP = process.env.ENABLE_GCP_LOGGING === 'true';

// Initialize GCP Logging if enabled
let gcpLogging = null;
let gcpLog = null;
let gcpInitError = null;

if (enableGCP) {
  try {
    const gcpConfig = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    };
    
    // Only add keyFilename if it exists
    if (process.env.GOOGLE_CLOUD_KEY_FILE) {
      gcpConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
    }
    
    gcpLogging = new Logging(gcpConfig);
    gcpLog = gcpLogging.log('medusa-backend');
    console.log('✅ GCP Cloud Logging initialized');
    console.log(`   Project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
    console.log(`   Credentials: ${process.env.GOOGLE_CLOUD_KEY_FILE || 'Default (ADC)'}`);
  } catch (error) {
    gcpInitError = error;
    console.error('⚠️  Failed to initialize GCP Cloud Logging:', error.message);
    console.error('   Falling back to console logging only');
    console.error('   💡 Tip: Disable with ENABLE_GCP_LOGGING=false or fix credentials');
    gcpLog = null; // Ensure it's null
  }
}

/**
 * Format log message with timestamp
 */
function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}]`;
}

/**
 * Send log to GCP Cloud Logging
 */
async function sendToGCP(severity, message, metadata = {}) {
  // Don't attempt if GCP not initialized or init failed
  if (!gcpLog || gcpInitError) return;

  try {
    const entry = gcpLog.entry(
      {
        severity: severity,
        resource: { type: 'global' }
      },
      {
        message: message,
        ...metadata,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    );

    // Write async without blocking
    gcpLog.write(entry).catch(err => {
      // Only log auth errors once, then disable GCP logging
      if (err.code === 16 || err.message.includes('UNAUTHENTICATED')) {
        if (!gcpInitError) {
          console.error('⚠️  GCP authentication failed - disabling GCP logging');
          console.error('   💡 Set ENABLE_GCP_LOGGING=false to suppress this warning');
          gcpInitError = err; // Prevent further attempts
          gcpLog = null;
        }
      } else {
        // Log other errors normally
        console.error('GCP logging error:', err.message);
      }
    });
  } catch (error) {
    // Silently fail - don't let logging errors crash the app
    if (!gcpInitError) {
      console.error('GCP log entry error:', error.message);
    }
  }
}

/**
 * Logger object with environment-aware methods
 */
const logger = {
  /**
   * Info logs - only in development
   * Use for general information, successful operations
   */
  info: (message, ...args) => {
    if (!isProduction) {
      console.log(formatMessage('INFO', message), message, ...args);
    }
    if (enableGCP) {
      sendToGCP('INFO', message, { args });
    }
  },

  /**
   * Success logs - only in development
   * Use for successful operations that need highlighting
   */
  success: (message, ...args) => {
    if (!isProduction) {
      console.log(formatMessage('SUCCESS', message), message, ...args);
    }
    if (enableGCP) {
      sendToGCP('INFO', message, { type: 'success', args });
    }
  },

  /**
   * Debug logs - only in development
   * Use for detailed debugging information
   */
  debug: (message, ...args) => {
    if (!isProduction) {
      console.log(formatMessage('DEBUG', message), message, ...args);
    }
    if (enableGCP && !isProduction) {
      sendToGCP('DEBUG', message, { args });
    }
  },

  /**
   * Warning logs - always shown but sanitized in production
   * Use for non-critical issues that should be monitored
   */
  warn: (message, ...args) => {
    if (isProduction) {
      // Sanitized warning in production (no sensitive data)
      console.warn(formatMessage('WARN', message), message);
    } else {
      console.warn(formatMessage('WARN', message), message, ...args);
    }
    if (enableGCP) {
      sendToGCP('WARNING', message, isProduction ? {} : { args });
    }
  },

  /**
   * Error logs - always shown but sanitized in production
   * Use for errors that need immediate attention
   */
  error: (message, ...args) => {
    if (isProduction) {
      // Sanitized error in production (no stack traces or sensitive data)
      console.error(formatMessage('ERROR', message), message);
    } else {
      console.error(formatMessage('ERROR', message), message, ...args);
    }
    if (enableGCP) {
      const errorData = isProduction ? {} : { 
        args,
        stack: args[0]?.stack || undefined
      };
      sendToGCP('ERROR', message, errorData);
    }
  },

  /**
   * Critical logs - always shown with full details
   * Use for critical system failures
   */
  critical: (message, ...args) => {
    console.error(formatMessage('CRITICAL', message), message, ...args);
    if (enableGCP) {
      sendToGCP('CRITICAL', message, { 
        args,
        stack: args[0]?.stack || undefined,
        urgent: true
      });
    }
  },

  /**
   * Security audit logs - always shown (required for compliance)
   * Use for authentication, authorization, and security events
   */
  security: (message, ...args) => {
    console.log(formatMessage('SECURITY', message), message, ...args);
    if (enableGCP) {
      sendToGCP('NOTICE', message, { 
        type: 'security',
        args,
        compliance: true
      });
    }
  },

  /**
   * Audit logs - always shown (required for compliance)
   * Use for important business logic events
   */
  audit: (message, ...args) => {
    console.log(formatMessage('AUDIT', message), message, ...args);
    if (enableGCP) {
      sendToGCP('NOTICE', message, { 
        type: 'audit',
        args,
        compliance: true
      });
    }
  },

  /**
   * Request logs - only in development
   * Use for HTTP request/response logging
   */
  request: (message, ...args) => {
    if (!isProduction) {
      console.log(formatMessage('REQUEST', message), message, ...args);
    }
    if (enableGCP && !isProduction) {
      sendToGCP('DEBUG', message, { type: 'request', args });
    }
  },
};

// Helper function to check if in production
logger.isProduction = () => isProduction;

export default logger;
