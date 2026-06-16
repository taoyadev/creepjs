import { createGzip } from 'node:zlib';
import { createReadStream, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_GZIP_BYTES = 15 * 1024;
// Resolve from this script's own location (repo root = parent of scripts/) so
// the check works no matter the cwd it is invoked from — e.g. CI runs it via
// `pnpm --filter @creepjs/sdk check:size`, whose cwd is packages/sdk.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  resolve(root, 'packages/sdk/dist/creepjs.umd.js'),
  resolve(root, 'packages/sdk/dist/creepjs.esm.js'),
];

function gzipSize(file) {
  return new Promise((resolvePromise, rejectPromise) => {
    let total = 0;
    createReadStream(file)
      .pipe(createGzip())
      .on('data', (chunk) => {
        total += chunk.length;
      })
      .on('end', () => resolvePromise(total))
      .on('error', rejectPromise);
  });
}

for (const file of targets) {
  if (!existsSync(file)) {
    throw new Error(`Missing SDK build artifact: ${file}`);
  }
}

const sizes = await Promise.all(targets.map(gzipSize));

let failed = false;
targets.forEach((file, index) => {
  const size = sizes[index];
  const status = size <= MAX_GZIP_BYTES ? 'PASS' : 'FAIL';
  console.log(`${status} ${file} gzip=${size} bytes (max ${MAX_GZIP_BYTES})`);
  if (size > MAX_GZIP_BYTES) {
    failed = true;
  }
});

if (failed) {
  process.exit(1);
}
