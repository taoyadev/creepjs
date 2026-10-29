# Speech Synthesis Voices

<!-- llms-safe:start -->

## What CreepJS reports

Lists speech synthesis voices exposed by the browser, including language, default status, and local-service flags.

## How to interpret it

Inspect languages and the default voice in JSON. If the list is initially empty, rerun after browser speech services have initialized.

## Limits

Voice availability is platform- and browser-dependent. A voice list is not a microphone recording and does not show which voice a person uses. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/speech-voices
- Full checker: https://creepjs.org/checker
- Category: Audio

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
