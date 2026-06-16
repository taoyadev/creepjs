import { collectFingerprint } from '@creepjs/core';

type GlobalWithCore = typeof globalThis & {
  __CREEPJS_CORE__?: {
    collectFingerprint: typeof collectFingerprint;
  };
};

(globalThis as GlobalWithCore).__CREEPJS_CORE__ = {
  collectFingerprint,
};

export { collectFingerprint };
