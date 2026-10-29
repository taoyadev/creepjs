const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('a failing scan reports the file and never the matched value', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'creepjs-scan-test-'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(
    path.join(__dirname, 'secret-scan.sh'),
    path.join(root, 'scripts/secret-scan.sh')
  );
  const synthetic = 'cfp_' + 'A'.repeat(24);
  fs.writeFileSync(path.join(root, 'synthetic-fixture.txt'), synthetic);
  const result = spawnSync('bash', ['scripts/secret-scan.sh'], {
    cwd: root,
    encoding: 'utf8',
  });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1);
  assert.ok(output.includes('synthetic-fixture.txt'));
  assert.ok(!output.includes(synthetic));
});

test('a Git-free snapshot honors ignored runtime files and excludes nested worktrees', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'creepjs-scan-scope-'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(
    path.join(__dirname, 'secret-scan.sh'),
    path.join(root, 'scripts/secret-scan.sh')
  );
  fs.writeFileSync(path.join(root, '.gitignore'), '.deploy.env\n');
  const synthetic = 'cfp_' + 'A'.repeat(24);
  fs.writeFileSync(path.join(root, '.deploy.env'), synthetic);
  fs.mkdirSync(path.join(root, '.claude/worktrees/other'), { recursive: true });
  fs.writeFileSync(
    path.join(root, '.claude/worktrees/other/example.txt'),
    synthetic
  );
  const result = spawnSync('bash', ['scripts/secret-scan.sh'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(!(result.stdout + result.stderr).includes(synthetic));
});
