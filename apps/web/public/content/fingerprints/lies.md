# Lies Detection

<!-- llms-safe:start -->

## What CreepJS reports

After you start the check, collects a full browser snapshot and applies consistency heuristics, returning named flags, a count, and a heuristic trust score.

## How to interpret it

Inspect the named inconsistencies and compare their underlying values. Change one setting and rerun before attributing a mismatch to a cause.

## Limits

The full scan includes a Google STUN request. The trust score is a heuristic, not a calibrated fraud probability; privacy tools and browser differences can produce mismatches. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/lies
- Full checker: https://creepjs.org/checker
- Category: Privacy

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
