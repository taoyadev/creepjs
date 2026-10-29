# WebGL Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

Reads WebGL vendor, renderer, version, shader language, and graphics limits. Unmasked GPU names appear only if the browser exposes the debug extension.

## How to interpret it

Compare the renderer and individual graphics parameters after switching hardware acceleration. Inspect JSON for values behind each parameter group.

## Limits

A generic or hidden renderer can be intentional. Virtualization, drivers, and browser updates can change these values; GPU details do not establish identity. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/webgl
- Full checker: https://creepjs.org/checker
- Category: Graphics

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
