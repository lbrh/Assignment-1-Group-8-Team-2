import { Router, type Request, type Response } from 'express';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { requireCaller } from '../middleware/api-key.middleware.ts';
import { ValidationError } from '../pipeline/validate.ts';
import { logger, errorMeta } from '../utils/logger.ts';
import type { ClassificationLabel, CoordinatorPatch, DispatchState } from '../metadata/metadata.types.ts';

// Coordinator actions (Sprint 2 §5): review confirm/change/discard, severity override, dispatch,
// extinguish/reopen, and the decision log behind every one of them. Undo is just another call
// with the previous values, so it's logged too.
export const coordinatorRouter: Router = Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LABELS = new Set<ClassificationLabel>(['fire', 'non_fire', 'extinguished', 'uncertain']);
const REVIEW_STATUSES = new Set(['assessed', 'unable_to_assess']);
const DISPATCH_STATES = new Set<DispatchState>(['awaiting', 'live', 'extinguished']);

// ponytail: "who" is whatever the frontend sends until user auth exists — it's recorded, not verified.
function parseBy(body: Record<string, unknown>): string {
    const by = body.by;
    if (typeof by !== 'string' || by.trim() === '' || by.length > 100) {
        throw new ValidationError('by is required: who made the decision (max 100 chars)');
    }
    return by.trim();
}

export function parseCoordinatorPatch(body: unknown): { patch: CoordinatorPatch; by: string } {
    if (typeof body !== 'object' || body === null) throw new ValidationError('request body must be a JSON object');
    const b = body as Record<string, unknown>;
    const patch: CoordinatorPatch = {};

    if ('severityScoreOverride' in b) {
        const v = b.severityScoreOverride;
        if (v !== null && !(Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 4)) {
            throw new ValidationError('severityScoreOverride must be 1-4 or null');
        }
        patch.severityScoreOverride = v as CoordinatorPatch['severityScoreOverride'];
    }
    if ('classificationLabelOverride' in b) {
        const v = b.classificationLabelOverride;
        if (v !== null && !LABELS.has(v as ClassificationLabel)) {
            throw new ValidationError(`classificationLabelOverride must be one of ${[...LABELS].join(', ')} or null`);
        }
        patch.classificationLabelOverride = v as ClassificationLabel | null;
    }
    if ('assessmentStatus' in b) {
        if (!REVIEW_STATUSES.has(b.assessmentStatus as string)) {
            throw new ValidationError('assessmentStatus must be assessed or unable_to_assess');
        }
        patch.assessmentStatus = b.assessmentStatus as CoordinatorPatch['assessmentStatus'];
    }
    if (Object.keys(patch).length === 0) {
        throw new ValidationError('nothing to change: send severityScoreOverride, classificationLabelOverride and/or assessmentStatus');
    }
    return { patch, by: parseBy(b) };
}

function handle(fn: (req: Request<{ id: string }>, res: Response) => Promise<void>) {
    return async (req: Request<{ id: string }>, res: Response) => {
        if (!UUID.test(req.params.id)) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        try {
            await fn(req, res);
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(400).json({ error: err.message });
                return;
            }
            logger.error('coordinator action failed', errorMeta(err));
            res.status(500).json({ error: 'internal error' });
        }
    };
}

// Review and override decisions on one image. Examples:
//   confirm AI tag:   { severityScoreOverride: <AI score>, classificationLabelOverride: 'fire', assessmentStatus: 'assessed' }
//   discard as non-fire: { classificationLabelOverride: 'non_fire', assessmentStatus: 'assessed' }
//   send to review:   { assessmentStatus: 'unable_to_assess' }
coordinatorRouter.patch(
    '/images/:id/decision',
    requireCaller('frontend'),
    handle(async (req, res) => {
        const { patch, by } = parseCoordinatorPatch(req.body);
        const updated = await metadataRepository.applyCoordinatorDecision(req.params.id, patch, by);
        if (!updated) {
            res.status(404).json({ error: 'image not found' });
            return;
        }
        res.json(updated);
    }),
);

// Dispatch lifecycle for an incident: awaiting -> live (crew dispatched) -> extinguished,
// and back (cancel dispatch, reopen on re-ignition).
coordinatorRouter.put(
    '/incidents/:id/dispatch',
    requireCaller('frontend'),
    handle(async (req, res) => {
        const body = (req.body ?? {}) as Record<string, unknown>;
        if (!DISPATCH_STATES.has(body.state as DispatchState)) {
            throw new ValidationError(`state must be one of ${[...DISPATCH_STATES].join(', ')}`);
        }
        const result = await metadataRepository.setDispatchState(req.params.id, body.state as DispatchState, parseBy(body));
        if (!result) {
            res.status(404).json({ error: 'incident not found' });
            return;
        }
        res.json(result);
    }),
);

// Decision log for an incident, newest first.
coordinatorRouter.get(
    '/incidents/:id/decisions',
    requireCaller('frontend'),
    handle(async (req, res) => {
        res.json(await metadataRepository.findDecisions(req.params.id));
    }),
);
