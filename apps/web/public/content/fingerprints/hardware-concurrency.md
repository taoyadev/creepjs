# Hardware Concurrency Fingerprinting

Detects CPU core count via `navigator.hardwareConcurrency`, revealing device performance tier and hardware configuration.

## How It Works

```javascript
const cores = navigator.hardwareConcurrency; // 4, 8, 12, 16, etc.
```

## Distribution (2024 Data)

| Cores | % | Typical Devices |
|-------|---|-----------------|
| 2 | 15% | Budget laptops, old phones |
| 4 | 35% | Mid-range devices |
| 6 | 12% | Modern laptops |
| 8 | 25% | High-end laptops, desktops |
| 12+ | 13% | Workstations, Mac Studio |

**Entropy**: 2-3 bits | **Uniqueness**: Medium when combined

## Privacy: Reveals device tier, purchase power, professional use

**Mitigation**: Tor (reports 2), Brave (randomizes slightly)
