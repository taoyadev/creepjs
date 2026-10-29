# DOM Rectangle

<!-- llms-safe:start -->

## What CreepJS reports

Measures DOM rectangles and records support for rectangle and range measurement APIs.

## How to interpret it

Compare the numeric measurements after a layout, zoom, or rendering change. Support flags show which measurement APIs responded.

## Limits

Subpixel rounding, fonts, and privacy defenses can change measurements. A different rectangle signature is not an identity verdict. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/dom-rect
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
