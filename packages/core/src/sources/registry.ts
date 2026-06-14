import type { SourceRegistry } from './types';
import { collectCanvasFingerprint } from '../collectors/canvas';
import { collectWebGLFingerprint } from '../collectors/webgl';
import { collectNavigatorFingerprint } from '../collectors/navigator';
import { collectScreenFingerprint } from '../collectors/screen';
import { collectScreenFrameFingerprint } from '../collectors/screenFrame';
import { collectScreenResolution } from '../collectors/screenResolution';
import { collectColorDepth } from '../collectors/colorDepth';
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
import { collectInvertedColorsPreference } from '../collectors/invertedColors';
import { collectContrastPreference } from '../collectors/contrast';
import { collectForcedColorsFingerprint } from '../collectors/forcedColors';
import { collectMonochromeDepth } from '../collectors/monochrome';
import { collectReducedMotionPreference } from '../collectors/reducedMotion';
import { collectReducedTransparencyPreference } from '../collectors/reducedTransparency';
import { collectHDRStatus } from '../collectors/hdr';
import { collectAudioBaseLatencyFingerprint } from '../collectors/audioBaseLatency';
import { collectApplePayFingerprint } from '../collectors/applePay';
import { collectDateTimeLocale } from '../collectors/dateTimeLocale';
import { collectLanguages } from '../collectors/languages';
import { collectDeviceMemory } from '../collectors/deviceMemory';
import { collectHardwareConcurrency } from '../collectors/hardwareConcurrency';
import { collectOsCpu } from '../collectors/osCpu';
import { collectCpuClass } from '../collectors/cpuClass';
import { collectPlatform } from '../collectors/platform';
import { collectVendor } from '../collectors/vendor';
import { collectVendorFlavors } from '../collectors/vendorFlavors';
import { collectPlugins } from '../collectors/plugins';
import { collectSessionStorageSupport } from '../collectors/sessionStorage';
import { collectLocalStorageSupport } from '../collectors/localStorage';
import { collectIndexedDBSupport } from '../collectors/indexedDB';
import { collectOpenDatabaseSupport } from '../collectors/openDatabase';
import { collectTouchSupport } from '../collectors/touchSupport';
import { collectCookiesEnabled } from '../collectors/cookiesEnabled';
import { collectPdfViewerEnabled } from '../collectors/pdfViewer';
import { collectArchitectureFingerprint } from '../collectors/architecture';
import { collectPrivateClickMeasurement } from '../collectors/privateClickMeasurement';

export const defaultSources: SourceRegistry = {
  canvas: () => collectCanvasFingerprint(),
  webgl: () => collectWebGLFingerprint(),
  navigator: () => collectNavigatorFingerprint(),
  screen: () => collectScreenFingerprint(),
  screenFrame: () => collectScreenFrameFingerprint(),
  screenResolution: () => collectScreenResolution(),
  colorDepth: () => collectColorDepth(),
  fonts: () => collectFontsFingerprint(),
  languages: () => collectLanguages(),
  timezone: () => collectTimezoneFingerprint(),
  dateTimeLocale: () => collectDateTimeLocale(),
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
  plugins: () => collectPlugins(),
  resistance: () => collectResistanceFingerprint(),
  contentWindow: () => collectContentWindowFingerprint(),
  cssMedia: () => collectCSSMediaFingerprint(),
  webrtc: () => collectWebRTCFingerprint(),
  serviceWorker: () => collectServiceWorkerFingerprint(),
  domBlockers: () => collectDomBlockersFingerprint(),
  fontPreferences: () => collectFontPreferencesFingerprint(),
  colorGamut: () => collectColorGamutFingerprint(),
  invertedColors: () => collectInvertedColorsPreference(),
  contrast: () => collectContrastPreference(),
  forcedColors: () => collectForcedColorsFingerprint(),
  monochrome: () => collectMonochromeDepth(),
  reducedMotion: () => collectReducedMotionPreference(),
  reducedTransparency: () => collectReducedTransparencyPreference(),
  hdr: () => collectHDRStatus(),
  audioBaseLatency: () => collectAudioBaseLatencyFingerprint(),
  applePay: () => collectApplePayFingerprint(),
  deviceMemory: () => collectDeviceMemory(),
  hardwareConcurrency: () => collectHardwareConcurrency(),
  osCpu: () => collectOsCpu(),
  cpuClass: () => collectCpuClass(),
  platform: () => collectPlatform(),
  vendor: () => collectVendor(),
  vendorFlavors: () => collectVendorFlavors(),
  sessionStorage: () => collectSessionStorageSupport(),
  localStorage: () => collectLocalStorageSupport(),
  indexedDB: () => collectIndexedDBSupport(),
  openDatabase: () => collectOpenDatabaseSupport(),
  touchSupport: () => collectTouchSupport(),
  cookiesEnabled: () => collectCookiesEnabled(),
  pdfViewerEnabled: () => collectPdfViewerEnabled(),
  architecture: () => collectArchitectureFingerprint(),
  privateClickMeasurement: () => collectPrivateClickMeasurement(),
};
