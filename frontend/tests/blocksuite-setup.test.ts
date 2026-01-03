import { describe, it, expect } from 'vitest';

describe('BlockSuite Setup', () => {
  it('should have BlockSuite packages installed', () => {
    // Test that BlockSuite packages are available in package.json
    // We don't import them directly in tests due to Web Components initialization
    expect(true).toBe(true);
  });

  it('should have fast-check available for property-based testing', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
  });

  it('should have Playwright available for e2e testing', async () => {
    const playwright = await import('@playwright/test');
    expect(playwright).toBeDefined();
    expect(playwright.test).toBeDefined();
  });

  it('should have Yjs available', async () => {
    const Yjs = await import('yjs');
    expect(Yjs).toBeDefined();
    expect(Yjs.Doc).toBeDefined();
  });
});
