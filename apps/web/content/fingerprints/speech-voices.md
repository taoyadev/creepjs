# Speech Synthesis Voices: Your Text-to-Speech Is Betraying You

Your browser's text-to-speech voices create a unique fingerprint. The `speechSynthesis.getVoices()` API exposes all installed TTS voices, which varies dramatically by:

- Operating system (Windows has Microsoft voices, macOS has Siri voices, Linux has eSpeak)
- Installed applications (Adobe, Office add voices)
- Language packs (multilingual users have dozens of voices)
- Accessibility software (screen readers add specialized voices)

## What Is Speech Voices Fingerprinting?

Websites can enumerate all your TTS voices without permission:

```javascript
function getSpeechVoicesFingerprint() {
  const voices = speechSynthesis.getVoices();

  return {
    count: voices.length,
    voices: voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService,
    })),
    hash: hashVoices(voices),
  };
}
```

## The Statistics

| Metric                     | Value                  |
| -------------------------- | ---------------------- |
| **Default Windows voices** | 8-15                   |
| **macOS voices**           | 40-80 (many languages) |
| **Linux**                  | Highly variable        |
| **Trackability**           | Medium-High entropy    |

## What Nobody Tells You

### The Multilingual Trap

If you have language packs installed:

- Spanish TTS + English TTS + French TTS = highly unique
- Only bilingual/multilingual users have this combination
- Reveals linguistic background

### Accessibility Software Detection

Screen reader users have specialized voices:

- JAWS voices
- NVDA voices
- VoiceOver (macOS/iOS)

This reveals use of accessibility software, which is:

- Protected information under disability laws
- Highly identifying (small user percentage)
- Ethically questionable to fingerprint

### The macOS Voice Abundance

macOS includes 40-80+ voices by default across dozens of languages. The exact combination of enabled voices is identifying.

## Browser Differences

| Browser     | Exposes Voices          | Privacy Protection |
| ----------- | ----------------------- | ------------------ |
| **Chrome**  | ✅ All                  | None               |
| **Firefox** | ✅ All                  | RFP can limit      |
| **Safari**  | ✅ All (macOS rich set) | None               |
| **Brave**   | ⚠️ Limited              | Better             |

## Protection

- **Use Brave or Tor**: Limits voice enumeration
- **Uninstall unused language packs**
- **Disable TTS in Firefox RFP**

## Try It Now

See your TTS voices at [/fingerprint/speech-voices](/fingerprint/speech-voices).

---

**Last Updated**: November 2025 | **Word Count**: 425 words (will expand to 1000+)
