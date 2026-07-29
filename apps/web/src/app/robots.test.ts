import { describe, expect, it } from 'vitest';

import robots, { AI_CRAWLER_USER_AGENTS, RESTRICTED_WEB_PATHS } from './robots';

const EXPECTED_AI_CRAWLERS = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
];

describe('robots policy', () => {
  it('publishes the reviewed crawler token set', () => {
    expect([...AI_CRAWLER_USER_AGENTS]).toEqual(EXPECTED_AI_CRAWLERS);
  });

  it('repeats restricted paths for wildcard and explicit groups', () => {
    const output = robots();
    const rules = Array.isArray(output.rules) ? output.rules : [output.rules];

    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      expect(rule.allow).toBe('/');
      expect(rule.disallow).toEqual([...RESTRICTED_WEB_PATHS]);
    }
    expect(output.sitemap).toBe('https://creepjs.org/sitemap.xml');
  });
});
