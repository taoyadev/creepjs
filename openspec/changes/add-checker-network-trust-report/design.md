# Design: Checker Network Trust Report

## Principle

The report is an evidence synthesis, not a classifier. It exposes the source of
each dimension and uses conservative language:

- browser inconsistencies and webdriver are observable indicators;
- collector coverage describes completeness;
- privacy resistance may be protective and is not automatically suspicious;
- IPbot risk is upstream context and may be absent;
- no combination is presented as identity, certainty, or fraud probability.

## Data flow

`useOwnIp` calls the existing public `/my-ip` endpoint once and returns
loading/ready/error state. `CheckerApp` owns that state beside
`useFingerprintScan` and passes the result to `NetworkTrustReport` and
`ExportReport`.

`NetworkTrustReport` derives a pure view model from `FingerprintResult` and the
optional own-IP summary. This derivation is unit tested independently from the
rendering component.

## Degradation

- Full response: show IP, location/ASN, risk band/verdict, and browser rows.
- Geo-only response: label risk enrichment unavailable and keep geo/ASN.
- Request failure: show browser-only verdict and an explicit unavailable row.
- Private/local development address: show the returned address but do not
  invent risk.

## Placement and navigation

The report is placed after the coverage dashboard and before detailed analysis
under `#trust`. The sticky checker section nav includes a Trust link. The
arbitrary-IP workflow stays on `/ip`.
