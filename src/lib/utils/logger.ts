/**
 * Logger Utility - VolleyScore Pro v2
 * 
 * Encapsula console.log/warn/error com controle de ambiente.
 * Em produção (import.meta.env.PROD), silencia logs e warns, mantendo apenas errors.
 * 
 * @example
 * import { logger } from '@lib/utils/logger';
 * 
 * logger.log('Game started');
 * logger.warn('Low memory detected');
 * logger.error('Failed to save match', error);
 * logger.debug('State:', gameState);
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

class Logger {
    private static instance: Logger;
    private isProd: boolean;

    private constructor() {
        this.isProd = import.meta.env.PROD;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Log informativo (silenciado em produção)
     */
    public log(message: string, ...args: any[]): void {
        if (!this.isProd) {
            console.log(`[VolleyScore] ${message}`, ...args);
        }
    }

    /**
     * Warning (silenciado em produção)
     */
    public warn(message: string, ...args: any[]): void {
        if (!this.isProd) {
            console.warn(`[VolleyScore] ⚠️ ${message}`, ...args);
        }
    }

    /**
     * Error crítico (SEMPRE exibido, mesmo em produção)
     */
    public error(message: string, ...args: any[]): void {
        console.error(`[VolleyScore] ❌ ${message}`, ...args);
    }

    /**
     * Debug detalhado (silenciado em produção)
     */
    public debug(message: string, ...args: any[]): void {
        if (!this.isProd) {
            console.debug(`[VolleyScore] 🐛 ${message}`, ...args);
        }
    }

    /**
     * Info (silenciado em produção)
     */
    public info(message: string, ...args: any[]): void {
        if (!this.isProd) {
            console.info(`[VolleyScore] ℹ️ ${message}`, ...args);
        }
    }

    /**
     * Log com nível customizado
     */
    public logWithLevel(level: LogLevel, message: string, ...args: any[]): void {
        switch (level) {
            case 'log':
                this.log(message, ...args);
                break;
            case 'warn':
                this.warn(message, ...args);
                break;
            case 'error':
                this.error(message, ...args);
                break;
            case 'debug':
                this.debug(message, ...args);
                break;
            case 'info':
                this.info(message, ...args);
                break;
        }
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export class for testing
export { Logger };
