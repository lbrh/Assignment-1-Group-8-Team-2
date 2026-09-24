import type { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

// ponytail: in-memory per-instance limiter — fine at this project's scale (Code Engine
// max-scale=5, low request volume). A shared store (e.g. Redis) would only matter if the
// limit must hold exactly across many concurrent instances rather than per-instance.
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = req.header('x-api-key') ?? req.ip ?? 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS) {
        res.status(429).json({ error: 'rate limit exceeded' });
        return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
}
