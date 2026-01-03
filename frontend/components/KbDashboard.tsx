import React from 'react';
import { FileNode } from '../types';
import { FileText, Folder, BookOpen, ChevronRight, CornerDownRight } from 'lucide-react';
import clsx from 'clsx';

interface KbDashboardProps {
  node: FileNode;
  onNavigate: (node: FileNode) => void;
  lang: 'zh' | 'en';
}

// Recursive component to render tree items flatly
const DashboardTreeItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  onNavigate: (node: FileNode) => void 
}> = ({ node, depth, onNavigate }) => {
  const isFolder = node.type === 'folder';
  const isDoc = node.type === 'doc';
  
  return (
    <div className="group">
        <div 
            onClick={() => isDoc && onNavigate(node)}
            className={clsx(
                "flex items-center py-3 px-4 rounded-lg transition-colors border-b border-gray-50",
                isDoc ? "hover:bg-primary-50 cursor-pointer" : "bg-transparent cursor-default mt-4 mb-2"
            )}
            style={{ marginLeft: depth > 0 ? '0px' : '0px' }} // We handle indentation via padding inside or visual grouping
        >
            <div 
                className={clsx("mr-3 flex-shrink-0", isFolder ? "text-gray-800" : "text-gray-400 group-hover:text-primary-500")}
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {isFolder ? (
                    <div className="flex items-center font-bold text-base">
                       <Folder size={18} className="mr-2 fill-gray-100 text-gray-500" />
                       <span>{node.title}</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        {depth > 0 && <CornerDownRight size={14} className="mr-2 text-gray-300" />}
                        <FileText size={16} />
                    </div>
                )}
            </div>
            
            {!isFolder && (
                <div className="flex-1 min-w-0">
                    <span className={clsx("truncate text-sm", isDoc ? "text-gray-600 font-medium group-hover:text-primary-700" : "font-semibold text-gray-800")}>
                        {node.title}
                    </span>
                    {isDoc && node.content && (
                        <p className="text-xs text-gray-400 truncate mt-0.5 max-w-lg">
                            {node.content.slice(0, 60).replace(/[#*`]/g, '')}
                        </p>
                    )}
                </div>
            )}
            
            {isDoc && (
                <div className="text-xs text-gray-300 ml-4 hidden group-hover:block">
                    {new Date(node.createdAt).toLocaleDateString()}
                </div>
            )}
        </div>

        {/* Render Children Recursively */}
        {node.children && node.children.length > 0 && (
            <div className={clsx(isFolder ? "mb-4" : "")}>
                {node.children.map(child => (
                    <DashboardTreeItem 
                        key={child.id} 
                        node={child} 
                        depth={isFolder ? depth + 1 : depth} 
                        onNavigate={onNavigate} 
                    />
                ))}
            </div>
        )}
    </div>
  );
};

export const KbDashboard: React.FC<KbDashboardProps> = ({ node, onNavigate, lang }) => {
  const items = node.children || [];

  return (
    <div className="flex-1 h-full bg-[#FAFAFA] overflow-y-auto font-sans">
        {/* Header Area */}
        <div className="bg-white border-b border-gray-100 px-8 py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-100">
                         {node.type === 'kb' ? <BookOpen size={40} strokeWidth={1.5} /> : <Folder size={40} strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 pt-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                            <span>{lang === 'zh' ? '知识库' : 'Knowledge Base'}</span>
                            <ChevronRight size={14} />
                            <span>{new Date(node.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{node.title}</h1>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                            {lang === 'zh' 
                                ? '知识就像大树，让每篇文档结构化，方便知识的创作与沉淀。' 
                                : 'Knowledge is like a tree. Structure your documents for better creation and accumulation.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Directory Tree Area */}
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    {lang === 'zh' ? '目录' : 'Directory'} 
                </h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 min-h-[300px]">
                 {items.length === 0 ? (
                     <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Folder size={24} />
                         </div>
                         {lang === 'zh' ? '暂无内容，点击左侧 + 号创建' : 'No content, click + in sidebar to create'}
                     </div>
                 ) : (
                     <div className="flex flex-col">
                         {items.map(child => (
                             <DashboardTreeItem 
                                key={child.id} 
                                node={child} 
                                depth={0} 
                                onNavigate={onNavigate} 
                             />
                         ))}
                     </div>
                 )}
            </div>
        </div>
    </div>
  )
}
