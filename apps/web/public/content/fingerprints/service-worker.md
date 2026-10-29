# Service Worker Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

Checks service worker support, the current controller and registration, exposed worker features, and available notification or push permission states.

## How to interpret it

Compare supported, controller, and ready separately. A supported API can have no active controller on this page.

## Limits

This collector does not request notification permission or register a new worker. Registration and permission state are specific to this site. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/service-worker
- Full checker: https://creepjs.org/checker
- Category: Network

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
