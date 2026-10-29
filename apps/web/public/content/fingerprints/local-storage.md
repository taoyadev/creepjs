# Local Storage

<!-- llms-safe:start -->

## What CreepJS reports

Checks the browser-exposed localStorage surface without saving application data.

## How to interpret it

Use this as an availability hint. A restricted browser can expose the API while denying actual storage operations.

## Limits

This collector does not verify a successful write. The live report stays usable even if saving checker history is blocked. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/local-storage
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
