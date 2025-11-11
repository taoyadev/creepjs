# Touch Support Fingerprinting

Detects touchscreen capability via `navigator.maxTouchPoints`, differentiating mobile, tablets, and touchscreen laptops.

## API

```javascript
const touchPoints = navigator.maxTouchPoints;
// 0 = no touch, 5 = phone/tablet, 10 = large touchscreen
```

## Distribution

| Points | % | Device Type |
|--------|---|-------------|
| 0 | 70% | Desktop, non-touch laptop |
| 5 | 20% | Phone, tablet |
| 10 | 8% | Touchscreen laptop, Surface |
| 1 | 2% | Stylus devices |

**Entropy**: 1.5-2 bits

## Device Inference

```javascript
if (touchPoints === 0 && screen.width > 1024) return 'Desktop PC';
if (touchPoints >= 5 && screen.width < 768) return 'Mobile Phone';
if (touchPoints >= 10) return 'Touchscreen Laptop';
```

## Privacy

Reveals:
- Device category (mobile vs desktop)
- Newer device (touch support grew post-2015)
- Convertible laptop (10 points)

**Mitigation**: Hard to fake. Best: Use desktop mode on mobile browsers.
