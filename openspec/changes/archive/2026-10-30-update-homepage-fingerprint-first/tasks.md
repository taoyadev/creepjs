## 1. Implementation

- [x] 1.1 Share idle scheduling between the checker and the homepage, and move
      the lazily loaded scan state into one hook used by the homepage and the
      guide teaser.
- [x] 1.2 Replace the homepage card pair with a fingerprint-first scan panel
      and a secondary own-IP panel.
- [x] 1.3 Update the homepage, privacy policy, and UX acceptance disclosures
      for the automatic scan.
- [x] 1.4 Add unit coverage for the signal summary, ID glyph, and first-render
      contract, keeping the collectors out of the homepage's initial chunks.
- [x] 1.5 Extend the browser acceptance harness with the automatic homepage
      scan, first-viewport, rerun, and no-comparison checks.

## 2. Validation

- [x] 2.1 Pass the release prepare gate on OpenClaw: format, build, types,
      lint, unit tests, SDK size, secret scan, strict OpenSpec, Worker dry run,
      and the high-risk dependency audit. Passed on `ef14416` with 393 unit
      tests; receipt
      `~/.codex/state/openclaw-test/creepjs-web-release/20261030T-home-fp-2-receipt.json`.
- [x] 2.2 Pass the isolated browser acceptance and partner fixture runs, with
      desktop, mobile, and dark homepage screenshots reviewed. 22/22 and 8/8
      passed with 42 accessibility combinations and zero violations;
      artifacts under `openclaw:~/artifacts/creepjs-web-release/`
      `20261030-092721` and `20261030-092833`. A 768/1024/1280 layout check
      passed in `20261030-093322`.

## 3. Publication

- [x] 3.1 Publish only after explicit operator approval, then rerun browser
      acceptance against https://creepjs.org. Published as PR #24, merge
      commit `50bb344`; canonical acceptance passed 22/22 at
      `openclaw:~/artifacts/creepjs-web-release/20261030-095817`.
