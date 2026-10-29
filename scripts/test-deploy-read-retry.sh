#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load only the real read helper; never run the publisher or credential bridge.
retry_helper=$(rg --pcre2 --multiline --only-matching '(?ms)^github_read\(\) \{.*?^\}' deploy-direct.sh)
[[ -n "$retry_helper" ]]
eval "$retry_helper"
declare -F github_read >/dev/null
retry_log=$(mktemp)
trap 'rm -f "$retry_log"' EXIT
sleep() { :; }

github() {
  echo call >> "$retry_log"
  if [[ $(wc -l < "$retry_log") -lt 3 ]]; then
    echo 'TLS handshake timeout' >&2
    return 1
  fi
  printf '%s\n' expected-sha
}
result=$(github_read api repos/taoyadev/creepjs/git/ref/heads/main --jq .object.sha)
[[ "$result" == expected-sha && $(wc -l < "$retry_log") -eq 3 ]]

: > "$retry_log"
github() { echo call >> "$retry_log"; return 17; }
if github_read pr view fixture; then
  echo 'Expected bounded read failure.' >&2
  exit 1
else
  [[ $? -eq 17 && $(wc -l < "$retry_log") -eq 3 ]]
fi

: > "$retry_log"
if github_read pr merge fixture; then
  echo 'A mutation must not enter the retry helper.' >&2
  exit 1
else
  [[ $? -eq 2 && ! -s "$retry_log" ]]
fi
if github_read workflow run fixture; then
  echo 'A workflow dispatch must not enter the retry helper.' >&2
  exit 1
else
  [[ $? -eq 2 && ! -s "$retry_log" ]]
fi
if github_read api repos/taoyadev/creepjs/git/ref/heads/main --method PATCH; then
  echo 'An API method override must not enter the retry helper.' >&2
  exit 1
else
  [[ $? -eq 2 && ! -s "$retry_log" ]]
fi
echo 'Deploy metadata retry checks passed: recovery, bounded failure, and mutation refusal.'
