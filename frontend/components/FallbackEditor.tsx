import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Save } from 'lucide-react';

/**
 * Props for FallbackEditor
 */
interface FallbackEditorProps {
  /** Document ID */
  docId: string;
  
  /** Initial content */
  initialContent?: string;
  
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  
  /** Callback when save is triggered */
  onSave?: (content: string) => Promise<void>;
  
  /** Additional CSS class */
  className?: string;
}

/**
 * FallbackEditor provides a simple textarea-based editor as a fallback
 * when BlockSuite fails to initialize.
 * 
 * Features:
 * - Simple textarea for editing
 * - Manual save button
 * - Warning message about degraded functionality
 * - Preserves content during failures
 * 
 * Validates: Requirements 13.5 (fallback to simple text editor)
 */
export const FallbackEditor: React.FC<FallbackEditorProps> = ({
  docId,
  initialContent = '',
  onContentChange,
  onSave,
  className = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle content changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      
      if (onContentChange) {
        onContentChange(newContent);
      }
    },
    [onContentChange]
  );

  // Handle manual save
  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(content);
      setLastSaved(new Date());
      console.log('[FallbackEditor] Content saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveError(errorMessage);
      console.error('[FallbackEditor] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Editor running in fallback mode
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              The rich text editor failed to load. You can still edit your document using this
              basic text editor. Some formatting features may not be available.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
        <div className="text-xs text-gray-500">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Save size={14} />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-sm text-red-800">
            Failed to save: {saveError}
          </p>
        </div>
      )}

      {/* Text Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleChange}
          className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          placeholder="Start typing..."
          spellCheck={true}
        />
      </div>

      {/* Footer Help Text */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">⌘+S</kbd> to save
        </p>
      </div>
    </div>
  );
};
