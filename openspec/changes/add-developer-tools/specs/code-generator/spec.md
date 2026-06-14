## ADDED Requirements

### Requirement: Multi-Framework Code Generation

The web app MUST provide a code generator that produces working integration code for React, Vue 3, Angular, Svelte, and Vanilla JavaScript/TypeScript with customizable configuration options.

#### Scenario: React code generation

- **GIVEN** a developer selects React framework and enters token/endpoint
- **WHEN** they click "Generate Code"
- **THEN** the generator produces a `useFingerprintAPI` hook with TypeScript types, loading/error states, and copy-to-clipboard functionality.

#### Scenario: Vue 3 code generation

- **GIVEN** a developer selects Vue 3 framework
- **WHEN** code is generated
- **THEN** it includes a composable function `useFingerprintAPI()` with reactive refs, TypeScript support, and proper cleanup in `onUnmounted()`.

#### Scenario: Configuration customization

- **GIVEN** a developer adjusts cache TTL to 7200 seconds
- **WHEN** code is generated
- **THEN** the generated code includes `cacheTtl: 7200` in the SDK options, and all framework templates respect this configuration.
