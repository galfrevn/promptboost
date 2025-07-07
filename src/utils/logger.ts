import type { LogLevel, Logger } from '@/types/index.js';
import pc from 'picocolors';

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private colors = {
    debug: pc.cyan,
    info: pc.green,
    warn: pc.yellow,
    error: pc.red,
    reset: (text: string) => text,
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const color = this.colors[level];

    let formatted = `${color(`[${timestamp}] ${level.toUpperCase()}`)}: ${message}`;

    if (meta) {
      formatted += ` ${JSON.stringify(meta)}`;
    }

    return formatted;
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

export const logger = new ConsoleLogger();
