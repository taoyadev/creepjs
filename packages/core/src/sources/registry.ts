import type { SourceRegistry } from './types';
import { collectCanvasFingerprint } from '../collectors/canvas';
import { collectWebGLFingerprint } from '../collectors/webgl';
import { collectNavigatorFingerprint } from '../collectors/navigator';
import { collectScreenFingerprint } from '../collectors/screen';
import { collectFontsFingerprint } from '../collectors/fonts';
import { collectTimezoneFingerprint } from '../collectors/timezone';
import { collectAudioFingerprint } from '../collectors/audio';
import { collectMediaDevicesFingerprint } from '../collectors/media';
import { collectClientRectsFingerprint } from '../collectors/clientRects';
import { collectVoicesFingerprint } from '../collectors/voices';
import { collectSVGFingerprint } from '../collectors/svg';
import { collectMathFingerprint } from '../collectors/math';
import { collectCSSFingerprint } from '../collectors/css';
import { collectTextMetricsFingerprint } from '../collectors/textMetrics';
import { collectHTMLElementFingerprint } from '../collectors/htmlElement';
import { collectConsoleErrorsFingerprint } from '../collectors/consoleErrors';
import { collectDomRectFingerprint } from '../collectors/domRect';
import { collectMimeTypesFingerprint } from '../collectors/mimeTypes';
import { collectResistanceFingerprint } from '../collectors/resistance';
import { collectContentWindowFingerprint } from '../collectors/contentWindow';
import { collectCSSMediaFingerprint } from '../collectors/cssMedia';
import { collectWebRTCFingerprint } from '../collectors/webrtc';
import { collectServiceWorkerFingerprint } from '../collectors/serviceWorker';
import { collectDomBlockersFingerprint } from '../collectors/domBlockers';
import { collectFontPreferencesFingerprint } from '../collectors/fontPreferences';
import { collectColorGamutFingerprint } from '../collectors/colorGamut';
import { collectContrastPreference } from '../collectors/contrast';
import { collectForcedColorsFingerprint } from '../collectors/forcedColors';
import { collectMonochromeDepth } from '../collectors/monochrome';
import { collectReducedMotionPreference } from '../collectors/reducedMotion';
import { collectReducedTransparencyPreference } from '../collectors/reducedTransparency';
import { collectHDRStatus } from '../collectors/hdr';
import { collectAudioBaseLatencyFingerprint } from '../collectors/audioBaseLatency';
import { collectApplePayFingerprint } from '../collectors/applePay';

export const defaultSources: SourceRegistry = {
  canvas: () => collectCanvasFingerprint(),
  webgl: () => collectWebGLFingerprint(),
  navigator: () => collectNavigatorFingerprint(),
  screen: () => collectScreenFingerprint(),
  fonts: () => collectFontsFingerprint(),
  timezone: () => collectTimezoneFingerprint(),
  audio: () => collectAudioFingerprint(),
  media: () => collectMediaDevicesFingerprint(),
  clientRects: () => collectClientRectsFingerprint(),
  voices: () => collectVoicesFingerprint(),
  svg: () => collectSVGFingerprint(),
  math: () => collectMathFingerprint(),
  css: () => collectCSSFingerprint(),
  textMetrics: () => collectTextMetricsFingerprint(),
  htmlElement: () => collectHTMLElementFingerprint(),
  consoleErrors: () => collectConsoleErrorsFingerprint(),
  domRect: () => collectDomRectFingerprint(),
  mimeTypes: () => collectMimeTypesFingerprint(),
  resistance: () => collectResistanceFingerprint(),
  contentWindow: () => collectContentWindowFingerprint(),
  cssMedia: () => collectCSSMediaFingerprint(),
  webrtc: () => collectWebRTCFingerprint(),
  serviceWorker: () => collectServiceWorkerFingerprint(),
  domBlockers: () => collectDomBlockersFingerprint(),
  fontPreferences: () => collectFontPreferencesFingerprint(),
  colorGamut: () => collectColorGamutFingerprint(),
  contrast: () => collectContrastPreference(),
  forcedColors: () => collectForcedColorsFingerprint(),
  monochrome: () => collectMonochromeDepth(),
  reducedMotion: () => collectReducedMotionPreference(),
  reducedTransparency: () => collectReducedTransparencyPreference(),
  hdr: () => collectHDRStatus(),
  audioBaseLatency: () => collectAudioBaseLatencyFingerprint(),
  applePay: () => collectApplePayFingerprint(),
};
