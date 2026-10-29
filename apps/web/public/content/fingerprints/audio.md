# Audio Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

Renders an offline audio graph and returns a numeric sample summary with its derived signature. This does not request microphone access.

## How to interpret it

Compare the numeric sum and signature across reruns. Inspect changes after a browser update or audio privacy setting change.

## Limits

The result reflects the browser audio implementation. It is not a recording, a hearing test, or an audio-device identity. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/audio
- Full checker: https://creepjs.org/checker
- Category: Audio

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
