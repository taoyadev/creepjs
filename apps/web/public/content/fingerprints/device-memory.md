# Device Memory

<!-- llms-safe:start -->

## What CreepJS reports

Reads the approximate memory hint exposed by navigator.deviceMemory when available.

## How to interpret it

The number is an approximate browser-reported memory tier in gigabytes. No result means this API is unavailable or blocked.

## Limits

The value can be rounded and capped and is not exact installed RAM. Unsupported browsers are not treated as low-memory devices. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/device-memory
- Full checker: https://creepjs.org/checker
- Category: Hardware

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
