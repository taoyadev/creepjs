import type { SVGFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect SVG rendering fingerprint
 */
export function collectSVGFingerprint(): SVGFingerprint | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.style.position = 'absolute';
    svg.style.left = '-9999px';

    // Create a complex SVG with various elements
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '10');
    rect.setAttribute('y', '10');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'red');

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '30');
    circle.setAttribute('fill', 'blue');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '10');
    text.setAttribute('y', '150');
    text.setAttribute('font-family', 'Arial');
    text.setAttribute('font-size', '20');
    text.textContent = 'SVG Test';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 10 80 Q 95 10 180 80');
    path.setAttribute('stroke', 'green');
    path.setAttribute('fill', 'transparent');

    svg.appendChild(rect);
    svg.appendChild(circle);
    svg.appendChild(text);
    svg.appendChild(path);

    document.body.appendChild(svg);

    // Get computed values
    const rectBox = rect.getBBox();
    const circleBox = circle.getBBox();
    const textBox = text.getBBox();
    const pathBox = path.getBBox();

    const data = [
      rectBox.x,
      rectBox.y,
      rectBox.width,
      rectBox.height,
      circleBox.x,
      circleBox.y,
      circleBox.width,
      circleBox.height,
      textBox.x,
      textBox.y,
      textBox.width,
      textBox.height,
      pathBox.x,
      pathBox.y,
      pathBox.width,
      pathBox.height,
    ];

    document.body.removeChild(svg);

    const hash = murmurHash3(data.join(','));

    return {
      hash: String(hash),
      data: data,
      supported: true,
    };
  } catch (error) {
    console.error('SVG fingerprinting error:', error);
    return {
      hash: '0',
      data: [],
      supported: false,
    };
  }
}
