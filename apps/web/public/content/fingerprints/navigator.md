# Navigator Information

<!-- llms-safe:start -->

## What CreepJS reports

Reads browser-reported user agent, platform, language, cookie support, online status, and available automation or connection hints.

## How to interpret it

Compare the reported platform and language with your intended browser settings. A webdriver hint describes an exposed flag; it is not an automation verdict.

## Limits

User-agent reduction and overrides can hide or change these hints. Online status does not guarantee internet access, and a missing field is unknown. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/navigator
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
