import { createGzip } from 'node:zlib';
import { createReadStream, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIB = 1024;
// Resolve from this script's own location (repo root = parent of scripts/) so
// the check works no matter the cwd it is invoked from — e.g. CI runs it via
// `pnpm --filter @creepjs/sdk check:size`, whose cwd is packages/sdk.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = (file) => resolve(root, 'packages/sdk/dist', file);

// The thin loader is what pages embed; the full bundle (all collectors) is
// what every getFingerprint() call downloads. The product target for the full
// bundle is 15 KB gzipped: crossing it warns, and 16 KiB fails, so a small
// collector change does not break CI but real growth does.
const targets = [
  { file: dist('creepjs.umd.js'), max: 5 * KIB },
  { file: dist('creepjs.esm.js'), max: 5 * KIB },
  { file: dist('creepjs.full.umd.js'), max: 16 * KIB, warn: 15 * KIB },
  { file: dist('creepjs.full.esm.js'), max: 16 * KIB, warn: 15 * KIB },
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

for (const { file } of targets) {
  if (!existsSync(file)) {
    throw new Error(`Missing SDK build artifact: ${file}`);
  }
}

const sizes = await Promise.all(targets.map(({ file }) => gzipSize(file)));

let failed = false;
targets.forEach(({ file, max, warn }, index) => {
  const size = sizes[index];
  const limits = warn ? `warn ${warn}, max ${max}` : `max ${max}`;
  if (size > max) {
    failed = true;
    console.log(`FAIL ${file} gzip=${size} bytes (${limits})`);
  } else if (warn && size > warn) {
    console.log(`WARN ${file} gzip=${size} bytes (${limits})`);
    // Surfaces as an annotation on the GitHub Actions run.
    console.log(
      `::warning file=scripts/check-sdk-size.mjs::${file} is ${size} B gzipped, over the ${warn} B target`
    );
  } else {
    console.log(`PASS ${file} gzip=${size} bytes (${limits})`);
  }
});

if (failed) {
  process.exit(1);
}
