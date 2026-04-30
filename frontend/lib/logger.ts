/**
 * Logging Utility
 * Structured logging with different levels and environments
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private currentLevel: LogLevel
  private logs: LogEntry[] = []
  private maxLogs: number = 100

  constructor() {
    // Set log level based on environment
    this.currentLevel =
      process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = LogLevel[entry.level]
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : ""
    const error = entry.error ? ` ${entry.error.message}` : ""

    return `[${timestamp}] [${level}] ${entry.message}${context}${error}`
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Send to error tracking service in production
    if (entry.level >= LogLevel.ERROR && process.env.NODE_ENV === "production") {
      this.sendToErrorTracking(entry)
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // Send to Sentry or other error tracking service
    if (typeof window !== "undefined" && (window as any).Sentry) {
      if (entry.error) {
        (window as any).Sentry.captureException(entry.error, {
          level: LogLevel[entry.level].toLowerCase(),
          extra: entry.context
        })
      } else {
        (window as any).Sentry.captureMessage(entry.message, {
          level: LogLevel[entry.level].toLowerCase(),
          extra: entry.context
        })
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return

    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      context
    }

    this.addLog(entry)

    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage(entry))
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return

    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      context
    }

    this.addLog(entry)

    if (process.env.NODE_ENV !== "production") {
      console.info(this.formatMessage(entry))
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return

    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      context
    }

    this.addLog(entry)

    if (process.env.NODE_ENV !== "production") {
      console.warn(this.formatMessage(entry))
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      error,
      context
    }

    this.addLog(entry)

    if (process.env.NODE_ENV !== "production") {
      console.error(this.formatMessage(entry))
    }
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return

    const entry: LogEntry = {
      level: LogLevel.FATAL,
      message,
      timestamp: new Date(),
      error,
      context
    }

    this.addLog(entry)

    if (process.env.NODE_ENV !== "production") {
      console.error(this.formatMessage(entry))
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level
  }
}

// Create singleton instance
export const logger = new Logger()

// Export convenience functions
export const debug = (message: string, context?: Record<string, any>) =>
  logger.debug(message, context)

export const info = (message: string, context?: Record<string, any>) =>
  logger.info(message, context)

export const warn = (message: string, context?: Record<string, any>) =>
  logger.warn(message, context)

export const error = (message: string, err?: Error, context?: Record<string, any>) =>
  logger.error(message, err, context)

export const fatal = (message: string, err?: Error, context?: Record<string, any>) =>
  logger.fatal(message, err, context)

export default logger
