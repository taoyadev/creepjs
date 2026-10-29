# Platform Detection

<!-- llms-safe:start -->

## What CreepJS reports

Reads the legacy navigator.platform value.

## How to interpret it

Compare the literal value with other browser hints when investigating a mismatch. It is reported data, not verified hardware.

## Limits

Compatibility behavior, user-agent reduction, and overrides can return a value different from the actual operating system. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/platform
- Full checker: https://creepjs.org/checker
- Category: System

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
