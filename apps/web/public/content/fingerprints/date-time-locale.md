# Date/Time Locale

<!-- llms-safe:start -->

## What CreepJS reports

Reads the resolved Intl.DateTimeFormat locale. Status -1 means Intl is missing, -2 means DateTimeFormat is missing, and -3 means no locale was returned.

## How to interpret it

A language tag is the resolved formatting locale. The negative codes are unavailable states, not language values.

## Limits

The resolved locale can differ from the preferred language list and does not determine location or nationality. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/date-time-locale
- Full checker: https://creepjs.org/checker
- Category: System

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
