import { describe, expect, it } from 'vitest';
import {
  changedSignalFields,
  signalFields,
  signalJson,
  signalState,
} from './signal-result';

describe('signal result interpretation', () => {
  it('keeps false and zero distinct from absent or unsupported results', () => {
    expect(signalState(false)).toBe('success');
    expect(signalState(0)).toBe('success');
    expect(signalFields(false)).toEqual([['Value', 'false']]);
    expect(signalFields(0)).toEqual([['Value', '0']]);
    expect(signalState(undefined)).toBe('no-result');
    expect(signalState({ supported: false, hash: 'unsupported' })).toBe(
      'no-result'
    );
    expect(signalState(-1, 'date-time-locale')).toBe('no-result');
    expect(signalState(-1, 'architecture')).toBe('success');
  });
  it('separates an empty list from an errored or partial observation', () => {
    expect(signalState([])).toBe('empty');
    expect(signalState({ values: [1], error: 'blocked field' })).toBe(
      'partial'
    );
    expect(signalState({ values: [1], errors: [] })).toBe('success');
  });
  it('omits image payloads from nested JSON and readable fields', () => {
    const value = {
      hash: 'signature',
      dataURL: 'data:image/png;example',
      nested: { screenshot: 'data:image/png;example' },
    };
    expect(signalJson(value)).not.toContain('data:image');
    expect(signalFields(value).map(([name]) => name)).toEqual([
      'hash',
      'nested',
    ]);
    expect(JSON.parse(signalJson(value)) as unknown).toMatchObject({
      hash: 'signature',
    });
  });
  it('compares added, missing, false, and nested fields without comparing timing', () => {
    expect(
      changedSignalFields(
        '{"supported":true,"values":[1],"old":0}',
        '{"supported":false,"values":[2],"new":0}'
      )
    ).toEqual(['supported', 'values', 'old', 'new']);
    expect(changedSignalFields('false', 'false')).toEqual([]);
    expect(changedSignalFields('false', '0')).toEqual(['value']);
  });
});
