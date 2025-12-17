import type { ScreenFrameFingerprint } from '../types';

const SCREEN_FRAME_CHECK_INTERVAL = 2500;

const parseDimension = (value: unknown): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : (value as number);
  return typeof numeric === 'number' && Number.isFinite(numeric)
    ? numeric
    : null;
};

let screenFrameBackup: ScreenFrameFingerprint | undefined;
let screenFrameWatchId: ReturnType<typeof setTimeout> | undefined;

const isZeroFrame = (frame: ScreenFrameFingerprint): boolean => {
  return [frame.top, frame.right, frame.bottom, frame.left].every(
    (edge) => !edge
  );
};

const readFrame = (): ScreenFrameFingerprint => {
  const screen = window.screen as Screen & {
    availTop?: number;
    availLeft?: number;
  };

  const top = parseDimension(screen.availTop ?? 0);
  const left = parseDimension(screen.availLeft ?? 0);
  const width = parseDimension(screen.width);
  const height = parseDimension(screen.height);
  const availWidth = parseDimension(screen.availWidth);
  const availHeight = parseDimension(screen.availHeight);

  const right =
    width !== null && availWidth !== null && left !== null
      ? width - availWidth - left
      : null;
  const bottom =
    height !== null && availHeight !== null && top !== null
      ? height - availHeight - top
      : null;

  return {
    top,
    right,
    bottom,
    left,
  };
};

const watchScreenFrame = () => {
  if (screenFrameWatchId !== undefined) {
    return;
  }

  const poll = () => {
    const frame = readFrame();
    if (isZeroFrame(frame)) {
      screenFrameWatchId = setTimeout(poll, SCREEN_FRAME_CHECK_INTERVAL);
      return;
    }
    screenFrameBackup = frame;
    screenFrameWatchId = undefined;
  };

  poll();
};

/**
 * Measures the screen frame (visual viewport margins) and attempts to cache
 * a non-zero reading for environments that temporarily zero these values.
 */
export async function collectScreenFrameFingerprint(): Promise<
  ScreenFrameFingerprint | undefined
> {
  if (typeof window === 'undefined' || typeof window.screen === 'undefined') {
    return undefined;
  }

  watchScreenFrame();

  let frame = readFrame();

  if (isZeroFrame(frame)) {
    if (screenFrameBackup) {
      return { ...screenFrameBackup };
    }

    if (
      typeof document !== 'undefined' &&
      document.fullscreenElement &&
      document.exitFullscreen
    ) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        void error;
      }
      frame = readFrame();
    }
  }

  if (!isZeroFrame(frame)) {
    screenFrameBackup = frame;
  }

  return frame;
}
