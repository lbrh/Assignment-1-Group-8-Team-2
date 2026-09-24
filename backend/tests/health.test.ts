import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDatabaseConnection } from '../src/metadata/metadata.repository.ts';

test('checkDatabaseConnection resolves when the database is reachable', async () => {
    await assert.doesNotReject(() => checkDatabaseConnection());
});
