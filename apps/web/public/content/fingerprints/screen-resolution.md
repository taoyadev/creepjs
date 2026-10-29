# Screen Resolution

<!-- llms-safe:start -->

## What CreepJS reports

Returns the browser-exposed screen dimensions as a numeric tuple; missing dimensions are null.

## How to interpret it

Compare after moving to a different display or changing display settings. Keep the tuple separate from viewport size.

## Limits

This does not determine an exact device model. Scaling, browser normalization, and screen orientation affect the exposed dimensions. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/screen-resolution
- Full checker: https://creepjs.org/checker
- Category: Hardware

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
