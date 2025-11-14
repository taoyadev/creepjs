# Design: add-developer-tools

## Context

CreepJS.org currently lacks developer-friendly tools for API integration, requiring developers to manually read documentation and craft API requests. This change adds interactive documentation, code generation, testing collections, and a CLI tool to streamline the integration process.

## Goals / Non-Goals

### Goals

1. Reduce integration time from 2+ hours to <15 minutes
2. Support top 5 JavaScript frameworks (React, Vue, Angular, Svelte, Vanilla)
3. Provide working code examples that can be copy-pasted
4. Enable local testing without production deployment

### Non-Goals

- Mobile SDKs (Swift, Kotlin)
- GraphQL API
- Custom language support beyond JavaScript/TypeScript

## Decisions

### 1. OpenAPI 3.0 vs Swagger 2.0

**Decision**: Use OpenAPI 3.0 specification.

**Rationale**:

- OpenAPI 3.0 is current standard (Swagger 2.0 deprecated)
- Better schema support (oneOf, anyOf, nullable)
- Official tooling support (Swagger UI, Postman)
- Auto-generation from Zod schemas via `zod-to-openapi`

### 2. Code Generation: Template-Based vs AST Manipulation

**Decision**: Use template-based code generation with variable substitution.

**Rationale**:

- Simpler implementation (string templates)
- Easier to maintain and debug
- Sufficient for SDK wrapper code
- AST manipulation overkill for this use case

**Template structure**:

```typescript
const templates = {
  react: `
import { useEffect, useState } from 'react';
import { getFingerprint } from '@creepjs/sdk';

export function useFingerprintAPI(options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFingerprint({
      token: '{{TOKEN}}',
      endpoint: '{{ENDPOINT}}',
      ...options
    })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
  `,
  // ... other frameworks
};
```

### 3. CLI Runtime: Node.js vs Deno/Bun

**Decision**: Use Node.js with jsdom for browser API mocking.

**Rationale**:

- Node.js has widest adoption (developers already have it installed)
- `jsdom` provides good enough browser API mocking for most collectors
- Deno/Bun not yet mainstream
- Some collectors (Canvas, WebGL) won't work perfectly—document limitations

**CLI architecture**:

```
creepjs check
  ↓
CLI (Node.js + Commander)
  ↓
@creepjs/sdk (browser APIs)
  ↓
jsdom (mocks window, navigator, etc.)
  ↓
Collectors run (Canvas/WebGL partially functional)
  ↓
Results formatted with cli-table3 + chalk
  ↓
Output to terminal
```

### 4. Postman Collection: Manual vs Auto-Generated

**Decision**: Auto-generate from OpenAPI spec using `openapi-to-postmanv2`.

**Rationale**:

- Keeps collection in sync with API changes
- No manual maintenance burden
- Can regenerate on every release
- OpenAPI spec is source of truth

## Risks / Trade-offs

### Risk: OpenAPI Spec Drift from Implementation

**Mitigation**: Auto-generate from Zod schemas used in API validation

### Risk: Generated Code Doesn't Work in All Frameworks

**Mitigation**: Automated tests for each framework template

### Risk: CLI Limited by Node.js Environment

**Mitigation**: Document which collectors work in Node.js vs browser-only

### Trade-off: Template-Based Generation Less Flexible

**Benefit**: Simpler to maintain
**Cost**: Hard to customize generated code structure
**Decision**: Accept for MVP; add customization later if needed
