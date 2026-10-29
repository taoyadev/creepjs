# Emoji Rendering

<!-- llms-safe:start -->

## What CreepJS reports

Measures rendered emoji geometry and returns a signature with the observed rectangle values.

## How to interpret it

Compare this result after changing fonts, display scaling, or the browser. Keep the actual measurements when investigating a signature change.

## Limits

Font fallback, layout rounding, and rendering choices affect geometry. This check does not identify a particular installed emoji font. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/emoji-rendering
- Full checker: https://creepjs.org/checker
- Category: Graphics

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
