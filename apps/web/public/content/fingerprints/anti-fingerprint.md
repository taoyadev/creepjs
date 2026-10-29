# Anti-Fingerprinting Detection

<!-- llms-safe:start -->

## What CreepJS reports

Runs browser-resistance heuristics and returns individual detection flags, a detection count, and an overall indicator.

## How to interpret it

Inspect the named flags before drawing a conclusion. Compare one setting at a time to see which heuristic changed.

## Limits

These are heuristics with possible false positives. They cannot prove that a particular extension is installed or that a browser is safe. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/anti-fingerprint
- Full checker: https://creepjs.org/checker
- Category: Privacy

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
