import { cloudflareTest } from '@cloudflare/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));

// Wrangler writes a debug log file by default. In sandboxed environments, writing to the
// global config directory can fail (e.g. EPERM). Redirect logs into the workspace.
process.env.WRANGLER_LOG_PATH ??= path.join(configDir, '.wrangler', 'logs');

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
    }),
  ],
});
