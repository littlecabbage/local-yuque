# BlockSuite Integration Setup

This document describes the BlockSuite integration setup completed for the Yueque local knowledge base application.

## Installed Dependencies

### Production Dependencies
- `@blocksuite/presets@^0.19.5` - BlockSuite editor presets
- `@blocksuite/blocks@^0.19.5` - BlockSuite block components
- `@blocksuite/store@^0.22.4` - BlockSuite data store (Yjs-based)
- `yjs@^13.6.29` - CRDT library for collaborative editing

### Development Dependencies
- `vitest@^4.0.16` - Unit testing framework
- `@vitest/ui@^4.0.16` - Vitest UI for interactive testing
- `fast-check@^4.5.3` - Property-based testing library
- `@playwright/test@^1.57.0` - End-to-end testing framework
- `jsdom@^27.4.0` - DOM implementation for testing
- `@testing-library/react@^16.3.1` - React testing utilities
- `@testing-library/jest-dom@^6.9.1` - Custom Jest matchers

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)
- Added `vite/client` to types for Vite support
- Configured for Web Components support through DOM types and experimentalDecorators

### Vite Configuration (`vite.config.ts`)
- Added `optimizeDeps` to pre-bundle BlockSuite packages
- Configured code splitting to separate BlockSuite and Yjs into their own chunks
- Increased chunk size warning limit to 1000KB for BlockSuite

### Vitest Configuration (`vitest.config.ts`)
- Configured jsdom environment for React component testing
- Set up test coverage with 70% thresholds
- Added test setup file for global test configuration

### Playwright Configuration (`playwright.config.ts`)
- Configured for e2e testing with Chromium, Firefox, and WebKit
- Set up dev server integration for testing
- Configured test directory at `./tests/e2e`

## Test Scripts

Added the following npm scripts:
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Directory Structure

```
frontend/
├── tests/
│   ├── setup.ts              # Vitest setup file
│   ├── e2e/                  # Playwright e2e tests
│   └── blocksuite-setup.test.ts  # Setup verification tests
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
└── tsconfig.json             # TypeScript configuration
```

## Verification

Run `npm test` to verify the setup. All tests should pass, confirming:
- BlockSuite packages are installed correctly
- fast-check is available for property-based testing
- Playwright is available for e2e testing
- Yjs is available for CRDT functionality

## Build Verification

Run `npm run build` to verify the build configuration. The output should show:
- Separate chunks for BlockSuite and Yjs
- Optimized bundle sizes
- Successful production build

## Next Steps

With the setup complete, you can now proceed to:
1. Implement the BlockSuite Workspace Manager (Task 2)
2. Create the Markdown Converter (Task 3)
3. Build the Document Manager (Task 4)
4. Integrate the BlockSuite Editor component (Task 6)
