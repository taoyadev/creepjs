# Canvas Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

Draws text and overlapping shapes on a 2D canvas and returns a rendering signature. The image payload is omitted from the visible and copied JSON.

## How to interpret it

Keep this result, change one rendering or privacy setting, then run again. A changed signature means this drawing produced different encoded output.

## Limits

This collector uses an encoded-image suffix as its signature, not a cryptographic digest. Equal signatures do not prove equal pixels or identify a browser. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/canvas
- Full checker: https://creepjs.org/checker
- Category: Graphics

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
