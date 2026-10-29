# Media Devices

<!-- llms-safe:start -->

## What CreepJS reports

Enumerates media devices and returns counts by kind plus browser-exposed labels and grouping hints. It does not request camera or microphone access.

## How to interpret it

Check whether audio input, output, and video counts match what this browser is permitted to list. Inspect JSON for the exposed device kinds.

## Limits

An empty label or zero count can reflect permissions or browser policy. Do not grant access solely to improve this diagnostic. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/media-devices
- Full checker: https://creepjs.org/checker
- Category: Hardware

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
