'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  collectorTabs,
  type CollectorTabKey,
} from '@creepjs/core';

export interface SharedCheckerSnapshot {
  fingerprintId: string;
  coverage: number | null;
  baselineCount: number | null;
}

export interface CheckerUrlState {
  tab: CollectorTabKey;
  snapshot: SharedCheckerSnapshot | null;
}

const TAB_KEYS = new Set<CollectorTabKey>(
  collectorTabs.map((tab) => tab.key)
);
const FINGERPRINT_ID_PATTERN = /^[0-9A-Za-z_-]{1,128}$/;

function finiteNumber(value: string | null, min: number, max: number) {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

function finiteInteger(value: string | null, min: number, max: number) {
  const parsed = finiteNumber(value, min, max);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

export function parseCheckerUrl(search: string): CheckerUrlState {
  const params = new URLSearchParams(search);
  const requestedTab = params.get('tab') as CollectorTabKey | null;
  const tab =
    requestedTab && TAB_KEYS.has(requestedTab) ? requestedTab : 'all';
  const fingerprintId = params.get('fp')?.trim() ?? '';

  return {
    tab,
    snapshot: FINGERPRINT_ID_PATTERN.test(fingerprintId)
      ? {
          fingerprintId,
          coverage: finiteNumber(params.get('cov'), 0, 100),
          baselineCount: finiteInteger(params.get('b'), 0, 1_000_000_000),
        }
      : null,
  };
}

export function setCheckerTab(search: string, tab: CollectorTabKey) {
  const params = new URLSearchParams(search);
  if (tab === 'all') {
    params.delete('tab');
  } else {
    params.set('tab', tab);
  }
  const next = params.toString();
  return next ? `?${next}` : '';
}

export function setCheckerSnapshot(
  search: string,
  snapshot: SharedCheckerSnapshot
) {
  const params = new URLSearchParams(search);
  params.set('fp', snapshot.fingerprintId);
  if (snapshot.coverage === null) {
    params.delete('cov');
  } else {
    params.set('cov', snapshot.coverage.toFixed(1));
  }
  if (snapshot.baselineCount === null) {
    params.delete('b');
  } else {
    params.set('b', String(Math.trunc(snapshot.baselineCount)));
  }
  return `?${params.toString()}`;
}

const EMPTY_STATE: CheckerUrlState = {
  tab: 'all',
  snapshot: null,
};

export function useCheckerUrlState() {
  const [state, setState] = useState<CheckerUrlState>(EMPTY_STATE);

  useEffect(() => {
    const readLocation = () => setState(parseCheckerUrl(window.location.search));
    readLocation();
    window.addEventListener('popstate', readLocation);
    return () => window.removeEventListener('popstate', readLocation);
  }, []);

  const setTab = useCallback((tab: CollectorTabKey) => {
    const search = setCheckerTab(window.location.search, tab);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search}${window.location.hash}`
    );
    setState(parseCheckerUrl(search));
  }, []);

  const buildSnapshotUrl = useCallback((snapshot: SharedCheckerSnapshot) => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.search = setCheckerSnapshot(url.search, snapshot);
    return url.toString();
  }, []);

  return {
    ...state,
    setTab,
    buildSnapshotUrl,
  };
}
