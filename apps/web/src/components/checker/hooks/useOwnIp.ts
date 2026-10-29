'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJson } from '@/lib/api-client';
import type { OwnIpSummary } from '@/lib/own-ip';
import { isValidIpLiteral } from '@/lib/public-ip-lookup';

export type OwnIpState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: OwnIpSummary }
  | { status: 'error'; data: null };

export function useOwnIp() {
  const request = useRef<AbortController | null>(null);
  const [state, setState] = useState<OwnIpState>({
    status: 'loading',
    data: null,
  });

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const signal = controller.signal;
    setState({ status: 'loading', data: null });
    try {
      const data = await fetchJson<OwnIpSummary>('/my-ip', {
        signal,
        timeoutMs: 8000,
      });
      if (signal.aborted) return;
      if (!data || !isValidIpLiteral(data.ip))
        throw new Error('No address returned');
      setState({ status: 'ready', data });
    } catch (error) {
      if (signal.aborted) return;
      void error;
      setState({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => request.current?.abort();
  }, [refresh]);

  return {
    ...state,
    refresh: () => refresh(),
  };
}
