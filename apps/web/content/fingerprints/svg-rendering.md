# SVG Rendering Fingerprinting: Vector Graphics Track You

SVG rendering fingerprinting measures how your browser renders scalable vector graphics. Like canvas fingerprinting but for SVG elements. Different browsers and operating systems render SVG paths, filters, and effects with slight variations.

```javascript
function getSVGFingerprint() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '200');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '10');
  rect.setAttribute('y', '10');
  rect.setAttribute('width', '180');
  rect.setAttribute('height', '180');
  rect.setAttribute('fill', '#f00');

  svg.appendChild(rect);
  document.body.appendChild(svg);

  // Measure rendering
  const bbox = rect.getBBox();
  document.body.removeChild(svg);

  return {
    width: bbox.width,
    height: bbox.height,
    x: bbox.x,
    y: bbox.y,
  };
}
```

## Statistics

- **Entropy**: ~3-4 bits
- **Trackability**: Medium (combined with other methods)
- **Browser differences**: Significant

---

**Word Count**: 210 words (will expand)
