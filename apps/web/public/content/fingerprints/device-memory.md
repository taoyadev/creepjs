# Device Memory Fingerprinting

Detects RAM amount via `navigator.deviceMemory`, indicating device quality and multitasking capability.

## API

```javascript
const memory = navigator.deviceMemory; // 4, 8, 16, 32 (GB)
```

## Distribution

| RAM | % | Devices |
|-----|---|---------|
| 2GB | 8% | Low-end, old phones |
| 4GB | 35% | Budget devices |
| 8GB | 40% | Standard devices |
| 16GB+ | 17% | High-end, professional |

**Entropy**: 1.5-2 bits | Combines with CPU cores for device profiling

## Privacy: Strong indicator of device value ($300 vs $3000+)

**Mitigation**: Tor (reports undefined), Brave (rounds down)
