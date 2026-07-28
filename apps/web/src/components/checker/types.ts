export interface CollectionProgress {
  current: number;
  total: number;
  currentCollector: string;
}

export type FingerprintScanStatus = 'loading' | 'ready' | 'error';
