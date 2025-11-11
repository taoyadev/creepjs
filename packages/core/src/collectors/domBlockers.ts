import type { DomBlockerFingerprint } from '../types';

const CLASS_NAMES = ['adsbox', 'ad-banner', 'google-ads', 'text-ad', 'ad-container'];

export function collectDomBlockersFingerprint(): DomBlockerFingerprint | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const root = document.body || document.documentElement;
  if (!root) {
    return undefined;
  }

  const testContainer = document.createElement('div');
  testContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';

  CLASS_NAMES.forEach((className) => {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = 'advertisement';
    el.style.height = '10px';
    testContainer.appendChild(el);
  });

  root.appendChild(testContainer);

  const detected: string[] = [];
  Array.from(testContainer.children).forEach((child, index) => {
    const element = child as HTMLElement;
    const computed = window.getComputedStyle(element);
    if (
      computed.display === 'none' ||
      computed.visibility === 'hidden' ||
      element.clientHeight === 0 ||
      element.clientWidth === 0
    ) {
      detected.push(CLASS_NAMES[index]);
    }
  });

  root.removeChild(testContainer);

  return {
    detected,
  };
}
