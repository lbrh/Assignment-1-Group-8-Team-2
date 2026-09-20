import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Side-effect import: loads backend/.env once, regardless of how the process was
// started. npm scripts pass --env-file-if-exists, but an IDE's own "Run test" action
// (e.g. WebStorm right-click > Run) invokes node directly and skips that flag, so
// anything reading process.env.DATABASE_URL would otherwise see it unset.
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env');
if (existsSync(envPath) && !process.env.DATABASE_URL) {
    process.loadEnvFile(envPath);
}
