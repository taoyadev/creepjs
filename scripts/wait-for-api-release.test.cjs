const { test } = require('node:test');
const assert = require('node:assert/strict');
const { latestApiRelease } = require('./wait-for-api-release.cjs');

test('only a production API run at the exact SHA can authorize Web', () => {
  const run = {
    id: 1,
    head_sha: 'expected',
    head_branch: 'main',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
  };
  assert.equal(
    latestApiRelease(
      [
        { ...run, id: 4, head_sha: 'old' },
        { ...run, id: 3, event: 'pull_request' },
        { ...run, id: 2, head_branch: 'feature' },
        run,
      ],
      'expected'
    ),
    run
  );
  assert.equal(latestApiRelease([run], 'other'), undefined);
});

test('a newer pending or failed attempt cannot borrow an older success', () => {
  const run = {
    id: 1,
    head_sha: 'expected',
    head_branch: 'main',
    event: 'workflow_dispatch',
    status: 'completed',
    conclusion: 'success',
  };
  for (const conclusion of [null, 'failure', 'cancelled']) {
    const newer = {
      ...run,
      id: 2,
      conclusion,
      status: conclusion ? 'completed' : 'in_progress',
    };
    assert.equal(latestApiRelease([newer, run], 'expected'), newer);
  }
});
