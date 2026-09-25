type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level, message, ts: new Date().toISOString(), ...meta }));
}

export const logger = {
    info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};

export function errorMeta(err: unknown): Record<string, unknown> {
    return err instanceof Error ? { error: err.message, stack: err.stack } : { error: String(err) };
}
