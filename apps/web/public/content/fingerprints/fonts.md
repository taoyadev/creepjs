# Font Detection Fingerprinting

Font detection is a powerful browser fingerprinting technique that identifies installed fonts on a user's system.

## How It Works

The technique measures text rendering differences to detect installed fonts:

1. Render text in a baseline font
2. Render the same text in the test font
3. Compare rendering dimensions
4. If dimensions differ, the font is installed

## Implementation

```javascript
const testFonts = [
  'Arial', 'Verdana', 'Times New Roman', 'Courier New',
  'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
  'Trebuchet MS', 'Arial Black', 'Impact'
];

const baseFonts = ['monospace', 'sans-serif', 'serif'];

const testString = 'mmmmmmmmmmlli';
const testChars = ['啊', '🎨', '∞', '█', '🏴'];

function detectFont(fontName) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const baseWidths = {};
  baseFonts.forEach(baseFont => {
    context.font = `72px ${baseFont}`;
    baseWidths[baseFont] = context.measureText(testString).width;
  });
  
  return baseFonts.some(baseFont => {
    context.font = `72px '${fontName}', ${baseFont}`;
    const width = context.measureText(testString).width;
    return width !== baseWidths[baseFont];
  });
}

const installedFonts = testFonts.filter(detectFont);
```

## Fingerprint Uniqueness

Font detection provides moderate to high uniqueness:

- **Windows**: 50-100 common fonts
- **macOS**: 100-200 fonts (more unique)
- **Linux**: Highly variable
- **Mobile**: Limited fonts (less unique)

Combined with other techniques, font detection significantly increases fingerprint uniqueness.

## Privacy Implications

### Information Revealed

- Operating system (via system fonts)
- Software installed (Adobe, Microsoft Office fonts)
- Geographic location (language-specific fonts)
- Professional tools (design software fonts)

### Mitigation

Browsers are implementing countermeasures:

- **Firefox**: Limits font enumeration
- **Brave**: Randomizes font measurements
- **Tor Browser**: Restricts to standard fonts

## Use Cases

✅ **Legitimate**:
- Fraud detection
- Bot detection
- Account security

❌ **Concerning**:
- User tracking without consent
- Privacy invasion
- Behavioral profiling

## Detection Accuracy

| Method | Accuracy | Speed |
|--------|----------|-------|
| Canvas measurement | 95%+ | Fast |
| Font list enumeration | 99%+ | Slow |
| CSS detection | 90%+ | Fast |

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | No restrictions |
| Firefox | ⚠️ Limited | Some protections |
| Safari | ✅ Full | No restrictions |
| Brave | ❌ Blocked | Randomizes measurements |

## Recommendations

For developers:

1. **Combine techniques**: Don't rely solely on fonts
2. **Respect privacy**: Honor DNT settings
3. **Be transparent**: Disclose font detection
4. **Cache results**: Don't repeat detection unnecessarily

For users:

1. Use privacy-focused browsers (Brave, Tor)
2. Limit font installations
3. Enable privacy extensions
4. Regularly clear browser data

## Further Reading

- [EFF: Browser Fingerprinting](https://www.eff.org/deeplinks/2018/06/gdpr-and-browser-fingerprinting-how-it-changes-game-sneakiest-web-trackers)
- [FingerprintJS Font Detection](https://github.com/fingerprintjs/fingerprintjs)
- [Mozilla: Font Fingerprinting](https://wiki.mozilla.org/Fingerprinting)
