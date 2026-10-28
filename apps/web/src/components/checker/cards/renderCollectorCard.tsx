import {
  collectorManifest,
  collectorTabs,
  type CollectorTabKey,
  type FingerprintResult,
} from '@creepjs/core';
import type { ReactNode } from 'react';
import type { BaselineResponse } from '@/lib/uniqueness-baseline';
import { renderAccessibilityCollectorCard } from './AccessibilityCards';
import { renderGraphicsCollectorCard } from './GraphicsCards';
import { renderMediaCollectorCard } from './MediaCards';
import { renderNetworkCollectorCard } from './NetworkCards';
import { renderSecurityCollectorCard } from './SecurityCards';
import { renderSystemCollectorCard } from './SystemCards';

export type CardTabKey = Exclude<CollectorTabKey, 'all'>;

export const renderCollectorCard: Record<
  CardTabKey,
  (
    key: string,
    fingerprint: FingerprintResult,
    baseline: BaselineResponse | null
  ) => ReactNode
> = {
  graphics: renderGraphicsCollectorCard,
  system: renderSystemCollectorCard,
  media: renderMediaCollectorCard,
  network: renderNetworkCollectorCard,
  security: renderSecurityCollectorCard,
  accessibility: renderAccessibilityCollectorCard,
};

const cardTabKeys = Object.keys(renderCollectorCard) as CardTabKey[];

// Each collector renders from its own tab's card module; "All" lists every
// such collector in manifest order instead of keeping a second copy.
export const tabCollectors = Object.fromEntries(
  collectorTabs.map(({ key: tabKey }) => [
    tabKey,
    collectorManifest.flatMap(({ key, tabs = [] }) => {
      const tab = tabs.find((entry): entry is CardTabKey =>
        cardTabKeys.includes(entry as CardTabKey)
      );
      return tab && (tabKey === 'all' || tabs.includes(tabKey))
        ? [{ key, tab }]
        : [];
    }),
  ])
) as Record<CollectorTabKey, Array<{ key: string; tab: CardTabKey }>>;
