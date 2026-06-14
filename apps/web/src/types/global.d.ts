export {};

declare global {
  interface Window {
    /**
     * Cloudflare Web Analytics beacon function injected by
     * https://static.cloudflareinsights.com/beacon.min.js
     */
    __cfBeacon?: {
      (
        method: 'track',
        eventName: string,
        properties?: Record<string, unknown>
      ): void;
      (method: 'trackPageview', data: { url: string }): void;
    };
  }
}
