# Session Storage

<!-- llms-safe:start -->

## What CreepJS reports

Checks the browser-exposed sessionStorage surface without saving application data.

## How to interpret it

A returned flag describes API availability. It does not promise that values can be written or read in a restricted context.

## Limits

Storage permissions, quotas, and privacy settings can differ from API presence. Test your real storage operation before relying on persistence. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/session-storage
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
