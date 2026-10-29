#!/usr/bin/env node
// Fail closed before publishing Web when this release changes the API contract.
const { execFileSync } = require('node:child_process');

function latestApiRelease(runs, sha) {
  return runs
    .filter(
      (run) =>
        run.head_sha === sha &&
        run.head_branch === 'main' &&
        ['push', 'workflow_dispatch'].includes(run.event)
    )
    .sort((a, b) => b.id - a.id)[0];
}

async function main() {
  const sha = process.env.GITHUB_SHA;
  const before = process.env.API_RELEASE_BASE_SHA;
  if (!/^[a-f0-9]{40}$/.test(sha || ''))
    throw new Error('Expected exact GITHUB_SHA');
  if (
    process.env.GITHUB_EVENT_NAME === 'push' &&
    /^[a-f0-9]{40}$/.test(before || '') &&
    !/^0+$/.test(before)
  ) {
    const changed = execFileSync(
      'git',
      [
        'diff',
        '--name-only',
        before,
        sha,
        '--',
        'apps/api',
        'packages/core',
        'packages/sdk',
        'pnpm-lock.yaml',
        '.github/workflows/deploy-api.yml',
      ],
      { encoding: 'utf8' }
    ).trim();
    if (!changed) {
      console.log('Web-only push: API contract is unchanged.');
      return;
    }
  }
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || ''))
    throw new Error('Expected GITHUB_REPOSITORY');
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = JSON.parse(
      execFileSync(
        'gh',
        [
          'api',
          `repos/${repository}/actions/workflows/deploy-api.yml/runs?head_sha=${sha}&per_page=100`,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      )
    );
    const run = latestApiRelease(response.workflow_runs, sha);
    if (run?.status === 'completed') {
      if (run.conclusion !== 'success')
        throw new Error(
          `API release ${run.id} ended with ${run.conclusion}; Web publication blocked.`
        );
      console.log(
        `API release ${run.id} passed for ${sha}; Web publication may proceed.`
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error(
    'No successful API release for this exact commit within 10 minutes.'
  );
}

module.exports = { latestApiRelease };
if (require.main === module)
  main().catch((error) => {
    // Only fixed failure messages; do not dump subprocess environment or tokens.
    console.error(error.message);
    process.exitCode = 1;
  });
