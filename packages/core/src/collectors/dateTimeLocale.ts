import { DateTimeLocaleStatus, type DateTimeLocaleFingerprint } from '../types';

/**
 * Detects the resolved Intl.DateTimeFormat locale or status code when unsupported.
 */
export function collectDateTimeLocale(): DateTimeLocaleFingerprint {
  if (typeof Intl === 'undefined') {
    return DateTimeLocaleStatus.IntlAPINotSupported;
  }

  const DateTimeFormat = Intl.DateTimeFormat;
  if (typeof DateTimeFormat !== 'function') {
    return DateTimeLocaleStatus.DateTimeFormatNotSupported;
  }

  const locale = DateTimeFormat().resolvedOptions().locale;
  if (locale === undefined || locale === null) {
    return DateTimeLocaleStatus.LocaleNotAvailable;
  }

  return locale;
}
