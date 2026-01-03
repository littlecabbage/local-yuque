import type { Doc } from '@blocksuite/store';
import { getWorkspaceManager } from './WorkspaceManager';
import { getMarkdownConverter } from './MarkdownConverter';
import { api } from '../../services/api';

/**
 * Document state types
 */
export type DocumentState = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

/**
 * Document state change callback
 */
export type StateChangeCallback = (state: DocumentState, error?: Error) => void;

/**
 * Document change callback
 */
export type DocumentChangeCallback = (content: string) => void;

/**
 * DocumentManager coordinates document loading, saving, and state management.
 * Implements auto-save with debouncing and retry logic.
 */
export class DocumentManager {
  private workspaceManager = getWorkspaceManager();
  private markdownConverter = getMarkdownConverter();
  
  private currentDocId: string | null = null;
  private currentDoc: Doc | null = null;
  private currentState: DocumentState = 'idle';
  
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private saveDebounceDelay = 1000; // 1 second
  
  private stateChangeCallbacks: Set<StateChangeCallback> = new Set();
  private documentChangeCallbacks: Map<string, Set<DocumentChangeCallback>> = new Map();
  
  private unsubscribeDocChange: (() => void) | null = null;
  
  /**
   * Load a document by ID
   * @param docId - Document ID to load
   */
  public async loadDocument(docId: string): Promise<void> {
    try {
      console.log(`[DocumentManager] Loading document: ${docId}`);
      this.setState('loading');
      
      // Dispose current document if exists
      if (this.currentDocId && this.currentDocId !== docId) {
        this.disposeCurrentDoc();
      }
      
      // Fetch markdown content from backend
      const markdown = await api.getFileContent(docId);
      
      // Get or create BlockSuite doc
      const doc = this.workspaceManager.getOrCreateDoc(docId);
      
      // Convert markdown to BlockSuite format and load into doc
      await this.markdownConverter.markdownToDoc(markdown, doc);
      
      // Set current doc
      this.currentDocId = docId;
      this.currentDoc = doc;
      
      // Setup change listener for auto-save
      this.setupDocChangeListener(docId, doc);
      
      this.setState('saved');
      console.log(`[DocumentManager] Document loaded successfully: ${docId}`);
    } catch (error) {
      console.error(`[DocumentManager] Failed to load document ${docId}:`, error);
      this.setState('error', error as Error);
      throw error;
    }
  }
  
  /**
   * Save current document
   * @param docId - Document ID to save
   */
  public async saveDocument(docId: string): Promise<void> {
    try {
      console.log(`[DocumentManager] Saving document: ${docId}`);
      this.setState('saving');
      
      // Get the doc
      const doc = this.workspaceManager.getOrCreateDoc(docId);
      
      // Convert BlockSuite doc to markdown
      const markdown = await this.markdownConverter.docToMarkdown(doc);
      
      // Save to backend with retry logic
      await this.saveWithRetry(docId, markdown);
      
      this.setState('saved');
      console.log(`[DocumentManager] Document saved successfully: ${docId}`);
    } catch (error) {
      console.error(`[DocumentManager] Failed to save document ${docId}:`, error);
      this.setState('error', error as Error);
      throw error;
    }
  }
  
  /**
   * Save document with retry mechanism (max 3 retries with exponential backoff)
   * @private
   */
  private async saveWithRetry(
    docId: string,
    markdown: string,
    retryCount: number = 0
  ): Promise<void> {
    const maxRetries = 3;
    
    try {
      await api.saveFile(docId, markdown);
    } catch (error) {
      if (retryCount < maxRetries) {
        // Calculate exponential backoff delay: 2^retryCount * 1000ms
        const delay = Math.pow(2, retryCount) * 1000;
        
        console.warn(
          `[DocumentManager] Save failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
          error
        );
        
        // Wait before retrying
        await this.delay(delay);
        
        // Retry
        return this.saveWithRetry(docId, markdown, retryCount + 1);
      } else {
        // Max retries reached
        console.error(
          `[DocumentManager] Save failed after ${maxRetries} retries`,
          error
        );
        
        // Store unsaved changes in localStorage as backup
        this.storeUnsavedChanges(docId, markdown);
        
        throw new Error(
          `Failed to save document after ${maxRetries} retries: ${error}`
        );
      }
    }
  }
  
  /**
   * Subscribe to document changes for auto-save
   * @param docId - Document ID
   * @param callback - Callback function to invoke on change
   * @returns Unsubscribe function
   */
  public onDocumentChange(
    docId: string,
    callback: DocumentChangeCallback
  ): () => void {
    if (!this.documentChangeCallbacks.has(docId)) {
      this.documentChangeCallbacks.set(docId, new Set());
    }
    
    const callbacks = this.documentChangeCallbacks.get(docId)!;
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.documentChangeCallbacks.delete(docId);
      }
    };
  }
  
  /**
   * Subscribe to state changes
   * @param callback - Callback function to invoke on state change
   * @returns Unsubscribe function
   */
  public onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }
  
  /**
   * Get current document
   * @returns Current Doc instance or null
   */
  public getCurrentDoc(): Doc | null {
    return this.currentDoc;
  }
  
  /**
   * Get current document ID
   * @returns Current document ID or null
   */
  public getCurrentDocId(): string | null {
    return this.currentDocId;
  }
  
  /**
   * Get current document state
   * @returns Current document state
   */
  public getCurrentState(): DocumentState {
    return this.currentState;
  }
  
  /**
   * Dispose current document and cleanup resources
   */
  public disposeCurrentDoc(): void {
    if (!this.currentDocId) {
      return;
    }
    
    console.log(`[DocumentManager] Disposing document: ${this.currentDocId}`);
    
    // Clear debounce timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    
    // Unsubscribe from doc changes
    if (this.unsubscribeDocChange) {
      this.unsubscribeDocChange();
      this.unsubscribeDocChange = null;
    }
    
    // Clear document change callbacks for this doc
    this.documentChangeCallbacks.delete(this.currentDocId);
    
    // Dispose doc from workspace manager
    this.workspaceManager.disposeDoc(this.currentDocId);
    
    // Reset current doc references
    this.currentDocId = null;
    this.currentDoc = null;
    this.currentState = 'idle';
  }
  
  /**
   * Setup document change listener for auto-save
   * @private
   */
  private setupDocChangeListener(docId: string, doc: Doc): void {
    // Unsubscribe from previous listener if exists
    if (this.unsubscribeDocChange) {
      this.unsubscribeDocChange();
    }
    
    // Subscribe to doc updates
    const disposable = doc.slots.blockUpdated.on(() => {
      console.log(`[DocumentManager] Document changed: ${docId}`);
      
      // Trigger debounced save
      this.debouncedSave(docId);
      
      // Notify document change callbacks
      this.notifyDocumentChange(docId);
    });
    
    // Store unsubscribe function
    this.unsubscribeDocChange = () => {
      disposable.dispose();
    };
  }
  
  /**
   * Debounced save - delays save operation by debounce delay
   * @private
   */
  private debouncedSave(docId: string): void {
    // Clear existing timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    
    // Set new timer
    this.saveDebounceTimer = setTimeout(() => {
      this.saveDocument(docId).catch((error) => {
        console.error('[DocumentManager] Auto-save failed:', error);
      });
    }, this.saveDebounceDelay);
  }
  
  /**
   * Set document state and notify callbacks
   * @private
   */
  private setState(state: DocumentState, error?: Error): void {
    this.currentState = state;
    
    // Notify all state change callbacks
    this.stateChangeCallbacks.forEach((callback) => {
      try {
        callback(state, error);
      } catch (err) {
        console.error('[DocumentManager] State change callback error:', err);
      }
    });
  }
  
  /**
   * Notify document change callbacks
   * @private
   */
  private async notifyDocumentChange(docId: string): Promise<void> {
    const callbacks = this.documentChangeCallbacks.get(docId);
    if (!callbacks || callbacks.size === 0) {
      return;
    }
    
    try {
      // Get current content as markdown
      const doc = this.workspaceManager.getOrCreateDoc(docId);
      const markdown = await this.markdownConverter.docToMarkdown(doc);
      
      // Notify all callbacks
      callbacks.forEach((callback) => {
        try {
          callback(markdown);
        } catch (error) {
          console.error('[DocumentManager] Document change callback error:', error);
        }
      });
    } catch (error) {
      console.error('[DocumentManager] Failed to get document content for callbacks:', error);
    }
  }
  
  /**
   * Store unsaved changes in localStorage as backup
   * @private
   */
  private storeUnsavedChanges(docId: string, content: string): void {
    try {
      const key = `unsaved_doc_${docId}`;
      const data = {
        docId,
        content,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[DocumentManager] Stored unsaved changes for ${docId} in localStorage`);
    } catch (error) {
      console.error('[DocumentManager] Failed to store unsaved changes:', error);
    }
  }
  
  /**
   * Check for unsaved changes in localStorage
   * @param docId - Document ID to check
   * @returns Unsaved content if exists, null otherwise
   */
  public getUnsavedChanges(docId: string): { content: string; timestamp: number } | null {
    try {
      const key = `unsaved_doc_${docId}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const parsed = JSON.parse(data);
        return {
          content: parsed.content,
          timestamp: parsed.timestamp,
        };
      }
    } catch (error) {
      console.error('[DocumentManager] Failed to retrieve unsaved changes:', error);
    }
    
    return null;
  }
  
  /**
   * Clear unsaved changes from localStorage
   * @param docId - Document ID
   */
  public clearUnsavedChanges(docId: string): void {
    try {
      const key = `unsaved_doc_${docId}`;
      localStorage.removeItem(key);
      console.log(`[DocumentManager] Cleared unsaved changes for ${docId}`);
    } catch (error) {
      console.error('[DocumentManager] Failed to clear unsaved changes:', error);
    }
  }
  
  /**
   * Utility function to delay execution
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  /**
   * Force save current document immediately (bypass debounce)
   */
  public async forceSave(): Promise<void> {
    if (!this.currentDocId) {
      throw new Error('[DocumentManager] No document loaded');
    }
    
    // Clear debounce timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    
    // Save immediately
    await this.saveDocument(this.currentDocId);
  }
}

// Export singleton instance
let documentManagerInstance: DocumentManager | null = null;

export const getDocumentManager = (): DocumentManager => {
  if (!documentManagerInstance) {
    documentManagerInstance = new DocumentManager();
  }
  return documentManagerInstance;
};
