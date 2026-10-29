#!/usr/bin/env node
// Isolated test build. Never edits the delivery source, output, or catalog.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const { execFileSync } = require('node:child_process');
if (!process.env.OPENCLAW_ARTIFACT_DIR || process.env.QA_BASE_URL)
  throw new Error('Fixture QA requires the managed isolated OpenClaw lane.');
const source = process.cwd();
const fixtureRoot = '/Volumes/Elements/openclaw/test-workspace';
if (
  !fs.existsSync(fixtureRoot) ||
  fs.statSync(fixtureRoot).dev === fs.statSync('/Volumes').dev
)
  throw new Error(
    'The approved Elements test volume is unavailable; no local fallback.'
  );
fs.accessSync(fixtureRoot, fs.constants.W_OK);
const fixture = fs.mkdtempSync(path.join(fixtureRoot, 'creepjs-partner-qa-'));
const web = path.join(fixture, 'apps/web');
const catalogPath = 'apps/web/src/lib/proxy-providers.ts';
const catalog = fs.readFileSync(path.join(source, catalogPath), 'utf8');
const sourceHash = crypto.createHash('sha256').update(catalog).digest('hex');
fs.cpSync(path.join(source, 'apps/web'), web, {
  recursive: true,
  filter: (entry) =>
    !['node_modules', '.next', 'out', '.turbo', '.git'].includes(
      path.basename(entry)
    ) &&
    !path.basename(entry).startsWith('.env') &&
    !path.basename(entry).endsWith('.env.txt'),
});
fs.symlinkSync(
  path.join(source, 'apps/web/node_modules'),
  path.join(web, 'node_modules'),
  'dir'
);
fs.symlinkSync(
  path.join(source, 'node_modules'),
  path.join(fixture, 'node_modules'),
  'dir'
);
fs.symlinkSync(
  path.join(source, 'packages'),
  path.join(fixture, 'packages'),
  'dir'
);
fs.cpSync(
  path.join(source, 'scripts/fixtures'),
  path.join(fixture, 'scripts/fixtures'),
  { recursive: true }
);
const providers = JSON.parse(
  fs.readFileSync(
    path.join(source, 'scripts/fixtures/proxy-providers.json'),
    'utf8'
  )
);
const parsed = ts.createSourceFile(
  'proxy-providers.ts',
  catalog,
  ts.ScriptTarget.Latest,
  true
);
let initializer;
for (const statement of parsed.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(parsed) === 'PROXY_PROVIDERS')
      initializer = declaration.initializer;
  }
}
if (!initializer) throw new Error('Reviewed catalog declaration not found.');
fs.writeFileSync(
  path.join(fixture, catalogPath),
  catalog.slice(0, initializer.getStart(parsed)) +
    JSON.stringify(providers) +
    catalog.slice(initializer.getEnd())
);
const receipt = {
  kind: 'synthetic-partner-fixture-only',
  source,
  fixture,
  sourceCatalogSha256: sourceHash,
  providers: providers.map(({ id }) => id),
  productionEligible: false,
};
fs.writeFileSync(
  path.join(process.env.OPENCLAW_ARTIFACT_DIR, 'fixture-source.json'),
  JSON.stringify(receipt, null, 2)
);
try {
  execFileSync('pnpm', ['--dir', 'apps/web', 'build'], {
    cwd: fixture,
    stdio: 'inherit',
  });
  execFileSync(
    'node',
    [path.join(source, 'scripts/task-first-browser-qa.cjs'), '--partners-only'],
    {
      cwd: fixture,
      stdio: 'inherit',
      env: { ...process.env, QA_PARTNER_FIXTURE: '1' },
    }
  );
} finally {
  if (fs.readFileSync(path.join(source, catalogPath), 'utf8') !== catalog)
    throw new Error('Delivery source changed during fixture QA.');
  console.log(
    'Fixture retained for review at ' +
      fixture +
      '; delivery catalog and build unchanged.'
  );
}
