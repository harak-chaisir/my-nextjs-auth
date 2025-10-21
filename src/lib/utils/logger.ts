/**
 * Centralized Logging Utility
 * Provides consistent logging across the application with environment-aware levels
 */

import { env } from '@/lib/config/env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = env.app.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;
    
    // Remove sensitive data in production
    if (env.app.isProduction) {
      const sanitized: LogContext = {};
      for (const [key, value] of Object.entries(context)) {
        if (!['password', 'secret', 'token', 'apiKey'].some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = value;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
      return sanitized;
    }
    
    return context;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, this.sanitizeContext(context)));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, this.sanitizeContext(context)));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, this.sanitizeContext(context)));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorInfo = error instanceof Error ? {
        message: error.message,
        stack: env.app.isDevelopment ? error.stack : undefined,
        ...context
      } : context;
      
      console.error(this.formatMessage('ERROR', message, this.sanitizeContext(errorInfo)));
    }
  }

  // Specialized loggers for specific domains
  auth = {
    success: (user: string, roles: string[], duration: number) => {
      this.info('Authentication successful', { user, roles, durationMs: duration });
    },
    failed: (reason: string, details?: LogContext) => {
      this.warn('Authentication failed', { reason, ...details });
    },
    denied: (user: string, required: string[], actual: string[]) => {
      this.warn('Access denied', { user, required, actual });
    },
  };

  rbac = {
    roleExtracted: (source: string, roles: string[]) => {
      this.debug('Roles extracted', { source, roles });
    },
    cacheHit: (tokenPreview: string) => {
      this.debug('Token cache hit', { tokenPreview });
    },
    cacheMiss: (tokenPreview: string) => {
      this.debug('Token cache miss', { tokenPreview });
    },
  };

  performance = {
    measure: (operation: string, durationMs: number, metadata?: LogContext) => {
      if (durationMs > 1000) {
        this.warn(`Slow operation: ${operation}`, { durationMs, ...metadata });
      } else {
        this.debug(`Operation completed: ${operation}`, { durationMs, ...metadata });
      }
    },
  };
}

export const logger = new Logger();
