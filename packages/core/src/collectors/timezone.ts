import type { TimezoneFingerprint } from '../types';

/**
 * Collect Timezone and Intl API fingerprint with comprehensive testing
 */
export function collectTimezoneFingerprint(): TimezoneFingerprint | undefined {
  if (typeof Intl === 'undefined') return undefined;

  try {
    const date = new Date('2023-07-04T12:00:00Z');
    const dtf = Intl.DateTimeFormat();
    const options = dtf.resolvedOptions();

    const result: TimezoneFingerprint = {
      timezone: options.timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      locale: options.locale,
      calendar: options.calendar,
      numberingSystem: options.numberingSystem,
      locales: options as unknown as Record<string, unknown>,
      currency: Intl.NumberFormat().resolvedOptions().currency,
    };

    // DateTimeFormat testing
    try {
      const dateFormats: Record<string, string> = {};
      dateFormats.short = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
      }).format(date);
      dateFormats.medium = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(date);
      dateFormats.long = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'long',
      }).format(date);
      dateFormats.full = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
      }).format(date);
      dateFormats.timeShort = new Intl.DateTimeFormat(undefined, {
        timeStyle: 'short',
      }).format(date);
      dateFormats.timeMedium = new Intl.DateTimeFormat(undefined, {
        timeStyle: 'medium',
      }).format(date);

      result.dateTimeFormat = {
        formats: dateFormats,
        hourCycle: new Intl.DateTimeFormat(undefined, {
          hour: 'numeric',
        }).resolvedOptions().hourCycle,
        timeZoneName: new Intl.DateTimeFormat(undefined, {
          timeZoneName: 'long',
        }).resolvedOptions().timeZoneName,
      };
    } catch (_error) {
      void _error;
      // DateTimeFormat not fully supported
    }

    // NumberFormat testing
    try {
      const numberFormats: Record<string, string> = {};
      const testNumber = 123456.789;
      numberFormats.decimal = new Intl.NumberFormat().format(testNumber);
      numberFormats.currency = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
      }).format(testNumber);
      numberFormats.percent = new Intl.NumberFormat(undefined, {
        style: 'percent',
      }).format(0.789);
      numberFormats.scientific = new Intl.NumberFormat(undefined, {
        notation: 'scientific',
      }).format(testNumber);
      numberFormats.compact = new Intl.NumberFormat(undefined, {
        notation: 'compact',
      }).format(testNumber);

      result.numberFormat = {
        formats: numberFormats,
        notation: new Intl.NumberFormat(undefined, {
          notation: 'standard',
        }).resolvedOptions().notation,
        signDisplay: new Intl.NumberFormat(undefined, {
          signDisplay: 'auto',
        }).resolvedOptions().signDisplay,
      };
    } catch (_error) {
      void _error;
      // NumberFormat not fully supported
    }

    // Collator testing
    try {
      const collator = new Intl.Collator();
      const collatorOptions = collator.resolvedOptions();
      const comparisons: Record<string, number> = {};
      comparisons.a_vs_b = collator.compare('a', 'b');
      comparisons.a_vs_A = collator.compare('a', 'A');
      comparisons['1_vs_2'] = collator.compare('1', '2');
      comparisons['ä_vs_z'] = collator.compare('ä', 'z');

      result.collator = {
        sensitivity: collatorOptions.sensitivity,
        caseFirst: collatorOptions.caseFirst,
        numeric: collatorOptions.numeric,
        comparisons,
      };
    } catch (_error) {
      void _error;
      // Collator not supported
    }

    // PluralRules testing
    try {
      if (typeof Intl.PluralRules !== 'undefined') {
        const cardinalRules: Record<string, string> = {};
        const ordinalRules: Record<string, string> = {};
        const cardinal = new Intl.PluralRules(undefined, { type: 'cardinal' });
        const ordinal = new Intl.PluralRules(undefined, { type: 'ordinal' });

        [0, 1, 2, 3, 5, 10, 21, 100].forEach((n) => {
          cardinalRules[`n${n}`] = cardinal.select(n);
          ordinalRules[`n${n}`] = ordinal.select(n);
        });

        result.pluralRules = {
          cardinalRules,
          ordinalRules,
        };
      }
    } catch (_error) {
      void _error;
      // PluralRules not supported
    }

    // DisplayNames testing
    try {
      if (typeof Intl.DisplayNames !== 'undefined') {
        const languages: Record<string, string> = {};
        const regions: Record<string, string> = {};
        const currencies: Record<string, string> = {};

        const langDisplay = new Intl.DisplayNames(undefined, {
          type: 'language',
        });
        ['en', 'es', 'fr', 'de', 'zh', 'ja'].forEach((code) => {
          try {
            languages[code] = langDisplay.of(code) || '';
          } catch (_error) {
            void _error;
            // Skip invalid code
          }
        });

        const regionDisplay = new Intl.DisplayNames(undefined, {
          type: 'region',
        });
        ['US', 'GB', 'CN', 'JP', 'DE', 'FR'].forEach((code) => {
          try {
            regions[code] = regionDisplay.of(code) || '';
          } catch (_error) {
            void _error;
            // Skip invalid code
          }
        });

        const currencyDisplay = new Intl.DisplayNames(undefined, {
          type: 'currency',
        });
        ['USD', 'EUR', 'GBP', 'JPY', 'CNY'].forEach((code) => {
          try {
            currencies[code] = currencyDisplay.of(code) || '';
          } catch (_error) {
            void _error;
            // Skip invalid code
          }
        });

        result.displayNames = {
          languages,
          regions,
          currencies,
        };
      }
    } catch (_error) {
      void _error;
      // DisplayNames not supported
    }

    // ListFormat testing
    try {
      if (typeof Intl.ListFormat !== 'undefined') {
        const formats: Record<string, string> = {};
        const items = ['Apple', 'Banana', 'Orange'];

        formats.conjunction = new Intl.ListFormat(undefined, {
          style: 'long',
          type: 'conjunction',
        }).format(items);
        formats.disjunction = new Intl.ListFormat(undefined, {
          style: 'long',
          type: 'disjunction',
        }).format(items);
        formats.unit = new Intl.ListFormat(undefined, {
          style: 'long',
          type: 'unit',
        }).format(items);

        result.listFormat = {
          formats,
        };
      }
    } catch (_error) {
      void _error;
      // ListFormat not supported
    }

    // RelativeTimeFormat testing
    try {
      if (typeof Intl.RelativeTimeFormat !== 'undefined') {
        const formats: Record<string, string> = {};
        const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

        formats.yesterday = rtf.format(-1, 'day');
        formats.today = rtf.format(0, 'day');
        formats.tomorrow = rtf.format(1, 'day');
        formats.lastWeek = rtf.format(-1, 'week');
        formats.nextWeek = rtf.format(1, 'week');
        formats.lastMonth = rtf.format(-1, 'month');
        formats.nextYear = rtf.format(1, 'year');

        result.relativeTimeFormat = {
          formats,
        };
      }
    } catch (_error) {
      void _error;
      // RelativeTimeFormat not supported
    }

    // Supported locales count
    try {
      const testLocales = ['en-US', 'zh-CN', 'ja-JP', 'de-DE', 'fr-FR'];
      result.supportedLocales = {
        dateTimeFormat:
          Intl.DateTimeFormat.supportedLocalesOf(testLocales).length,
        numberFormat: Intl.NumberFormat.supportedLocalesOf(testLocales).length,
        collator: Intl.Collator.supportedLocalesOf(testLocales).length,
        pluralRules:
          typeof Intl.PluralRules !== 'undefined'
            ? Intl.PluralRules.supportedLocalesOf(testLocales).length
            : 0,
      };
    } catch (_error) {
      void _error;
      // supportedLocalesOf not available
    }

    return result;
  } catch (error) {
    console.error('Timezone fingerprinting error:', error);
    return undefined;
  }
}
