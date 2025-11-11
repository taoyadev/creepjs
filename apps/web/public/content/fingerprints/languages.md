# Languages Fingerprinting

Detects preferred languages via `navigator.languages`, revealing location, multilingual users, and cultural background.

## How It Works

```javascript
const languages = navigator.languages; 
// ["en-US", "zh-CN", "es"] - ordered by preference
const primary = navigator.language; // "en-US"
```

## Uniqueness

**Common patterns**:
- `["en-US"]` - 45% (US users)
- `["en-GB"]` - 8% (UK)  
- `["zh-CN"]` - 7% (China)
- Multiple languages - 15% (higher uniqueness)

**Entropy**: 3-5 bits (combined with order)

## Privacy

Reveals:
- Geographic location (80%+ accuracy)
- Immigration status (e.g., `["es", "en-US"]` suggests Hispanic American)
- Education level (multilingual users often more educated)

**Mitigation**: Hard to change without breaking websites. Tor uses single language.
