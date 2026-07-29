export const IP_BATCH_MAX_ENTRIES = 50;
export const IP_BATCH_MAX_ITEM_LENGTH = 45;

export interface IpBatchData {
  ip: string;
  location?: {
    country_code?: string;
    region?: string;
    city?: string;
  };
  network?: {
    asn?: string;
    org?: string;
    owner?: string;
  };
  score?: {
    risk_score?: number;
    band?: string;
    verdict?: string;
  };
}

export interface IpBatchSuccessRow {
  ip: string;
  ok: true;
  outcome: 'success';
  data: IpBatchData;
  cached: boolean;
  highRisk: boolean;
}

export interface IpBatchFailureRow {
  ip: string;
  ok: false;
  outcome: 'invalid' | 'failed' | 'skipped';
  error: string;
  status?: number;
}

export type IpBatchRow = IpBatchSuccessRow | IpBatchFailureRow;

export interface IpBatchResponse {
  count: number;
  submittedCount: number;
  uniqueCount: number;
  validCount: number;
  successCount: number;
  invalidCount: number;
  failedCount: number;
  skippedCount: number;
  cachedCount: number;
  highRiskCount: number;
  quotaCost: number;
  aborted: boolean;
  abortedReason?: string;
  retryAfter?: number;
  results: IpBatchRow[];
}

export interface ParsedIpBatchInput {
  entries: string[];
  uniqueCount: number;
  duplicateCount: number;
  oversizedEntries: string[];
}

/** Split on commas or whitespace only; IPv6 colons always remain intact. */
export function parseIpBatchInput(input: string): ParsedIpBatchInput {
  const entries = input
    .split(/[,\s]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const uniqueCount = new Set(entries).size;
  return {
    entries,
    uniqueCount,
    duplicateCount: entries.length - uniqueCount,
    oversizedEntries: entries.filter(
      (entry) => entry.length > IP_BATCH_MAX_ITEM_LENGTH
    ),
  };
}

export function validateIpBatchInput(
  parsed: ParsedIpBatchInput,
  hasToken: boolean
): string[] {
  const errors: string[] = [];
  if (!hasToken) errors.push('Enter an API token.');
  if (parsed.entries.length === 0) {
    errors.push('Enter at least one IPv4 or IPv6 address.');
  }
  if (parsed.entries.length > IP_BATCH_MAX_ENTRIES) {
    errors.push(`Enter at most ${IP_BATCH_MAX_ENTRIES} addresses per batch.`);
  }
  if (parsed.oversizedEntries.length > 0) {
    errors.push(
      `Each address must be ${IP_BATCH_MAX_ITEM_LENGTH} characters or fewer.`
    );
  }
  return errors;
}

const CSV_COLUMNS = [
  'ip',
  'status',
  'http_status',
  'cached',
  'high_risk',
  'risk_score',
  'risk_band',
  'verdict',
  'country_code',
  'region',
  'city',
  'asn',
  'organization',
  'error',
] as const;

type CsvValue = string | number | boolean | null | undefined;

function neutralizeFormula(value: string): string {
  return /^[=+\-@]/u.test(value) ? `'${value}` : value;
}

function csvCell(value: CsvValue): string {
  const text =
    value === null || value === undefined
      ? ''
      : neutralizeFormula(String(value));
  return `"${text.replace(/"/gu, '""')}"`;
}

function rowValues(row: IpBatchRow): CsvValue[] {
  if (!row.ok) {
    return [
      row.ip,
      row.outcome,
      row.status,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      row.error,
    ];
  }

  return [
    row.ip,
    row.outcome,
    200,
    row.cached,
    row.highRisk,
    row.data.score?.risk_score,
    row.data.score?.band,
    row.data.score?.verdict,
    row.data.location?.country_code,
    row.data.location?.region,
    row.data.location?.city,
    row.data.network?.asn,
    row.data.network?.org ?? row.data.network?.owner,
    '',
  ];
}

/** Fixed-column RFC 4180 CSV. Every cell is quoted and formula-neutralized. */
export function buildIpBatchCsv(response: IpBatchResponse): string {
  const lines = [
    CSV_COLUMNS.map(csvCell).join(','),
    ...response.results.map((row) => rowValues(row).map(csvCell).join(',')),
  ];
  return `${lines.join('\r\n')}\r\n`;
}
