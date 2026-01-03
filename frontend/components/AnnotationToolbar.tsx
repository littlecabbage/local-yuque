import React from 'react';
import { MessageSquare, Highlighter, Copy, X } from 'lucide-react';

interface AnnotationToolbarProps {
  selection: { x: number; y: number; text: string } | null;
  onClose: () => void;
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({ selection, onClose }) => {
  if (!selection) return null;

  return (
    <div
      className="fixed z-50 bg-white shadow-xl rounded-lg border border-gray-100 flex items-center p-1.5 space-x-1 transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-150"
      style={{
        left: selection.x,
        top: selection.y,
      }}
    >
      <button className="p-2 hover:bg-yellow-50 rounded-md text-yellow-500 transition-colors" title="Highlight">
        <Highlighter size={16} />
      </button>
      <button className="p-2 hover:bg-blue-50 rounded-md text-blue-500 transition-colors" title="Comment">
        <MessageSquare size={16} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button 
        className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" 
        onClick={() => {
             navigator.clipboard.writeText(selection.text);
             onClose();
        }}
        title="Copy"
      >
        <Copy size={16} />
      </button>
      <button 
        className="p-2 hover:bg-red-50 rounded-md text-red-400 transition-colors"
        onClick={onClose}
      >
        <X size={16} />
      </button>
      
      {/* Arrow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white filter drop-shadow-sm"></div>
    </div>
  );
};
