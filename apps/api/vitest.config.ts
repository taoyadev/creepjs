import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

// Wrangler writes a debug log file by default. In sandboxed environments, writing to the
// global config directory can fail (e.g. EPERM). Redirect logs into the workspace.
process.env.WRANGLER_LOG_PATH ??= path.join(configDir, '.wrangler', 'logs');

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});
