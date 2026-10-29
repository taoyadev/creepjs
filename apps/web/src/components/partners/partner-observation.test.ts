import { afterEach, describe, expect, it, vi } from 'vitest';
import { observePartnerImpression } from './partner-observation';

afterEach(() => vi.unstubAllGlobals());
describe('partner visibility', () => {
  it('requires half the card and a visible document, then reports only once', () => {
    const doc = Object.assign(new EventTarget(), {
      visibilityState: 'visible',
    });
    vi.stubGlobal('document', doc);
    const disconnect = vi.fn();
    let intersect: IntersectionObserverCallback = () => undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(
          callback: IntersectionObserverCallback,
          options: IntersectionObserverInit
        ) {
          intersect = callback;
          expect(options.threshold).toEqual([0, 0.5]);
        }
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = disconnect;
      }
    );
    const node = {} as Element;
    const report = vi.fn();
    const stop = observePartnerImpression(node, report);
    const visible = (ratio: number) =>
      intersect(
        [
          {
            target: node,
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    visible(0);
    visible(0.49);
    expect(report).not.toHaveBeenCalled();
    doc.visibilityState = 'hidden';
    visible(0.5);
    expect(report).not.toHaveBeenCalled();
    doc.visibilityState = 'visible';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(report).not.toHaveBeenCalled();
    visible(0.5);
    expect(report).toHaveBeenCalledTimes(1);
    visible(0);
    visible(1);
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(report).toHaveBeenCalledTimes(1);
    stop();
    expect(disconnect).toHaveBeenCalled();
  });
  it('skips impressions without observation support', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const report = vi.fn();
    observePartnerImpression({} as Element, report)();
    expect(report).not.toHaveBeenCalled();
  });
});
