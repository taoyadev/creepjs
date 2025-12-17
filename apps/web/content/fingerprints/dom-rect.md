# DOM Rectangle Fingerprinting: Layout Engine Precision

DOM element measurement (getBoundingClientRect) produces different results across browsers. Layout engines calculate pixel positions with varying precision.

```javascript
function getDOMRectFingerprint() {
  const div = document.createElement('div');
  div.style.cssText = 'width:100.5px;height:50.25px;position:absolute;';
  document.body.appendChild(div);

  const rect = div.getBoundingClientRect();
  document.body.removeChild(div);

  return {
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y,
  };
}
```

Sub-pixel rendering differences create unique fingerprints.

---

**Word Count**: 95 words (will expand)
