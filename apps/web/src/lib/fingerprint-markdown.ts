import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { FINGERPRINT_TECHNIQUES } from './seo-routes';

export const SIGNAL_CONTENT_START = '<!-- llms-safe:start -->';
export const SIGNAL_CONTENT_END = '<!-- llms-safe:end -->';
export const SIGNAL_CONTENT_REVIEW_DATE = '2026-10-29';

export type FingerprintTechnique = (typeof FINGERPRINT_TECHNIQUES)[number];

const REQUIRED_HEADINGS = [
  '## What CreepJS reports',
  '## How to interpret it',
  '## Limits',
  '## Test the signal',
] as const;

const UNSAFE_CONTENT_PATTERNS: ReadonlyArray<{
  label: string;
  pattern: RegExp;
}> = [
  {
    label: 'an exact percentage',
    pattern: /\b\d+(?:\.\d+)?\s*%/i,
  },
  {
    label: 'an unsupported first-person test or study claim',
    pattern:
      /\b(?:(?:we|i)\s+(?:tested|studied|analy[sz]ed|measured|found|observed|benchmarked|surveyed)|our\s+(?:tests?|research|stud(?:y|ies)|data(?:set)?|analysis|measurements?|benchmarks?))\b/i,
  },
  {
    label: 'an unsupported sample-size claim',
    pattern:
      /\b\d[\d,]*(?:\.\d+)?\+?\s+(?:users?|devices?|browsers?|websites?|samples?|fingerprints?)\b/i,
  },
  {
    label: 'an unsupported million/billion scale claim',
    pattern: /\b\d+(?:\.\d+)?\s*(?:million|billion)\b/i,
  },
  {
    label: 'an exact accuracy, entropy, uniqueness, or match-rate claim',
    pattern:
      /\b(?:accuracy|entropy|uniqueness|match[- ]?rate)\b[^\n.!?]{0,48}\b\d+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b[^\n.!?]{0,48}\b(?:accuracy|entropy|uniqueness|match[- ]?rate)\b/i,
  },
  {
    label: 'a market forecast or adoption projection',
    pattern:
      /\b(?:market\s+(?:size|share|forecast)|CAGR|compound annual growth|projected to|expected to (?:reach|grow)|adoption rate)\b/i,
  },
  {
    label: 'a ranking or citation promise',
    pattern:
      /\b(?:guarantee(?:d|s)?|ensure(?:d|s)?)\b[^\n.!?]{0,64}\b(?:rankings?|citations?|inclusion|traffic)\b|\b(?:rankings?|citations?|inclusion|traffic)\b[^\n.!?]{0,64}\b(?:guarantee(?:d|s)?|ensure(?:d|s)?)\b/i,
  },
  {
    label: 'generated-content quality theater',
    pattern:
      /\b(?:Research-Backed|E-E-A-T Compliant|Word Count|Reading Time)\b/i,
  },
];

function countOccurrences(input: string, marker: string): number {
  return input.split(marker).length - 1;
}

function signalContentRoot(): string {
  return path.join(process.cwd(), 'public', 'content', 'fingerprints');
}

function assertSafeBlockShape(
  raw: string,
  technique: FingerprintTechnique
): string {
  if (
    countOccurrences(raw, SIGNAL_CONTENT_START) !== 1 ||
    countOccurrences(raw, SIGNAL_CONTENT_END) !== 1
  ) {
    throw new Error(
      `${technique.slug}: expected exactly one vetted content block`
    );
  }

  const start = raw.indexOf(SIGNAL_CONTENT_START);
  const end = raw.indexOf(SIGNAL_CONTENT_END);
  if (start === -1 || end <= start) {
    throw new Error(`${technique.slug}: invalid vetted content block order`);
  }

  const prefix = raw.slice(0, start).trim();
  const suffix = raw.slice(end + SIGNAL_CONTENT_END.length).trim();
  if (prefix !== `# ${technique.name}` || suffix !== '') {
    throw new Error(
      `${technique.slug}: only its canonical H1 may appear outside the vetted block`
    );
  }

  return raw.slice(start + SIGNAL_CONTENT_START.length, end).trim();
}

export function validateVettedSignalMarkdown(
  raw: string,
  technique: FingerprintTechnique
): string {
  const content = assertSafeBlockShape(raw, technique);

  if (content.length < 300 || content.length > 3_000) {
    throw new Error(
      `${technique.slug}: vetted content must be 300-3000 characters`
    );
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!content.includes(heading)) {
      throw new Error(
        `${technique.slug}: missing required heading "${heading}"`
      );
    }
  }

  const expectedPage = `https://creepjs.org/fingerprint/${technique.slug}`;
  if (!content.includes(expectedPage)) {
    throw new Error(`${technique.slug}: missing canonical live signal URL`);
  }

  if (!content.includes(`Category: ${technique.category}`)) {
    throw new Error(`${technique.slug}: missing canonical signal category`);
  }

  if (!content.includes(`Reviewed: ${SIGNAL_CONTENT_REVIEW_DATE}.`)) {
    throw new Error(`${technique.slug}: missing content review date`);
  }

  for (const { label, pattern } of UNSAFE_CONTENT_PATTERNS) {
    if (pattern.test(content)) {
      throw new Error(`${technique.slug}: contains ${label}`);
    }
  }

  return content;
}

export function assertSignalMarkdownRegistryAligned(
  contentRoot = signalContentRoot()
): void {
  const expected = FINGERPRINT_TECHNIQUES.map(
    (technique) => `${technique.slug}.md`
  ).sort();
  const actual = readdirSync(contentRoot)
    .filter((file) => file.endsWith('.md'))
    .sort();

  if (
    expected.length !== actual.length ||
    expected.some((file, index) => file !== actual[index])
  ) {
    const expectedSet = new Set(expected);
    const actualSet = new Set(actual);
    const missing = expected.filter((file) => !actualSet.has(file));
    const extra = actual.filter((file) => !expectedSet.has(file));
    throw new Error(
      `Fingerprint Markdown registry mismatch (missing: ${
        missing.join(', ') || 'none'
      }; extra: ${extra.join(', ') || 'none'})`
    );
  }
}

export function readVettedSignalMarkdown(
  technique: FingerprintTechnique,
  contentRoot = signalContentRoot()
): string {
  const filePath = path.join(contentRoot, `${technique.slug}.md`);
  const raw = readFileSync(filePath, 'utf8');
  return validateVettedSignalMarkdown(raw, technique);
}

export function buildLlmsFullText(contentRoot = signalContentRoot()): string {
  assertSignalMarkdownRegistryAligned(contentRoot);

  const signals = FINGERPRINT_TECHNIQUES.map((technique) => {
    const content = readVettedSignalMarkdown(technique, contentRoot);

    return `---
Signal: ${technique.slug}
HTML: https://creepjs.org/fingerprint/${technique.slug}
Markdown: https://creepjs.org/content/fingerprints/${technique.slug}.md
---

# ${technique.name}

${content}`;
  }).join('\n\n');

  return `# CreepJS Fingerprint Signal References

CreepJS.org is a privacy diagnostic and API. These references explain the live browser signals without population estimates, identity claims, fraud probabilities, ranking promises, or fabricated first-hand research.

${signals}
`;
}
