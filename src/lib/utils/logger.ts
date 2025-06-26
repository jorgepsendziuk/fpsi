/**
 * Sistema de Logging Condicional
 * 
 * Permite logs apenas em desenvolvimento e oferece diferentes níveis de log
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private currentLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data !== undefined) {
      return `${prefix} ${message}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      if (data !== undefined) {
        console.log(this.formatMessage('DEBUG', message), data);
      } else {
        console.log(this.formatMessage('DEBUG', message));
      }
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      if (data !== undefined) {
        console.info(this.formatMessage('INFO', message), data);
      } else {
        console.info(this.formatMessage('INFO', message));
      }
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      if (data !== undefined) {
        console.warn(this.formatMessage('WARN', message), data);
      } else {
        console.warn(this.formatMessage('WARN', message));
      }
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (error !== undefined) {
        console.error(this.formatMessage('ERROR', message), error);
      } else {
        console.error(this.formatMessage('ERROR', message));
      }
    }
  }

  // Método especial para logs de produção (sempre aparecem)
  production(message: string, data?: any) {
    if (data !== undefined) {
      console.log(this.formatMessage('PROD', message), data);
    } else {
      console.log(this.formatMessage('PROD', message));
    }
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Função de conveniência para debug rápido
export const debugLog = (message: string, data?: any) => {
  logger.debug(message, data);
};

// Função de conveniência para erros
export const errorLog = (message: string, error?: any) => {
  logger.error(message, error);
};

export default logger;