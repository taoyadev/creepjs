# Content Window

<!-- llms-safe:start -->

## What CreepJS reports

Inspects a temporary iframe window for exposed properties, methods, and document availability.

## How to interpret it

Compare the property counts and individual feature flags in JSON. A missing document describes this test context, not every iframe.

## Limits

Sandboxing, browser differences, and privacy tools may change the surface. The check does not inspect other tabs or your browsing history. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/content-window
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
