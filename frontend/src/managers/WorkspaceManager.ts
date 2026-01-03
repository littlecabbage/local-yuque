import { DocCollection, Schema } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks/schemas';
import type { Doc } from '@blocksuite/store';

/**
 * WorkspaceManager manages BlockSuite DocCollection and Doc instances lifecycle.
 * Implements singleton pattern to ensure single DocCollection instance.
 */
export class WorkspaceManager {
  private static instance: WorkspaceManager | null = null;
  private collection: DocCollection | null = null;
  private docs: Map<string, Doc> = new Map();
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of WorkspaceManager
   */
  public static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  /**
   * Initialize the workspace with AffineSchemas
   * Must be called before using other methods
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[WorkspaceManager] Already initialized');
      return;
    }

    try {
      // Create schema with AffineSchemas
      const schema = new Schema();
      schema.register(AffineSchemas);

      // Create DocCollection with the schema
      this.collection = new DocCollection({
        schema,
        id: 'yueque-workspace',
      });

      // Initialize collection meta
      this.collection.meta.initialize();

      this.initialized = true;
      console.log('[WorkspaceManager] Initialized successfully');
    } catch (error) {
      console.error('[WorkspaceManager] Initialization failed:', error);
      throw new Error(`Failed to initialize WorkspaceManager: ${error}`);
    }
  }

  /**
   * Get or create a Doc by ID
   * @param docId - Unique identifier for the document
   * @returns Doc instance
   */
  public getOrCreateDoc(docId: string): Doc {
    if (!this.initialized || !this.collection) {
      throw new Error('[WorkspaceManager] Not initialized. Call initialize() first.');
    }

    // Check if doc already exists in our cache
    if (this.docs.has(docId)) {
      return this.docs.get(docId)!;
    }

    // Try to get existing doc from collection
    let doc = this.collection.getDoc(docId);

    // If doc doesn't exist, create it
    if (!doc) {
      doc = this.collection.createDoc({ id: docId });
      doc.load();
    }

    // Cache the doc instance
    this.docs.set(docId, doc);

    return doc;
  }

  /**
   * Dispose a doc and cleanup resources
   * @param docId - ID of the document to dispose
   */
  public disposeDoc(docId: string): void {
    if (!this.initialized || !this.collection) {
      console.warn('[WorkspaceManager] Not initialized, cannot dispose doc');
      return;
    }

    const doc = this.docs.get(docId);
    if (doc) {
      // Remove from cache
      this.docs.delete(docId);

      // Remove from collection
      this.collection.removeDoc(docId);

      console.log(`[WorkspaceManager] Disposed doc: ${docId}`);
    }
  }

  /**
   * Get the DocCollection instance
   * @returns DocCollection instance
   */
  public getCollection(): DocCollection {
    if (!this.initialized || !this.collection) {
      throw new Error('[WorkspaceManager] Not initialized. Call initialize() first.');
    }
    return this.collection;
  }

  /**
   * Check if the workspace is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the number of active docs
   */
  public getActiveDocCount(): number {
    return this.docs.size;
  }

  /**
   * Dispose all docs and reset the workspace
   * Useful for testing or cleanup
   */
  public reset(): void {
    // Dispose all docs
    const docIds = Array.from(this.docs.keys());
    docIds.forEach(docId => this.disposeDoc(docId));

    // Reset state
    this.collection = null;
    this.initialized = false;
    this.docs.clear();

    console.log('[WorkspaceManager] Reset complete');
  }
}

// Export singleton instance getter
export const getWorkspaceManager = () => WorkspaceManager.getInstance();
