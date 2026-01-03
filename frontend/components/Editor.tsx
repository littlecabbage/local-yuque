import React, { useState, useEffect, useCallback } from 'react';
import { FileNode } from '../types';
import { Sparkles, ChevronRight, Star, Share2, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { BlockSuiteEditor } from './BlockSuiteEditor';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { FallbackEditor } from './FallbackEditor';

interface EditorProps {
  node: FileNode;
  onUpdate: (id: string, content: string) => void;
  onOpenAI: () => void;
  lang: 'zh' | 'en';
}

export const Editor: React.FC<EditorProps> = ({ node, onUpdate, onOpenAI, lang }) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [content, setContent] = useState(node.content || '');
  const [useFallback, setUseFallback] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Sync internal state when node changes
  useEffect(() => {
    setContent(node.content || '');
  }, [node.id, node.content]);

  // Handle content changes from BlockSuite editor
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    onUpdate(node.id, newContent);
  }, [node.id, onUpdate]);

  // Handle save status changes
  const handleSaveStatusChange = useCallback((status: 'saved' | 'saving' | 'error') => {
    setSaveStatus(status);
  }, []);

  // Handle editor errors - switch to fallback after multiple failures
  const handleEditorError = useCallback((error: Error) => {
    console.error('[Editor] BlockSuite error:', error);
    setSaveStatus('error');
    
    setErrorCount((prev) => {
      const newCount = prev + 1;
      
      // Switch to fallback editor after 2 errors
      if (newCount >= 2) {
        console.warn('[Editor] Multiple errors detected, switching to fallback editor');
        setUseFallback(true);
      }
      
      return newCount;
    });
  }, []);

  // Handle fallback editor save
  const handleFallbackSave = useCallback(async (newContent: string) => {
    setSaveStatus('saving');
    
    try {
      // Update content through parent component
      onUpdate(node.id, newContent);
      
      // Simulate async save operation
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setSaveStatus('saved');
      console.log('[Editor] Fallback editor saved successfully');
    } catch (error) {
      console.error('[Editor] Fallback save failed:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [node.id, onUpdate]);

  const t = {
      zh: {
          saving: '保存中...',
          saved: '已保存',
          error: '保存失败',
          aiAssist: 'AI 助手',
          untitled: '无标题文档',
          kbName: '默认知识库',
      },
      en: {
          saving: 'Saving...',
          saved: 'Saved',
          error: 'Save failed',
          aiAssist: 'AI Assist',
          untitled: 'Untitled Document',
          kbName: 'Default KB',
      }
  };

  const strings = t[lang];

  // Get save status text and color
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: strings.saving, color: 'text-blue-500' };
      case 'saved':
        return { text: strings.saved, color: 'text-gray-300' };
      case 'error':
        return { text: strings.error, color: 'text-red-500' };
      default:
        return { text: strings.saved, color: 'text-gray-300' };
    }
  };

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative font-sans">
      {/* Top Navigation Bar (Breadcrumbs & Actions) */}
      <div className="h-14 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span className="hover:text-gray-800 cursor-pointer">{strings.kbName}</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{node.title}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-1 text-gray-400">
                {/* Save Status Indicator */}
                <span className={clsx("text-xs mr-2 hidden md:inline", statusDisplay.color)}>
                  {statusDisplay.text}
                </span>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-yellow-500 transition-colors">
                    <Star size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1">
                    <Share2 size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                    <MoreHorizontal size={18} />
                </button>
             </div>
             <div className="w-px h-4 bg-gray-200 mx-2"></div>
             <button 
                onClick={onOpenAI}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors text-sm font-medium"
            >
                <Sparkles size={16} />
                <span className="hidden sm:inline">{strings.aiAssist}</span>
            </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {useFallback ? (
          /* Fallback Editor - Simple textarea when BlockSuite fails */
          <FallbackEditor
            docId={node.id}
            initialContent={content}
            onContentChange={handleContentChange}
            onSave={handleFallbackSave}
            className="h-full"
          />
        ) : (
          /* BlockSuite Editor with Error Boundary */
          <EditorErrorBoundary
            key={node.id}
            onError={handleEditorError}
          >
            <BlockSuiteEditor
              docId={node.id}
              onContentChange={handleContentChange}
              onSaveStatusChange={handleSaveStatusChange}
              onError={handleEditorError}
              className="h-full"
            />
          </EditorErrorBoundary>
        )}
      </div>
    </div>
  );
};
