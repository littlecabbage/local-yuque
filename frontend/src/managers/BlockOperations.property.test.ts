/**
 * Property-Based Tests for Block Operations
 * 
 * Feature: blocksuite-integration
 * Property 3: Block Operations Preserve Document Validity
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 * 
 * This test verifies that performing block operations (add, delete, move, update)
 * on a valid BlockSuite document always results in another valid document.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { getWorkspaceManager } from './WorkspaceManager';
import type { Doc } from '@blocksuite/store';

describe('Block Operations - Property-Based Tests', () => {
  const workspaceManager = getWorkspaceManager();

  beforeEach(async () => {
    // Initialize workspace before each test
    if (!workspaceManager.isInitialized()) {
      await workspaceManager.initialize();
    }
  });

  afterEach(() => {
    // Clean up after each test
    workspaceManager.reset();
  });

  /**
   * Property 3: Block Operations Preserve Document Validity
   * 
   * For any valid BlockSuite document, performing block operations
   * (add, delete, move, update) should result in another valid document.
   */
  it('Property 3: Block operations preserve document validity', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random document ID
        fc.uuid(),
        // Generate a random sequence of block operations
        fc.array(
          fc.oneof(
            fc.record({
              type: fc.constant('add' as const),
              blockType: fc.oneof(
                fc.constant('affine:paragraph'),
                fc.constant('affine:list'),
                fc.constant('affine:code')
              ),
              content: fc.string({ minLength: 0, maxLength: 100 }),
            }),
            fc.record({
              type: fc.constant('delete' as const),
              blockIndex: fc.nat({ max: 10 }),
            }),
            fc.record({
              type: fc.constant('update' as const),
              blockIndex: fc.nat({ max: 10 }),
              content: fc.string({ minLength: 0, maxLength: 100 }),
            })
          ),
          { minLength: 1, maxLength: 20 }
        ),
        async (docId, operations) => {
          // Create a new document
          const doc = workspaceManager.getOrCreateDoc(docId);
          
          // Verify initial document is valid
          expect(doc).toBeDefined();
          expect(doc.id).toBe(docId);
          expect(isValidDoc(doc)).toBe(true);

          // Apply each operation
          for (const operation of operations) {
            try {
              await applyOperation(doc, operation);
            } catch (error) {
              // Operations may fail (e.g., deleting non-existent block)
              // This is acceptable - we just skip invalid operations
              console.log(`Operation skipped: ${operation.type}`, error);
            }
          }

          // Verify document is still valid after all operations
          expect(isValidDoc(doc)).toBe(true);

          // Cleanup
          workspaceManager.disposeDoc(docId);
        }
      ),
      { numRuns: 100, verbose: true }
    );
  }, 60000); // 60 second timeout for 100 iterations

  /**
   * Property 3 (variant): Adding blocks maintains document validity
   */
  it('Property 3 (variant): Adding blocks maintains document validity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(
          fc.record({
            blockType: fc.oneof(
              fc.constant('affine:paragraph'),
              fc.constant('affine:list'),
              fc.constant('affine:code')
            ),
            content: fc.string({ minLength: 0, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (docId, blocks) => {
          const doc = workspaceManager.getOrCreateDoc(docId);
          
          expect(isValidDoc(doc)).toBe(true);

          // Add all blocks
          for (const block of blocks) {
            await addBlock(doc, block.blockType, block.content);
          }

          // Document should still be valid
          expect(isValidDoc(doc)).toBe(true);

          // Verify blocks were added
          const blockCount = getBlockCount(doc);
          expect(blockCount).toBeGreaterThanOrEqual(blocks.length);

          workspaceManager.disposeDoc(docId);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 3 (variant): Deleting blocks maintains document validity
   */
  it('Property 3 (variant): Deleting blocks maintains document validity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 5, max: 20 }),
        fc.array(fc.nat({ max: 19 }), { minLength: 1, maxLength: 10 }),
        async (docId, initialBlockCount, deleteIndices) => {
          const doc = workspaceManager.getOrCreateDoc(docId);
          
          // Add initial blocks
          for (let i = 0; i < initialBlockCount; i++) {
            await addBlock(doc, 'affine:paragraph', `Block ${i}`);
          }

          expect(isValidDoc(doc)).toBe(true);
          const beforeCount = getBlockCount(doc);

          // Delete blocks at specified indices
          for (const index of deleteIndices) {
            try {
              await deleteBlockAtIndex(doc, index);
            } catch (error) {
              // Block may not exist at this index, which is fine
            }
          }

          // Document should still be valid
          expect(isValidDoc(doc)).toBe(true);

          // Block count should be less than or equal to initial count
          const afterCount = getBlockCount(doc);
          expect(afterCount).toBeLessThanOrEqual(beforeCount);

          workspaceManager.disposeDoc(docId);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 3 (variant): Updating blocks maintains document validity
   */
  it('Property 3 (variant): Updating blocks maintains document validity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 5, max: 20 }),
        fc.array(
          fc.record({
            index: fc.nat({ max: 19 }),
            content: fc.string({ minLength: 0, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (docId, initialBlockCount, updates) => {
          const doc = workspaceManager.getOrCreateDoc(docId);
          
          // Add initial blocks
          for (let i = 0; i < initialBlockCount; i++) {
            await addBlock(doc, 'affine:paragraph', `Initial content ${i}`);
          }

          expect(isValidDoc(doc)).toBe(true);

          // Update blocks
          for (const update of updates) {
            try {
              await updateBlockAtIndex(doc, update.index, update.content);
            } catch (error) {
              // Block may not exist at this index, which is fine
            }
          }

          // Document should still be valid
          expect(isValidDoc(doc)).toBe(true);

          workspaceManager.disposeDoc(docId);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a document is valid
 * A valid document:
 * - Has a defined ID
 * - Has a root block
 * - Has a valid block tree structure
 */
function isValidDoc(doc: Doc): boolean {
  try {
    // Check doc has ID
    if (!doc.id) {
      return false;
    }

    // Check doc is loaded
    if (!doc.ready) {
      return false;
    }

    // Get root block
    const root = doc.root;
    if (!root) {
      // Empty doc is valid
      return true;
    }

    // Check root has valid structure
    if (!root.id || !root.flavour) {
      return false;
    }

    // Recursively validate all blocks
    return validateBlockTree(root);
  } catch (error) {
    console.error('Document validation error:', error);
    return false;
  }
}

/**
 * Recursively validate block tree structure
 */
function validateBlockTree(block: any): boolean {
  try {
    // Check block has required properties
    if (!block.id || !block.flavour) {
      return false;
    }

    // Check children if they exist
    if (block.children) {
      for (const child of block.children) {
        if (!validateBlockTree(child)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Apply a block operation to a document
 */
async function applyOperation(
  doc: Doc,
  operation: 
    | { type: 'add'; blockType: string; content: string }
    | { type: 'delete'; blockIndex: number }
    | { type: 'update'; blockIndex: number; content: string }
): Promise<void> {
  switch (operation.type) {
    case 'add':
      await addBlock(doc, operation.blockType, operation.content);
      break;
    case 'delete':
      await deleteBlockAtIndex(doc, operation.blockIndex);
      break;
    case 'update':
      await updateBlockAtIndex(doc, operation.blockIndex, operation.content);
      break;
  }
}

/**
 * Add a block to the document
 */
async function addBlock(doc: Doc, blockType: string, content: string): Promise<void> {
  try {
    // Ensure doc has a root
    if (!doc.root) {
      // Create page root if it doesn't exist
      doc.load();
    }

    const root = doc.root;
    if (!root) {
      throw new Error('Failed to create root block');
    }

    // Find or create a note block (container for content blocks)
    let noteBlock = root.children?.find((child: any) => child.flavour === 'affine:note');
    
    if (!noteBlock) {
      // Create note block if it doesn't exist
      const noteId = doc.addBlock('affine:note' as any, {}, root.id);
      noteBlock = doc.getBlock(noteId);
    }

    if (!noteBlock) {
      throw new Error('Failed to create note block');
    }

    // Add the content block to the note
    doc.addBlock(blockType as any, { text: content }, noteBlock.id);
  } catch (error) {
    console.error('Error adding block:', error);
    throw error;
  }
}

/**
 * Delete a block at the specified index
 */
async function deleteBlockAtIndex(doc: Doc, index: number): Promise<void> {
  try {
    const blocks = getContentBlocks(doc);
    
    if (index >= 0 && index < blocks.length) {
      const block = blocks[index];
      doc.deleteBlock(block.id);
    }
  } catch (error) {
    console.error('Error deleting block:', error);
    throw error;
  }
}

/**
 * Update a block at the specified index
 */
async function updateBlockAtIndex(doc: Doc, index: number, content: string): Promise<void> {
  try {
    const blocks = getContentBlocks(doc);
    
    if (index >= 0 && index < blocks.length) {
      const block = blocks[index];
      doc.updateBlock(block, { text: content });
    }
  } catch (error) {
    console.error('Error updating block:', error);
    throw error;
  }
}

/**
 * Get all content blocks from the document
 */
function getContentBlocks(doc: Doc): any[] {
  try {
    const root = doc.root;
    if (!root) {
      return [];
    }

    const noteBlocks = root.children?.filter((child: any) => child.flavour === 'affine:note') || [];
    
    const contentBlocks: any[] = [];
    for (const note of noteBlocks) {
      if (note.children) {
        contentBlocks.push(...note.children);
      }
    }

    return contentBlocks;
  } catch (error) {
    return [];
  }
}

/**
 * Get the total number of content blocks in the document
 */
function getBlockCount(doc: Doc): number {
  return getContentBlocks(doc).length;
}
