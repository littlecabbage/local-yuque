import React from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, BookOpen, Folder, FileText, Plus, Search, Globe, MoreHorizontal, Clock, Star, Edit, Trash } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  nodes: FileNode[];
  activeDocId: string | null;
  onNodeClick: (node: FileNode) => void;
  onToggle: (id: string) => void;
  onCreateNode: (parentId: string | null, type: 'kb' | 'folder' | 'doc') => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  lang: 'zh' | 'en';
  setLang: (lang: 'zh' | 'en') => void;
  onSearchClick: () => void;
}

const NodeItem: React.FC<{
  node: FileNode;
  depth: number;
  activeDocId: string | null;
  onNodeClick: (node: FileNode) => void;
  onToggle: (id: string) => void;
  onCreateNode: (parentId: string | null, type: 'kb' | 'folder' | 'doc') => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
}> = ({ node, depth, activeDocId, onNodeClick, onToggle, onCreateNode, onRename, onDelete }) => {
  const isKb = node.type === 'kb';
  const isFolder = node.type === 'folder';
  const hasChildren = isKb || isFolder;
  const isActive = node.id === activeDocId;

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleClick = () => {
    onNodeClick(node);
    if ((isKb || isFolder) && !node.isOpen) {
      onToggle(node.id);
    }
  };

  const getIcon = () => {
    if (isKb) return <BookOpen size={15} className="text-gray-600" />;
    if (isFolder) return <Folder size={15} className={clsx("text-gray-400 fill-current")} />;
    return <FileText size={15} className="text-gray-400" />;
  };

  return (
    <div className="select-none text-[14px]">
      <div
        className={clsx(
          "group flex items-center py-1.5 pr-3 cursor-pointer transition-all duration-200 rounded-r-full mr-2",
          isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-100",
        )}
        style={{ paddingLeft: `${depth * 16 + 16}px` }}
        onClick={handleClick}
      >
        <div
          onClick={handleIconClick}
          className={clsx(
            "mr-1 p-0.5 rounded-sm hover:bg-gray-200 transition-colors text-gray-400",
            !hasChildren && "opacity-0 pointer-events-none"
          )}
        >
          {node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>

        <div className={clsx("mr-2 flex-shrink-0", isActive ? "text-primary-600" : "")}>
          {getIcon()}
        </div>

        <span className="truncate flex-1 leading-snug">{node.title}</span>

        {/* Hover Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2 transition-opacity space-x-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onRename(node); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-500"
            title="Rename"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-500"
            title="Delete"
          >
            <Trash size={12} />
          </button>
          {(isKb || isFolder) && (
            <button
              onClick={(e) => { e.stopPropagation(); onCreateNode(node.id, node.type === 'kb' ? 'folder' : 'doc'); }}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-green-500"
              title="Create new"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      {node.isOpen && node.children && (
        <div className="flex flex-col relative">
          {node.children.map(child => (
            <NodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeDocId={activeDocId}
              onNodeClick={onNodeClick}
              onToggle={onToggle}
              onCreateNode={onCreateNode}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ nodes, activeDocId, onNodeClick, onToggle, onCreateNode, onRename, onDelete, lang, setLang, onSearchClick }) => {
  return (
    <div className="w-64 h-full bg-[#FAFAFA] border-r border-gray-200 flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-800 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
              <BookOpen className="text-white" size={14} strokeWidth={3} />
            </div>
            <span className="font-bold text-lg tracking-tight">Yueque</span>
          </div>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Globe size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative group mb-4 cursor-pointer" onClick={onSearchClick}>
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <div
            className="w-full bg-white border border-gray-200 group-hover:border-gray-300 rounded-md py-1.5 pl-8 pr-3 text-sm text-gray-400 group-hover:text-gray-500 transition-all select-none"
          >
            {lang === 'zh' ? "搜索" : "Search"}
          </div>
        </div>

        {/* Navigation Shortcuts */}
        <div className="space-y-0.5 mb-4">
          <div className="flex items-center px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm">
            <Clock size={16} className="mr-3 text-gray-400" />
            <span>{lang === 'zh' ? "最近访问" : "Recent"}</span>
          </div>
          <div className="flex items-center px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm">
            <Star size={16} className="mr-3 text-gray-400" />
            <span>{lang === 'zh' ? "收藏" : "Starred"}</span>
          </div>
        </div>

        <div className="px-2 pb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex justify-between items-center group">
            <span>{lang === 'zh' ? "知识库" : "Knowledge Base"}</span>
            <button
              onClick={() => onCreateNode(null, 'kb')}
              className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 p-0.5 rounded transition-all"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-0 pb-4">
        {nodes.map(node => (
          <NodeItem
            key={node.id}
            node={node}
            depth={0}
            activeDocId={activeDocId}
            onNodeClick={onNodeClick}
            onToggle={onToggle}
            onCreateNode={onCreateNode}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-200 flex items-center space-x-3 bg-[#FAFAFA]">
        <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-gray-700 truncate">{lang === 'zh' ? '我的工作台' : 'My Workspace'}</p>
        </div>
        <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
  );
};
