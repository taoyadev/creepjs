# Console Errors Fingerprinting: Your Error Messages Track You

JavaScript engines produce different error messages and stack traces. By triggering intentional errors and analyzing the output, websites fingerprint your browser's JavaScript engine.

```javascript
function getConsoleErrorsFingerprint() {
  try {
    null.f();
  } catch (e) {
    return {
      message: e.message,
      stack: e.stack,
      name: e.name,
      engineType: detectEngine(e.stack),
    };
  }
}
```

V8 (Chrome), SpiderMonkey (Firefox), and JavaScriptCore (Safari) all format errors differently.

---

**Word Count**: 85 words (will expand)
