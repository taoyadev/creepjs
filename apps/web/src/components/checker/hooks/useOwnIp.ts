'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '@/lib/api-client';
import type { OwnIpSummary } from '@/lib/own-ip';

export type OwnIpState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: OwnIpSummary }
  | { status: 'error'; data: null };

export function useOwnIp() {
  const [state, setState] = useState<OwnIpState>({
    status: 'loading',
    data: null,
  });

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setState({ status: 'loading', data: null });
    try {
      const data = await fetchJson<OwnIpSummary>('/my-ip', {
        signal,
        timeoutMs: 8000,
      });
      setState({ status: 'ready', data });
    } catch (error) {
      if (signal?.aborted) return;
      console.warn('Checker own-IP context unavailable:', error);
      setState({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return {
    ...state,
    refresh: () => refresh(),
  };
}
