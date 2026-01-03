import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileNode } from '../types';
import { PenTool, Image, Code, CheckSquare, Columns, Eye, Sparkles, ChevronRight, Star, Share2, MoreHorizontal, Clock, Type } from 'lucide-react';
import clsx from 'clsx';
import { AnnotationToolbar } from './AnnotationToolbar';
import { findNodeById } from '../services/mockFileSystem'; // Import helper if needed, but we might just fake breadcrumbs for now or pass context

interface EditorProps {
  node: FileNode;
  onUpdate: (id: string, content: string) => void;
  onOpenAI: () => void;
  lang: 'zh' | 'en';
}

export const Editor: React.FC<EditorProps> = ({ node, onUpdate, onOpenAI, lang }) => {
  const [content, setContent] = useState(node.content || '');
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [selection, setSelection] = useState<{ x: number; y: number; text: string } | null>(null);

  // Sync internal state when node changes
  useEffect(() => {
    setContent(node.content || '');
    setSelection(null);
  }, [node.id, node.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(node.id, newContent);
  };

  const handleTextSelection = () => {
    const selectionObj = window.getSelection();
    if (selectionObj && selectionObj.toString().length > 0) {
      const range = selectionObj.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const previewEl = document.getElementById('preview-container');
      if (previewEl && previewEl.contains(selectionObj.anchorNode)) {
        setSelection({
          x: rect.left + (rect.width / 2),
          y: rect.top - 10,
          text: selectionObj.toString()
        });
      } else {
        setSelection(null);
      }
    } else {
      setSelection(null);
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleTextSelection);
    return () => window.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const ToolButton = ({ icon: Icon, onClick, active }: { icon: any, onClick?: () => void, active?: boolean }) => (
    <button 
      onClick={onClick}
      className={clsx(
        "p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors",
        active && "bg-gray-200 text-gray-800"
      )}
    >
      <Icon size={16} />
    </button>
  );

  const t = {
      zh: {
          lastEdited: '最后编辑于',
          words: '字',
          aiAssist: 'AI 助手',
          format: '格式',
          untitled: '无标题文档',
          placeholder: '开始写作...',
          share: '分享',
          kbName: '默认知识库',
      },
      en: {
          lastEdited: 'Last edited',
          words: 'words',
          aiAssist: 'AI Assist',
          format: 'Format',
          untitled: 'Untitled Document',
          placeholder: 'Start writing...',
          share: 'Share',
          kbName: 'Default KB',
      }
  };

  const strings = t[lang];

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
                <span className="text-xs mr-2 text-gray-300 hidden md:inline">Saved</span>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-yellow-500 transition-colors">
                    <Star size={18} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1">
                    <Share2 size={18} />
                    {/* <span className="text-xs font-medium">{strings.share}</span> */}
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

      {/* Toolbar - Optional / Contextual */}
      {/* We keep it simple but cleaner */}
      <div className="px-6 py-2 border-b border-gray-50 flex items-center justify-between bg-white">
         <div className="flex items-center space-x-1">
             <ToolButton icon={Type} />
             <ToolButton icon={CheckSquare} />
             <ToolButton icon={Image} />
             <ToolButton icon={Code} />
         </div>
         <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
            <button 
                onClick={() => setMode('edit')}
                className={clsx("px-2 py-0.5 text-xs font-medium rounded-md transition-all", mode === 'edit' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
                Edit
            </button>
            <button 
                onClick={() => setMode('split')}
                className={clsx("px-2 py-0.5 text-xs font-medium rounded-md transition-all", mode === 'split' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
                Split
            </button>
            <button 
                onClick={() => setMode('preview')}
                className={clsx("px-2 py-0.5 text-xs font-medium rounded-md transition-all", mode === 'preview' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
                Preview
            </button>
         </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden flex relative bg-[#FAFAFA]">
         {/* Edit Mode */}
         <div className={clsx(
            "h-full overflow-y-auto transition-all duration-300",
            mode === 'split' ? 'w-1/2 border-r border-gray-200 bg-white' : mode === 'edit' ? 'w-full max-w-4xl mx-auto bg-white shadow-sm my-4 rounded-lg' : 'hidden'
        )}>
            <div className="max-w-3xl mx-auto px-10 py-12">
                {/* Title Input in Editor */}
                <input 
                    value={node.title} 
                    onChange={() => {}} 
                    className="text-4xl font-bold text-gray-900 w-full focus:outline-none placeholder-gray-300 mb-6"
                    placeholder={strings.untitled}
                    readOnly
                />
                <div className="flex items-center space-x-4 mb-8 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-4 h-4 rounded-full" />
                        <span>Felix</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span>{strings.lastEdited} {new Date().toLocaleDateString()}</span>
                    <span className="text-gray-300">|</span>
                    <span>{content.length} {strings.words}</span>
                </div>
                
                <textarea
                    value={content}
                    onChange={handleChange}
                    className="w-full h-[calc(100vh-300px)] resize-none focus:outline-none text-[16px] leading-relaxed text-gray-700 placeholder-gray-300 font-mono bg-transparent"
                    placeholder={strings.placeholder}
                    spellCheck={false}
                />
            </div>
        </div>

        {/* Preview Mode */}
        <div 
            id="preview-container"
            className={clsx(
                "h-full overflow-y-auto transition-all duration-300",
                mode === 'split' ? 'w-1/2 bg-[#FAFAFA]' : mode === 'preview' ? 'w-full bg-[#FAFAFA]' : 'hidden'
            )}
        >
            <div className={clsx(
                "px-10 py-12 bg-white min-h-full",
                mode === 'preview' ? "max-w-4xl mx-auto shadow-sm my-4 rounded-lg" : ""
            )}>
                 {/* Title in Preview only if in Full Preview or Split (to mirror structure) */}
                 {mode === 'preview' && (
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">{node.title}</h1>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-4 h-4 rounded-full" />
                                <span>Felix</span>
                            </div>
                            <span>{strings.lastEdited} {new Date().toLocaleDateString()}</span>
                            <span>{content.length} {strings.words}</span>
                        </div>
                    </div>
                 )}

                <div className="markdown-body">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
      </div>

      {/* Annotation Toolbar */}
      <AnnotationToolbar 
        selection={selection} 
        onClose={() => {
            setSelection(null);
            window.getSelection()?.removeAllRanges();
        }} 
      />
    </div>
  );
};
