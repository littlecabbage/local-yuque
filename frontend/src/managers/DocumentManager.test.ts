import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DocumentManager } from './DocumentManager';
import { getWorkspaceManager } from './WorkspaceManager';
import { getMarkdownConverter } from './MarkdownConverter';
import { api } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  api: {
    getFileContent: vi.fn(),
    saveFile: vi.fn(),
  },
}));

describe('DocumentManager', () => {
  let documentManager: DocumentManager;
  let workspaceManager: ReturnType<typeof getWorkspaceManager>;

  beforeEach(async () => {
    // Initialize workspace manager
    workspaceManager = getWorkspaceManager();
    if (!workspaceManager.isInitialized()) {
      await workspaceManager.initialize();
    }

    // Create new document manager instance
    documentManager = new DocumentManager();

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    documentManager.disposeCurrentDoc();
  });

  describe('loadDocument', () => {
    it('should load a document successfully', async () => {
      const docId = 'test-doc-1';
      const markdown = '# Test Document\n\nThis is a test.';

      // Mock API response
      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Load document
      await documentManager.loadDocument(docId);

      // Verify API was called
      expect(api.getFileContent).toHaveBeenCalledWith(docId);

      // Verify current doc is set
      expect(documentManager.getCurrentDocId()).toBe(docId);
      expect(documentManager.getCurrentDoc()).not.toBeNull();
      expect(documentManager.getCurrentState()).toBe('saved');
    });

    it('should handle load errors', async () => {
      const docId = 'test-doc-error';
      const error = new Error('Network error');

      // Mock API error
      vi.mocked(api.getFileContent).mockRejectedValue(error);

      // Attempt to load document
      await expect(documentManager.loadDocument(docId)).rejects.toThrow('Network error');

      // Verify state is error
      expect(documentManager.getCurrentState()).toBe('error');
    });

    it('should dispose previous document when loading new one', async () => {
      const docId1 = 'test-doc-1';
      const docId2 = 'test-doc-2';
      const markdown = '# Test';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Load first document
      await documentManager.loadDocument(docId1);
      expect(documentManager.getCurrentDocId()).toBe(docId1);

      // Load second document
      await documentManager.loadDocument(docId2);
      expect(documentManager.getCurrentDocId()).toBe(docId2);

      // Verify first doc was disposed
      expect(workspaceManager.getActiveDocCount()).toBe(1);
    });
  });

  describe('saveDocument', () => {
    it('should save a document successfully', async () => {
      const docId = 'test-doc-save';
      const markdown = '# Test Save';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document first
      await documentManager.loadDocument(docId);

      // Save document
      await documentManager.saveDocument(docId);

      // Verify API was called
      expect(api.saveFile).toHaveBeenCalledWith(docId, expect.any(String));
      expect(documentManager.getCurrentState()).toBe('saved');
    });

    it('should retry on save failure', async () => {
      const docId = 'test-doc-retry';
      const markdown = '# Test Retry';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Mock save to fail twice then succeed
      vi.mocked(api.saveFile)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      // Load document
      await documentManager.loadDocument(docId);

      // Save document (should retry and eventually succeed)
      await documentManager.saveDocument(docId);

      // Verify API was called 3 times (initial + 2 retries)
      expect(api.saveFile).toHaveBeenCalledTimes(3);
      expect(documentManager.getCurrentState()).toBe('saved');
    });

    it('should fail after max retries', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-max-retry';
      const markdown = '# Test Max Retry';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Mock save to always fail
      vi.mocked(api.saveFile).mockRejectedValue(new Error('Network error'));

      // Load document
      await documentManager.loadDocument(docId);

      // Start save operation (don't await yet)
      const savePromise = documentManager.saveDocument(docId);

      // Fast-forward through all retries
      // Initial attempt + 3 retries with delays: 1000ms, 2000ms, 4000ms
      await vi.runAllTimersAsync();

      // Wait for save to complete
      await expect(savePromise).rejects.toThrow(
        'Failed to save document after 3 retries'
      );

      // Verify API was called 4 times (initial + 3 retries)
      expect(api.saveFile).toHaveBeenCalledTimes(4);
      expect(documentManager.getCurrentState()).toBe('error');

      vi.useRealTimers();
    }, 10000);
  });

  describe('state management', () => {
    it('should notify state change callbacks', async () => {
      const docId = 'test-doc-state';
      const markdown = '# Test State';
      const stateChanges: string[] = [];

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Subscribe to state changes
      const unsubscribe = documentManager.onStateChange((state) => {
        stateChanges.push(state);
      });

      // Load document
      await documentManager.loadDocument(docId);

      // Verify state changes
      expect(stateChanges).toContain('loading');
      expect(stateChanges).toContain('saved');

      // Cleanup
      unsubscribe();
    });

    it('should track current state correctly', async () => {
      const docId = 'test-doc-state-track';
      const markdown = '# Test';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      expect(documentManager.getCurrentState()).toBe('idle');

      await documentManager.loadDocument(docId);
      expect(documentManager.getCurrentState()).toBe('saved');
    });
  });

  describe('disposeCurrentDoc', () => {
    it('should cleanup resources properly', async () => {
      const docId = 'test-doc-dispose';
      const markdown = '# Test Dispose';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Load document
      await documentManager.loadDocument(docId);
      expect(documentManager.getCurrentDocId()).toBe(docId);
      expect(workspaceManager.getActiveDocCount()).toBe(1);

      // Dispose document
      documentManager.disposeCurrentDoc();

      // Verify cleanup
      expect(documentManager.getCurrentDocId()).toBeNull();
      expect(documentManager.getCurrentDoc()).toBeNull();
      expect(workspaceManager.getActiveDocCount()).toBe(0);
    });
  });

  describe('unsaved changes', () => {
    beforeEach(() => {
      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      } as any;
    });

    it('should store unsaved changes in localStorage on save failure', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-unsaved';
      const markdown = '# Test Unsaved';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockRejectedValue(new Error('Network error'));

      // Load document
      await documentManager.loadDocument(docId);

      // Start save operation (don't await yet)
      const savePromise = documentManager.saveDocument(docId);

      // Fast-forward through all retries
      await vi.runAllTimersAsync();

      // Try to save (will fail and store in localStorage)
      await expect(savePromise).rejects.toThrow();

      // Verify unsaved changes were stored
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `unsaved_doc_${docId}`,
        expect.stringContaining(docId)
      );

      vi.useRealTimers();
    }, 10000);

    it('should clear unsaved changes', () => {
      const docId = 'test-doc-clear-unsaved';

      // Mock localStorage.getItem to return unsaved data
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({
          docId,
          content: '# Test',
          timestamp: Date.now(),
        })
      );

      // Verify it exists
      expect(documentManager.getUnsavedChanges(docId)).not.toBeNull();

      // Clear it
      documentManager.clearUnsavedChanges(docId);

      // Verify removeItem was called
      expect(localStorage.removeItem).toHaveBeenCalledWith(`unsaved_doc_${docId}`);
    });
  });

  describe('forceSave', () => {
    it('should save immediately without debounce', async () => {
      const docId = 'test-doc-force';
      const markdown = '# Test Force Save';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document
      await documentManager.loadDocument(docId);

      // Force save
      await documentManager.forceSave();

      // Verify save was called
      expect(api.saveFile).toHaveBeenCalled();
    });

    it('should throw error if no document loaded', async () => {
      await expect(documentManager.forceSave()).rejects.toThrow(
        'No document loaded'
      );
    });
  });

  describe('debounce save logic', () => {
    it('should debounce save operations', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-debounce';
      const markdown = '# Test Debounce';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document
      await documentManager.loadDocument(docId);

      // Clear previous save calls from loading
      vi.clearAllMocks();

      // Get the doc and trigger multiple changes
      const doc = documentManager.getCurrentDoc();
      expect(doc).not.toBeNull();

      // Simulate rapid changes by triggering blockUpdated event multiple times
      doc!.slots.blockUpdated.emit();
      doc!.slots.blockUpdated.emit();
      doc!.slots.blockUpdated.emit();

      // Verify save hasn't been called yet (still debouncing)
      expect(api.saveFile).not.toHaveBeenCalled();

      // Fast-forward time by 500ms (less than debounce delay)
      await vi.advanceTimersByTimeAsync(500);
      expect(api.saveFile).not.toHaveBeenCalled();

      // Fast-forward time by another 500ms (total 1000ms = debounce delay)
      await vi.advanceTimersByTimeAsync(500);

      // Wait for async operations to complete
      await vi.runAllTimersAsync();

      // Now save should have been called exactly once
      expect(api.saveFile).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should reset debounce timer on new changes', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-debounce-reset';
      const markdown = '# Test Debounce Reset';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document
      await documentManager.loadDocument(docId);
      vi.clearAllMocks();

      const doc = documentManager.getCurrentDoc();
      expect(doc).not.toBeNull();

      // Trigger first change
      doc!.slots.blockUpdated.emit();

      // Wait 800ms (not enough to trigger save)
      await vi.advanceTimersByTimeAsync(800);
      expect(api.saveFile).not.toHaveBeenCalled();

      // Trigger another change (should reset timer)
      doc!.slots.blockUpdated.emit();

      // Wait another 800ms (total 1600ms from first change, but only 800ms from second)
      await vi.advanceTimersByTimeAsync(800);
      expect(api.saveFile).not.toHaveBeenCalled();

      // Wait final 200ms (total 1000ms from second change)
      await vi.advanceTimersByTimeAsync(200);
      await vi.runAllTimersAsync();

      // Now save should be called
      expect(api.saveFile).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should clear debounce timer on document disposal', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-debounce-dispose';
      const markdown = '# Test Debounce Dispose';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document
      await documentManager.loadDocument(docId);
      vi.clearAllMocks();

      const doc = documentManager.getCurrentDoc();
      expect(doc).not.toBeNull();

      // Trigger change
      doc!.slots.blockUpdated.emit();

      // Dispose document before debounce completes
      documentManager.disposeCurrentDoc();

      // Fast-forward time past debounce delay
      await vi.advanceTimersByTimeAsync(1500);
      await vi.runAllTimersAsync();

      // Save should not have been called
      expect(api.saveFile).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('retry mechanism', () => {
    it('should use exponential backoff for retries', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-exponential-backoff';
      const markdown = '# Test Exponential Backoff';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Mock save to fail twice then succeed
      let callCount = 0;
      vi.mocked(api.saveFile).mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Network error');
        }
      });

      // Load document
      await documentManager.loadDocument(docId);

      // Start save operation (don't await yet)
      const savePromise = documentManager.saveDocument(docId);

      // First attempt fails immediately
      await vi.runAllTimersAsync();

      // First retry after 1000ms (2^0 * 1000)
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      // Second retry after 2000ms (2^1 * 1000)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runAllTimersAsync();

      // Wait for save to complete
      await savePromise;

      // Verify exponential backoff worked
      expect(callCount).toBe(3);
      expect(documentManager.getCurrentState()).toBe('saved');

      vi.useRealTimers();
    });

    it('should store unsaved changes after max retries', async () => {
      vi.useFakeTimers();

      const docId = 'test-doc-store-after-retries';
      const markdown = '# Test Store After Retries';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockRejectedValue(new Error('Persistent network error'));

      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      } as any;

      // Load document
      await documentManager.loadDocument(docId);

      // Start save operation (don't await yet)
      const savePromise = documentManager.saveDocument(docId);

      // Fast-forward through all retries
      await vi.runAllTimersAsync();

      // Try to save (will fail after max retries)
      await expect(savePromise).rejects.toThrow(
        'Failed to save document after 3 retries'
      );

      // Verify unsaved changes were stored
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `unsaved_doc_${docId}`,
        expect.stringContaining(docId)
      );

      vi.useRealTimers();
    }, 10000);
  });

  describe('error handling', () => {
    it('should handle conversion errors gracefully', async () => {
      const docId = 'test-doc-conversion-error';
      const invalidMarkdown = '# Test\n\n```invalid\nunclosed code block';

      vi.mocked(api.getFileContent).mockResolvedValue(invalidMarkdown);

      // Attempt to load document with invalid markdown
      // The converter should handle this gracefully
      try {
        await documentManager.loadDocument(docId);
        // If it succeeds, verify state
        expect(documentManager.getCurrentState()).toBe('saved');
      } catch (error) {
        // If it fails, verify error state
        expect(documentManager.getCurrentState()).toBe('error');
      }
    });

    it('should notify error state to callbacks', async () => {
      const docId = 'test-doc-error-callback';
      const error = new Error('Test error');

      vi.mocked(api.getFileContent).mockRejectedValue(error);

      let capturedState: string | null = null;
      let capturedError: Error | undefined;

      // Subscribe to state changes
      const unsubscribe = documentManager.onStateChange((state, err) => {
        if (state === 'error') {
          capturedState = state;
          capturedError = err;
        }
      });

      // Attempt to load document
      await expect(documentManager.loadDocument(docId)).rejects.toThrow('Test error');

      // Verify error was captured
      expect(capturedState).toBe('error');
      expect(capturedError).toBe(error);

      // Cleanup
      unsubscribe();
    });

    it('should handle callback errors without crashing', async () => {
      const docId = 'test-doc-callback-error';
      const markdown = '# Test Callback Error';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Subscribe with a callback that throws
      const unsubscribe = documentManager.onStateChange(() => {
        throw new Error('Callback error');
      });

      // Load document should still succeed despite callback error
      await expect(documentManager.loadDocument(docId)).resolves.not.toThrow();

      // Cleanup
      unsubscribe();
    });
  });

  describe('state transitions', () => {
    it('should transition through correct states during load', async () => {
      const docId = 'test-doc-load-states';
      const markdown = '# Test Load States';
      const states: string[] = [];

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Subscribe to state changes
      const unsubscribe = documentManager.onStateChange((state) => {
        states.push(state);
      });

      // Initial state
      expect(documentManager.getCurrentState()).toBe('idle');

      // Load document
      await documentManager.loadDocument(docId);

      // Verify state transitions: idle -> loading -> saved
      expect(states).toContain('loading');
      expect(states).toContain('saved');
      expect(states[states.indexOf('loading')]).toBe('loading');
      expect(states[states.indexOf('saved')]).toBe('saved');
      expect(states.indexOf('loading')).toBeLessThan(states.indexOf('saved'));

      // Cleanup
      unsubscribe();
    });

    it('should transition through correct states during save', async () => {
      const docId = 'test-doc-save-states';
      const markdown = '# Test Save States';
      const states: string[] = [];

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);
      vi.mocked(api.saveFile).mockResolvedValue(undefined);

      // Load document first
      await documentManager.loadDocument(docId);

      // Subscribe to state changes
      const unsubscribe = documentManager.onStateChange((state) => {
        states.push(state);
      });

      // Save document
      await documentManager.saveDocument(docId);

      // Verify state transitions: saving -> saved
      expect(states).toContain('saving');
      expect(states).toContain('saved');
      expect(states.indexOf('saving')).toBeLessThan(states.indexOf('saved'));

      // Cleanup
      unsubscribe();
    });

    it('should transition to error state on failure', async () => {
      const docId = 'test-doc-error-state';
      const error = new Error('Load error');
      const states: string[] = [];

      vi.mocked(api.getFileContent).mockRejectedValue(error);

      // Subscribe to state changes
      const unsubscribe = documentManager.onStateChange((state) => {
        states.push(state);
      });

      // Attempt to load document
      await expect(documentManager.loadDocument(docId)).rejects.toThrow();

      // Verify state transitions: idle -> loading -> error
      expect(states).toContain('loading');
      expect(states).toContain('error');
      expect(documentManager.getCurrentState()).toBe('error');

      // Cleanup
      unsubscribe();
    });

    it('should reset to idle state after disposal', async () => {
      const docId = 'test-doc-idle-after-dispose';
      const markdown = '# Test Idle After Dispose';

      vi.mocked(api.getFileContent).mockResolvedValue(markdown);

      // Load document
      await documentManager.loadDocument(docId);
      expect(documentManager.getCurrentState()).toBe('saved');

      // Dispose document
      documentManager.disposeCurrentDoc();

      // Verify state is idle
      expect(documentManager.getCurrentState()).toBe('idle');
    });
  });

  describe('Property 2: Document Save Preserves Content', () => {
    /**
     * Feature: blocksuite-integration, Property 2: Document Save Preserves Content
     * Validates: Requirements 4.1, 4.2, 4.3
     * 
     * For any document edit operation, after the save completes successfully,
     * reloading the document should show the same content that was saved.
     * 
     * This property tests the complete save-load cycle to ensure data persistence
     * and consistency across the entire document lifecycle.
     */
    it('saved document can be reloaded with same content', async () => {
      const fc = await import('fast-check');
      const converter = getMarkdownConverter();

      await fc.assert(
        fc.asyncProperty(
          arbitraryDocumentContent(),
          async (markdown) => {
            try {
              // Generate unique doc ID for this test iteration
              const docId = `test-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

              // Mock API to store and retrieve content
              let savedContent: string | null = null;

              vi.mocked(api.getFileContent).mockImplementation(async (id: string) => {
                if (id === docId && savedContent !== null) {
                  return savedContent;
                }
                return markdown; // Initial load
              });

              vi.mocked(api.saveFile).mockImplementation(async (id: string, content: string) => {
                if (id === docId) {
                  savedContent = content;
                }
              });

              // Step 1: Load document with initial content
              await documentManager.loadDocument(docId);
              expect(documentManager.getCurrentDocId()).toBe(docId);

              // Step 2: Get the doc and verify it loaded
              const doc = documentManager.getCurrentDoc();
              expect(doc).not.toBeNull();

              // Step 3: Convert original doc to markdown before saving
              const originalMarkdown = await converter.docToMarkdown(doc!);
              const normalizedOriginal = normalizeMarkdown(originalMarkdown);

              // Step 4: Save the document
              await documentManager.saveDocument(docId);
              expect(savedContent).not.toBeNull();

              // Step 5: Dispose the current document (clear memory state)
              documentManager.disposeCurrentDoc();
              expect(documentManager.getCurrentDocId()).toBeNull();
              expect(documentManager.getCurrentDoc()).toBeNull();

              // Step 6: Reload the document from saved content
              await documentManager.loadDocument(docId);
              expect(documentManager.getCurrentDocId()).toBe(docId);

              // Step 7: Verify the reloaded document has the same content
              const reloadedDoc = documentManager.getCurrentDoc();
              expect(reloadedDoc).not.toBeNull();

              // Convert reloaded doc to markdown
              const reloadedMarkdown = await converter.docToMarkdown(reloadedDoc!);
              const normalizedReloaded = normalizeMarkdown(reloadedMarkdown);

              // Verify content consistency
              // The reloaded content should match the original content
              expect(normalizedReloaded).toBe(normalizedOriginal);

              // Cleanup
              documentManager.disposeCurrentDoc();

              return true;
            } catch (error) {
              // If the test fails, log the error for debugging
              console.error('Property test failed:', error);
              throw error;
            }
          }
        ),
        { numRuns: 100, verbose: false }
      );
    }, 120000); // 120 second timeout for property test with 100 runs
  });
});

/**
 * Arbitrary generator for document content
 * Generates various types of Markdown content for testing
 */
function arbitraryDocumentContent(): any {
  const fc = require('fast-check');

  // Generate various Markdown elements
  const heading = fc.integer({ min: 1, max: 6 }).chain((level: number) =>
    fc.string({ minLength: 1, maxLength: 50 }).map((text: string) => 
      `${'#'.repeat(level)} ${text.trim() || 'Heading'}`
    )
  );

  const paragraph = fc.string({ minLength: 1, maxLength: 200 }).map((text: string) => 
    text.trim() || 'Paragraph text'
  );

  const bulletList = fc.array(
    fc.string({ minLength: 1, maxLength: 100 }),
    { minLength: 1, maxLength: 5 }
  ).map((items: string[]) => 
    items.map((item: string) => `- ${item.trim() || 'Item'}`).join('\n')
  );

  const numberedList = fc.array(
    fc.string({ minLength: 1, maxLength: 100 }),
    { minLength: 1, maxLength: 5 }
  ).map((items: string[]) => 
    items.map((item: string, idx: number) => `${idx + 1}. ${item.trim() || 'Item'}`).join('\n')
  );

  const codeBlock = fc.tuple(
    fc.constantFrom('javascript', 'typescript', 'python', 'java', 'go', ''),
    fc.string({ minLength: 1, maxLength: 100 })
  ).map(([lang, code]: [string, string]) => 
    `\`\`\`${lang}\n${code.trim() || 'code'}\n\`\`\``
  );

  const bold = fc.string({ minLength: 1, maxLength: 50 }).map((text: string) => 
    `**${text.trim() || 'bold'}**`
  );

  const italic = fc.string({ minLength: 1, maxLength: 50 }).map((text: string) => 
    `*${text.trim() || 'italic'}*`
  );

  const link = fc.tuple(
    fc.string({ minLength: 1, maxLength: 30 }),
    fc.webUrl()
  ).map(([text, url]: [string, string]) => 
    `[${text.trim() || 'link'}](${url})`
  );

  // Combine different elements
  const markdownElement = fc.oneof(
    heading,
    paragraph,
    bulletList,
    numberedList,
    codeBlock,
    bold,
    italic,
    link
  );

  // Generate a document with multiple elements
  return fc.array(markdownElement, { minLength: 1, maxLength: 8 }).map((elements: string[]) => 
    elements.join('\n\n')
  );
}

/**
 * Normalize Markdown for comparison
 * Handles whitespace differences and formatting variations
 */
function normalizeMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Trim trailing whitespace from each line
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Trim start and end
    .trim();
}
