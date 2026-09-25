import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoordinatorPatch } from '../src/routes/coordinator.routes.ts';
import { ValidationError } from '../src/pipeline/validate.ts';

test('accepts a review confirm and trims who', () => {
    const { patch, by } = parseCoordinatorPatch({
        severityScoreOverride: 3,
        classificationLabelOverride: 'fire',
        assessmentStatus: 'assessed',
        by: '  EC  ',
    });
    assert.deepEqual(patch, { severityScoreOverride: 3, classificationLabelOverride: 'fire', assessmentStatus: 'assessed' });
    assert.equal(by, 'EC');
});

test('null clears an override (undo)', () => {
    const { patch } = parseCoordinatorPatch({ severityScoreOverride: null, by: 'EC' });
    assert.deepEqual(patch, { severityScoreOverride: null });
});

test('rejects bad values, empty patches and a missing author', () => {
    for (const body of [
        { severityScoreOverride: 5, by: 'EC' },
        { severityScoreOverride: 2.5, by: 'EC' },
        { classificationLabelOverride: 'smoke', by: 'EC' },
        { assessmentStatus: 'pending_review', by: 'EC' },
        { by: 'EC' },
        { severityScoreOverride: 2 },
        { severityScoreOverride: 2, by: '   ' },
        null,
    ]) {
        assert.throws(() => parseCoordinatorPatch(body), ValidationError, JSON.stringify(body));
    }
});
