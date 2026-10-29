/** Observe real visibility; no observer support means no inferred impression. */
export function observePartnerImpression(node: Element, report: () => void) {
  if (typeof IntersectionObserver === 'undefined') return () => undefined;
  let halfVisible = false;
  let reported = false;
  const notify = () => {
    if (reported || !halfVisible || document.visibilityState !== 'visible')
      return;
    reported = true;
    observer.disconnect();
    report();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === node)
          halfVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      }
      notify();
    },
    { threshold: [0, 0.5] }
  );
  observer.observe(node);
  const onVisibilityChange = () => {
    // Obtain a fresh intersection after a background tab may have scrolled.
    halfVisible = false;
    if (!reported && document.visibilityState === 'visible') {
      observer.unobserve(node);
      observer.observe(node);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
