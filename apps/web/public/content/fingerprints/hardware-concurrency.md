# Hardware Concurrency

<!-- llms-safe:start -->

## What CreepJS reports

Reads navigator.hardwareConcurrency, the number of logical processors the browser exposes.

## How to interpret it

Compare the returned number with your expected browser configuration. It can be useful when checking whether a privacy setting caps the exposed count.

## Limits

Browsers can round or limit this hint. It is not a CPU performance score or a reliable physical-core count. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/hardware-concurrency
- Full checker: https://creepjs.org/checker
- Category: Hardware

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
