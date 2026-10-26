// ============================================================
// Wristloom — Structured JSON Logger with Sensitive Data Redaction
// Layer 13: Error Tracking & Logs (15-Layer SaaS Playbook, p. 28)
// Redacts tokens, passwords, secrets, and attaches correlation IDs
// ============================================================

import { nanoid } from 'nanoid';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /signature/i,
  /api[_-]?key/i,
  /cookie/i,
];

function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  role?: string;
  orderId?: string;
  bookingId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: any): string {
    const isProd = process.env.NODE_ENV === 'production';
    if (level === 'DEBUG' && isProd) {
      return ''; // Mute debug logs in production
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: context?.requestId || `req_${nanoid(8)}`,
      ...(context ? redactSensitiveData(context) : {}),
      ...(error
        ? {
            error: {
              name: error.name || 'Error',
              message: error.message || String(error),
              stack: isProd ? undefined : error.stack,
            },
          }
        : {}),
    };

    return JSON.stringify(logEntry);
  }

  public debug(message: string, context?: LogContext) {
    const log = this.formatLog('DEBUG', message, context);
    if (log) console.debug(log);
  }

  public info(message: string, context?: LogContext) {
    console.info(this.formatLog('INFO', message, context));
  }

  public warn(message: string, context?: LogContext, error?: any) {
    console.warn(this.formatLog('WARN', message, context, error));
  }

  public error(message: string, context?: LogContext, error?: any) {
    console.error(this.formatLog('ERROR', message, context, error));
  }
}

export const logger = new StructuredLogger();
