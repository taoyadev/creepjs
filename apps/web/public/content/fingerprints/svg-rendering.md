# SVG Rendering

<!-- llms-safe:start -->

## What CreepJS reports

Measures SVG geometry, returning a support flag, numeric measurements, and a rendering signature.

## How to interpret it

Compare measurements before and after display or browser rendering changes. A false support flag means this collector could not use the required SVG surface.

## Limits

Layout precision, fonts, and browser support affect the measurements. An unavailable SVG result is not evidence of privacy protection by itself. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/svg-rendering
- Full checker: https://creepjs.org/checker
- Category: Graphics

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
