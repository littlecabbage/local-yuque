import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Doc } from '@blocksuite/store';
import { PageEditor } from '@blocksuite/presets';
import { getWorkspaceManager } from '../src/managers/WorkspaceManager';
import { getDocumentManager } from '../src/managers/DocumentManager';
import { getBlockSuiteConfig } from '../src/config/blocksuiteConfig';

/**
 * Props for BlockSuiteEditor component
 */
export interface BlockSuiteEditorProps {
  /** Document ID to load and edit */
  docId: string;
  
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  
  /** Callback when save status changes */
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'error') => void;
  
  /** Callback when editor initialization completes */
  onEditorReady?: () => void;
  
  /** Callback when editor encounters an error */
  onError?: (error: Error) => void;
  
  /** Additional CSS class name */
  className?: string;
}

/**
 * Editor lifecycle state
 */
type EditorLifecycleState = 
  | 'idle'           // Not initialized
  | 'initializing'   // Currently initializing
  | 'ready'          // Ready and mounted
  | 'error'          // Error occurred
  | 'disposing';     // Currently disposing

/**
 * BlockSuiteEditor component wraps BlockSuite PageEditor Web Component
 * Manages editor lifecycle, document loading, and auto-save functionality
 * 
 * Lifecycle Management:
 * - Handles docId changes with proper cleanup and reinitialization
 * - Implements error boundaries for graceful error handling
 * - Ensures proper resource cleanup on unmount
 * - Prevents memory leaks through careful subscription management
 */
export const BlockSuiteEditor: React.FC<BlockSuiteEditorProps> = ({
  docId,
  onContentChange,
  onSaveStatusChange,
  onEditorReady,
  onError,
  className = '',
}) => {
  console.log(`[BlockSuiteEditor] Component rendering with docId: ${docId}`);
  
  const editorRef = useRef<PageEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceManager = getWorkspaceManager();
  const documentManager = getDocumentManager();
  
  // Track previous docId to detect changes
  const prevDocIdRef = useRef<string | null>(null);
  
  // Track if we've attempted initialization
  const hasInitializedRef = useRef<boolean>(false);
  
  // Lifecycle state
  const [lifecycleState, setLifecycleState] = useState<EditorLifecycleState>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  // Track cleanup functions
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  console.log(`[BlockSuiteEditor] Current lifecycle state: ${lifecycleState}`);

  /**
   * Add a cleanup function to be called on unmount or docId change
   */
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctionsRef.current.push(cleanup);
  }, []);

  /**
   * Execute all cleanup functions
   */
  const executeCleanup = useCallback(() => {
    console.log(`[BlockSuiteEditor] Executing ${cleanupFunctionsRef.current.length} cleanup functions`);
    
    cleanupFunctionsRef.current.forEach((cleanup, index) => {
      try {
        cleanup();
      } catch (err) {
        console.error(`[BlockSuiteEditor] Cleanup function ${index} failed:`, err);
      }
    });
    
    // Clear cleanup functions
    cleanupFunctionsRef.current = [];
  }, []);

  /**
   * Dispose current editor instance and cleanup resources
   */
  const disposeEditor = useCallback(() => {
    if (lifecycleState === 'disposing') {
      console.warn('[BlockSuiteEditor] Already disposing, skipping');
      return;
    }

    console.log(`[BlockSuiteEditor] Disposing editor for doc: ${prevDocIdRef.current}`);
    setLifecycleState('disposing');

    try {
      // Execute all cleanup functions
      executeCleanup();

      // Remove editor from DOM
      if (editorRef.current && containerRef.current?.contains(editorRef.current)) {
        editorRef.current.remove();
      }
      
      editorRef.current = null;

      // Dispose document through DocumentManager
      // This will handle doc cleanup and unsubscribe from changes
      if (prevDocIdRef.current) {
        documentManager.disposeCurrentDoc();
      }

      // Reset initialization flag
      hasInitializedRef.current = false;

      console.log('[BlockSuiteEditor] Editor disposed successfully');
    } catch (err) {
      console.error('[BlockSuiteEditor] Error during disposal:', err);
    } finally {
      setLifecycleState('idle');
    }
  }, [lifecycleState, executeCleanup, documentManager]);

  /**
   * Handle errors with proper error boundary behavior
   */
  const handleError = useCallback((err: Error, context: string) => {
    console.error(`[BlockSuiteEditor] Error in ${context}:`, err);
    
    setError(err);
    setLifecycleState('error');
    
    // Notify parent component
    if (onError) {
      onError(err);
    }
    
    // Attempt cleanup to prevent resource leaks
    try {
      executeCleanup();
    } catch (cleanupErr) {
      console.error('[BlockSuiteEditor] Error during error cleanup:', cleanupErr);
    }
  }, [onError, executeCleanup]);

  /**
   * Initialize editor for the given docId
   */
  const initializeEditor = useCallback(async () => {
    if (lifecycleState === 'initializing' || lifecycleState === 'ready') {
      console.warn('[BlockSuiteEditor] Already initializing or ready, skipping');
      return;
    }

    if (!containerRef.current) {
      console.warn('[BlockSuiteEditor] Container not ready, skipping initialization');
      return;
    }

    try {
      console.log(`[BlockSuiteEditor] Initializing editor for doc: ${docId}`);
      setLifecycleState('initializing');
      setError(null);
      hasInitializedRef.current = true;
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Editor initialization timeout after 10 seconds')), 10000);
      });
      
      const initPromise = (async () => {
        // Ensure workspace is initialized
        if (!workspaceManager.isInitialized()) {
          console.log('[BlockSuiteEditor] Initializing workspace manager');
          await workspaceManager.initialize();
        }

        // Load document through DocumentManager
        console.log(`[BlockSuiteEditor] Loading document: ${docId}`);
        await documentManager.loadDocument(docId);

        // Get the doc instance
        console.log(`[BlockSuiteEditor] Getting doc instance: ${docId}`);
        const doc = workspaceManager.getOrCreateDoc(docId);

        // Get BlockSuite configuration
        const config = getBlockSuiteConfig();
        console.log('[BlockSuiteEditor] BlockSuite config loaded:', {
          richText: config.formatting,
          codeBlocks: config.codeBlocks,
          features: config.features,
        });

        // Create page-editor web component
        console.log('[BlockSuiteEditor] Creating page-editor element');
        const editor = document.createElement('page-editor') as any;
        
        // Attach doc to editor
        editor.doc = doc;

        // Note: BlockSuite's page-editor component has rich text and code block
        // features enabled by default. The configuration in blocksuiteConfig.ts
        // documents the available features and shortcuts for reference.

        // Mount editor to container
        if (containerRef.current) {
          console.log('[BlockSuiteEditor] Mounting editor to container');
          containerRef.current.appendChild(editor);
          editorRef.current = editor;
          
          // Add cleanup for editor removal
          addCleanup(() => {
            if (editor && containerRef.current?.contains(editor)) {
              editor.remove();
            }
          });
        } else {
          throw new Error('Container ref is not available');
        }

        // Subscribe to document state changes
        if (onSaveStatusChange) {
          const unsubscribeStateChange = documentManager.onStateChange((state, error) => {
            if (state === 'saved' || state === 'saving' || state === 'error') {
              onSaveStatusChange(state);
            }
            
            if (state === 'error' && error) {
              handleError(error, 'document state change');
            }
          });
          
          addCleanup(unsubscribeStateChange);
        }

        // Subscribe to document content changes
        if (onContentChange) {
          const unsubscribeDocChange = documentManager.onDocumentChange(docId, (content) => {
            onContentChange(content);
          });
          
          addCleanup(unsubscribeDocChange);
        }

        // Update state
        prevDocIdRef.current = docId;
        setLifecycleState('ready');
        
        // Notify parent component
        if (onEditorReady) {
          onEditorReady();
        }
        
        console.log(`[BlockSuiteEditor] Editor initialized successfully for doc: ${docId}`);
      })();
      
      // Race between initialization and timeout
      await Promise.race([initPromise, timeoutPromise]);
      
    } catch (err) {
      handleError(err as Error, 'initialization');
    }
  }, [
    docId,
    lifecycleState,
    workspaceManager,
    documentManager,
    onSaveStatusChange,
    onContentChange,
    onEditorReady,
    addCleanup,
    handleError,
  ]);

  /**
   * Handle docId changes - dispose old editor and initialize new one
   */
  useEffect(() => {
    const hasDocIdChanged = prevDocIdRef.current !== null && prevDocIdRef.current !== docId;
    
    if (hasDocIdChanged) {
      console.log(`[BlockSuiteEditor] DocId changed from ${prevDocIdRef.current} to ${docId}`);
      
      // Dispose current editor
      disposeEditor();
      
      // Initialize new editor after a brief delay to ensure cleanup completes
      const timeoutId = setTimeout(() => {
        initializeEditor();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]); // Only depend on docId

  /**
   * Initialize editor when container is ready (first mount only)
   * This effect runs after every render, but only initializes once
   */
  useEffect(() => {
    console.log(`[BlockSuiteEditor] Init effect triggered - hasInitialized: ${hasInitializedRef.current}, lifecycleState: ${lifecycleState}, containerReady: ${!!containerRef.current}`);
    
    // Only run on first mount when we haven't initialized yet
    if (!hasInitializedRef.current && lifecycleState === 'idle' && containerRef.current) {
      console.log('[BlockSuiteEditor] First mount, container ready, initializing editor');
      // Small delay to ensure DOM is fully ready
      const timeoutId = setTimeout(() => {
        console.log('[BlockSuiteEditor] Timeout fired, calling initializeEditor');
        initializeEditor();
      }, 10);
      
      return () => {
        console.log('[BlockSuiteEditor] Init effect cleanup, clearing timeout');
        clearTimeout(timeoutId);
      };
    } else {
      console.log('[BlockSuiteEditor] Skipping initialization - conditions not met');
    }
  }); // No dependencies - run after every render until initialized

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[BlockSuiteEditor] Component unmounting, disposing editor');
      
      // Inline cleanup to avoid dependency on disposeEditor
      if (lifecycleState === 'disposing') {
        console.warn('[BlockSuiteEditor] Already disposing, skipping');
        return;
      }

      console.log(`[BlockSuiteEditor] Disposing editor for doc: ${prevDocIdRef.current}`);

      try {
        // Execute all cleanup functions
        cleanupFunctionsRef.current.forEach((cleanup, index) => {
          try {
            cleanup();
          } catch (err) {
            console.error(`[BlockSuiteEditor] Cleanup function ${index} failed:`, err);
          }
        });
        cleanupFunctionsRef.current = [];

        // Remove editor from DOM
        if (editorRef.current && containerRef.current?.contains(editorRef.current)) {
          editorRef.current.remove();
        }
        
        editorRef.current = null;

        // Dispose document through DocumentManager
        if (prevDocIdRef.current) {
          documentManager.disposeCurrentDoc();
        }

        // Reset initialization flag
        hasInitializedRef.current = false;

        console.log('[BlockSuiteEditor] Editor disposed successfully on unmount');
      } catch (err) {
        console.error('[BlockSuiteEditor] Error during disposal on unmount:', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount/unmount

  /**
   * Retry initialization after error
   */
  const handleRetry = useCallback(() => {
    console.log('[BlockSuiteEditor] Retrying initialization');
    setError(null);
    setLifecycleState('idle');
    initializeEditor();
  }, [initializeEditor]);

  // Error state with retry option
  if (lifecycleState === 'error' && error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Failed to load editor
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {error.message}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Always render the container div so containerRef can be assigned
  // Show loading overlay when not ready
  const isLoading = lifecycleState === 'idle' || lifecycleState === 'initializing' || lifecycleState === 'disposing';

  return (
    <div 
      ref={containerRef} 
      className={`blocksuite-editor-container h-full w-full relative ${className}`}
      style={{
        // Ensure proper sizing for BlockSuite editor
        minHeight: '100%',
        overflow: 'auto',
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <div className="text-gray-600">
              {lifecycleState === 'disposing' ? 'Cleaning up...' : 'Loading editor...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
