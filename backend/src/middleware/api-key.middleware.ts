import type { NextFunction, Request, Response } from 'express';

// ALLOWED_API_KEYS format: "name1:key1,name2:key2" — one entry per caller (frontend,
// a future drone/CCTV service, etc). Add or revoke a caller by editing this one env var,
// no code change or redeploy of calling logic needed.
function loadAllowedKeys(): Map<string, string> {
    const raw = process.env.ALLOWED_API_KEYS ?? '';
    const keys = new Map<string, string>();
    for (const entry of raw.split(',')) {
        const [name, key] = entry.split(':');
        if (name && key) {
            keys.set(key, name);
        }
    }
    return keys;
}

const allowedKeys = loadAllowedKeys();

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
    const key = req.header('x-api-key');
    const caller = key ? allowedKeys.get(key) : undefined;
    if (!caller) {
        res.status(401).json({ error: 'unauthorized' });
        return;
    }
    res.locals.caller = caller;
    next();
}

// Per-route scope on top of requireApiKey: a valid key only proves who the caller is, this
// decides what they may do — e.g. only the classifier may write severity results.
export function requireCaller(...callers: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!callers.includes(res.locals.caller)) {
            res.status(403).json({ error: 'forbidden' });
            return;
        }
        next();
    };
}
