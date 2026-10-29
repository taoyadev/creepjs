# Cookies Enabled

<!-- llms-safe:start -->

## What CreepJS reports

Reads navigator.cookieEnabled, the browser-reported cookie support flag.

## How to interpret it

Yes means the browser reports cookies enabled in general. No means the reported capability is disabled.

## Limits

This does not write a test cookie. Site rules, third-party restrictions, and storage partitioning can still prevent individual cookies. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/cookies-enabled
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
