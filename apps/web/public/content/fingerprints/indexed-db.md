# IndexedDB Support

<!-- llms-safe:start -->

## What CreepJS reports

Checks whether the browser exposes the IndexedDB API.

## How to interpret it

Yes means the API is exposed; No means it was not found. Use an application-specific storage test when persistence is required.

## Limits

API presence does not guarantee that opening a database or writing data will succeed under current permissions and quota. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/indexed-db
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
