import type { NextFunction, Request, Response } from 'express';

// FRONTEND_ORIGIN is a plain env var (not a secret) — adding another allowed caller
// later is a config change, not a code change.
export function cors(req: Request, res: Response, next: NextFunction): void {
    const origin = process.env.FRONTEND_ORIGIN;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
}
