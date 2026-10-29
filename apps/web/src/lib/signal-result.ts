export type SignalState = 'success' | 'empty' | 'no-result' | 'partial';

export function signalState(value: unknown, type?: string): SignalState {
  if (type === 'date-time-locale' && typeof value === 'number' && value < 0)
    return 'no-result';
  if (value == null || value === '') return 'no-result';
  if (Array.isArray(value)) return value.length ? 'success' : 'empty';
  if (typeof value !== 'object') return 'success';
  const record = value as Record<string, unknown>;
  if (record.supported === false || Object.keys(record).length === 0) {
    return 'no-result';
  }
  const hasErrors = Array.isArray(record.errors)
    ? record.errors.length > 0
    : Boolean(record.errors);
  if (record.error || hasErrors || record.partial === true) return 'partial';
  return 'success';
}

/** Keep image payloads out of rendered, compared, and copied diagnostics. */
export function signalJson(value: unknown): string {
  return JSON.stringify(
    value ?? null,
    (key, item: unknown) =>
      /dataurl/i.test(key) ||
      (typeof item === 'string' && item.startsWith('data:image/'))
        ? '[image payload omitted]'
        : item,
    2
  );
}

export function signalFields(value: unknown): Array<[string, string]> {
  if (value == null) return [];
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return [['Value', String(value)]];
  if (typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !/dataurl/i.test(key))
    .map(([key, item]) => {
      const label = key.replace(/([a-z])([A-Z])/g, '$1 $2');
      if (item == null) return [label, 'Not returned'];
      if (Array.isArray(item)) return [label, `${item.length} items`];
      if (typeof item === 'object') {
        return [label, `${Object.keys(item).length} fields · inspect JSON`];
      }
      if (typeof item === 'boolean') return [label, item ? 'Yes' : 'No'];
      return [
        label,
        typeof item === 'string' || typeof item === 'number'
          ? String(item)
          : 'Not returned',
      ];
    });
}

export function changedSignalFields(before: string, after: string): string[] {
  const a: unknown = JSON.parse(before);
  const b: unknown = JSON.parse(after);
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    return [...new Set([...Object.keys(left), ...Object.keys(right)])].filter(
      (key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])
    );
  }
  return before === after ? [] : ['value'];
}
