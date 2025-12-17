import type { CanvasFingerprint } from '../types';

/**
 * Collect Canvas fingerprint by drawing text and shapes
 * Canvas rendering varies by GPU, fonts, and browser implementation
 */
export function collectCanvasFingerprint(): CanvasFingerprint | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');

    if (!ctx) return undefined;

    // Draw text with various styles
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.font = '11pt "Times New Roman"';
    ctx.fillText('CreepJS 🔍', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('Browser', 4, 45);

    // Draw some shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath();
    ctx.arc(75, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgb(255,255,0)';
    ctx.beginPath();
    ctx.arc(62.5, 35, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Get data URL
    const dataURL = canvas.toDataURL();

    // Hash the canvas data
    const hash = dataURL.slice(-100); // Use last 100 chars as simplified hash

    return {
      hash,
      dataURL,
    };
  } catch (error) {
    console.error('Canvas fingerprinting error:', error);
    return undefined;
  }
}
