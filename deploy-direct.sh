#!/bin/bash

# Publish through the existing GitHub Actions workflows. Cloudflare credentials
# stay in GitHub; builds, smoke checks and rollback remain owned by the workflows.
# Run this channel through ~/.codex/bin/release run --go.
set -euo pipefail

repo=taoyadev/creepjs
target=${1:-all}
case "$target" in
  all) workflows=(deploy-api.yml deploy-web.yml) ;;
  api) workflows=(deploy-api.yml) ;;
  web) workflows=(deploy-web.yml) ;;
  *) echo 'Usage: deploy-direct.sh [web|api|all]' >&2; exit 2 ;;
esac

github() {
  "$HOME/.codex/bin/github-token-run" --user taoyadev -- gh "$@"
}

# Only idempotent metadata queries may be replayed after a transport failure.
github_read() {
  case "$1 $2" in
    'pr view'|'run list'|'api repos/taoyadev/creepjs/git/ref/heads/main') ;;
    *) echo 'Refusing to retry a GitHub mutation.' >&2; return 2 ;;
  esac
  if [[ "$1" == api && ( "$#" -ne 4 || "$3" != --jq || "$4" != .object.sha ) ]]; then
    echo 'Refusing API options that could change the request method.' >&2
    return 2
  fi
  local attempt result status
  for attempt in 1 2 3; do
    if result=$(github "$@"); then
      printf '%s\n' "$result"
      return 0
    else
      status=$?
    fi
    [[ "$attempt" -eq 3 ]] && return "$status"
    echo 'GitHub metadata query failed; retrying the read.' >&2
    sleep 2
  done
}

cd "$(git rev-parse --show-toplevel)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Commit the release tree before publishing.' >&2
  exit 1
fi

head_sha=$(git rev-parse HEAD)
branch=$(git branch --show-current)
main_sha=$(github_read api "repos/$repo/git/ref/heads/main" --jq .object.sha)
started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [[ "$head_sha" != "$main_sha" ]]; then
  read -r pr_number pr_head pr_base pr_state < <(
    github_read pr view "$branch" --repo "$repo" \
      --json number,headRefOid,baseRefName,state \
      --jq '[.number,.headRefOid,.baseRefName,.state] | join(" ")'
  )
  if [[ "$pr_head" != "$head_sha" || "$pr_base" != main || "$pr_state" != OPEN ]]; then
    echo 'Release requires an open main-targeting PR at the exact local commit.' >&2
    exit 1
  fi
  echo "Waiting for the required check on $head_sha."
  required_result=
  for attempt in {1..60}; do
    required_result=$(github_read pr view "$pr_number" --repo "$repo" \
      --json statusCheckRollup \
      --jq '.statusCheckRollup[] | select(.name == "All Checks Passed") | .conclusion')
    [[ "$required_result" == SUCCESS ]] && break
    case "$required_result" in
      FAILURE|CANCELLED|TIMED_OUT|ACTION_REQUIRED)
        echo "Required check ended with $required_result." >&2; exit 1 ;;
    esac
    sleep 10
  done
  if [[ "$required_result" != SUCCESS ]]; then
    echo 'Required check did not pass; no merge was attempted.' >&2
    exit 1
  fi
  # Branch protection enforces the required checks. Never use an admin bypass.
  github pr merge "$pr_number" --repo "$repo" --merge --match-head-commit "$head_sha"
  release_sha=$(github_read pr view "$pr_number" --repo "$repo" --json mergeCommit --jq .mergeCommit.oid)
  release_event=push
else
  release_sha=$head_sha
  release_event=workflow_dispatch
fi

for workflow in "${workflows[@]}"; do
  if [[ "$release_event" == workflow_dispatch ]]; then
    github workflow run "$workflow" --repo "$repo" --ref main
  fi
  run_id=
  for attempt in {1..20}; do
    run_id=$(github_read run list --repo "$repo" --workflow "$workflow" \
      --branch main --commit "$release_sha" --event "$release_event" --limit 10 \
      --json databaseId,createdAt \
      --jq "[.[] | select(.createdAt >= \"$started_at\")] | .[0].databaseId // empty")
    [[ -n "$run_id" ]] && break
    sleep 3
  done
  if [[ -z "$run_id" ]]; then
    echo "No $workflow run found for $release_sha; inspect Actions before retrying." >&2
    exit 1
  fi
  echo "$workflow: https://github.com/$repo/actions/runs/$run_id"
  github run watch "$run_id" --repo "$repo" --exit-status --interval 15
done
echo "Production workflows passed for $release_sha."
