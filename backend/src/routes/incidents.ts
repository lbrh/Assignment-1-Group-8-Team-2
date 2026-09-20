import { Router, type Request, type Response } from 'express';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { assessSeverity, parseSeverityAssessmentInput } from '../pipeline/assess-severity.ts';
import { ValidationError } from '../pipeline/validate.ts';

export const incidentsRouter: Router = Router();

incidentsRouter.post('/images/:id/assess', async (req: Request<{ id: string }>, res: Response) => {
    const existing = await metadataRepository.get(req.params.id);
    if (!existing) {
        res.status(404).json({ error: 'image not found' });
        return;
    }

    try {
        const input = parseSeverityAssessmentInput(req.body);
        const result = assessSeverity(input);
        const updated = await metadataRepository.update(req.params.id, result);
        res.status(200).json(updated);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: 'internal error' });
    }
});
