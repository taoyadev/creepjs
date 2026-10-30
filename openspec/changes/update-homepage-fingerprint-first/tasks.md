## 1. Implementation

- [ ] 1.1 Share idle scheduling between the checker and the homepage, and move
      the lazily loaded scan state into one hook used by the homepage and the
      guide teaser.
- [ ] 1.2 Replace the homepage card pair with a fingerprint-first scan panel
      and a secondary own-IP panel.
- [ ] 1.3 Update the homepage, privacy policy, and UX acceptance disclosures
      for the automatic scan.
- [ ] 1.4 Add unit coverage for the signal summary, ID glyph, and first-render
      contract, keeping the collectors out of the homepage's initial chunks.
- [ ] 1.5 Extend the browser acceptance harness with the automatic homepage
      scan, first-viewport, rerun, and no-comparison checks.

## 2. Validation

- [ ] 2.1 Pass the release prepare gate on OpenClaw: format, build, types,
      lint, unit tests, SDK size, secret scan, strict OpenSpec, Worker dry run,
      and the high-risk dependency audit.
- [ ] 2.2 Pass the isolated browser acceptance and partner fixture runs, with
      desktop, mobile, and dark homepage screenshots reviewed.

## 3. Publication

- [ ] 3.1 Publish only after explicit operator approval, then rerun browser
      acceptance against https://creepjs.org.
