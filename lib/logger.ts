interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  userId?: string | undefined;
  requestId?: string | undefined;
  endpoint?: string;
  duration?: number;
}

class Logger {
  private logLevel: keyof LogLevel = 'INFO';
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    // Set log level from environment variable
    const envLogLevel = process.env.LOG_LEVEL as keyof LogLevel;
    if (
      envLogLevel &&
      ['ERROR', 'WARN', 'INFO', 'DEBUG'].includes(envLogLevel)
    ) {
      this.logLevel = envLogLevel;
    }
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: LogLevel = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      return true;
    }
    return false;
  }

  private formatLog(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level}`;
    const context = [
      entry.userId && `user:${entry.userId}`,
      entry.requestId && `req:${entry.requestId}`,
      entry.endpoint && `endpoint:${entry.endpoint}`,
      entry.duration && `duration:${entry.duration}ms`,
    ]
      .filter(Boolean)
      .join(' | ');

    return `${base}${context ? ` | ${context}` : ''} | ${entry.message}`;
  }

  private log(
    level: keyof LogLevel,
    message: string,
    data?: any,
    context?: Partial<LogEntry>
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...context,
    };

    const formattedLog = this.formatLog(entry);

    // Console output with colors in development
    if (this.isDevelopment) {
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m', // Yellow
        INFO: '\x1b[36m', // Cyan
        DEBUG: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      process.stdout.write(`${colors[level]}${formattedLog}${reset}\n`);
      if (data) {
        process.stdout.write(
          `${colors[level]}Data:${reset} ${JSON.stringify(data, null, 2)}\n`
        );
      }
    } else {
      // Production: structured JSON logging
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  }

  error(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('ERROR', message, data, context);
  }

  warn(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('WARN', message, data, context);
  }

  info(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('INFO', message, data, context);
  }

  debug(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('DEBUG', message, data, context);
  }

  // API-specific logging methods
  apiRequest(
    method: string,
    endpoint: string,
    userId?: string,
    requestId?: string
  ): void {
    this.info(`API Request: ${method} ${endpoint}`, undefined, {
      endpoint,
      userId,
      requestId,
    });
  }

  apiResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    const level = statusCode >= 400 ? 'ERROR' : 'INFO';
    this.log(
      level,
      `API Response: ${method} ${endpoint} - ${statusCode}`,
      undefined,
      {
        endpoint,
        userId,
        requestId,
        duration,
      }
    );
  }

  // Database logging
  dbQuery(
    operation: string,
    table: string,
    duration: number,
    userId?: string
  ): void {
    this.debug(`DB Query: ${operation} on ${table}`, undefined, {
      userId,
      duration,
    });
  }

  dbError(operation: string, table: string, error: any, userId?: string): void {
    this.error(`DB Error: ${operation} on ${table}`, error, { userId });
  }

  // Authentication logging
  authEvent(event: string, userId?: string, data?: any): void {
    this.info(`Auth Event: ${event}`, data, { userId });
  }

  // AI/OpenAI logging
  aiRequest(prompt: string, model: string, userId?: string): void {
    this.info(
      `AI Request: ${model}`,
      { prompt: prompt.substring(0, 100) + '...' },
      { userId }
    );
  }

  aiResponse(model: string, duration: number, userId?: string): void {
    this.info(`AI Response: ${model}`, undefined, { userId, duration });
  }

  aiError(model: string, error: any, userId?: string): void {
    this.error(`AI Error: ${model}`, error, { userId });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
