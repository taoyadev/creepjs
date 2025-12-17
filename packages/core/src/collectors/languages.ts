import type { LanguagesFingerprint } from '../types';

/**
 * Collects ordered language preferences exposed via Navigator APIs.
 */
export function collectLanguages(): LanguagesFingerprint | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const result: LanguagesFingerprint = [];
  const nav = navigator as Navigator & {
    userLanguage?: string;
    browserLanguage?: string;
    systemLanguage?: string;
  };

  const primary =
    nav.language ||
    nav.userLanguage ||
    nav.browserLanguage ||
    nav.systemLanguage;
  if (typeof primary === 'string' && primary.length > 0) {
    result.push([primary]);
  }

  const languages = nav.languages as string[] | string | undefined;
  if (Array.isArray(languages) && languages.length > 0) {
    result.push([...languages]);
  } else if (typeof languages === 'string' && languages.length > 0) {
    result.push(
      languages
        .split(',')
        .map((lang) => lang.trim())
        .filter(Boolean)
    );
  }

  return result.length > 0 ? result : undefined;
}
