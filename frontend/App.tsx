import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AIPanel } from './components/AIPanel';
import { KbDashboard } from './components/KbDashboard';
import { SearchModal } from './components/SearchModal';
import { api } from './services/api';
import { FileNode } from './types';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<FileNode | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // Load data on mount
  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      const data = await api.getTree();
      setNodes(data);

      if (!activeNode && data.length > 0) {
        // Optional: auto-select logic
      }
    } catch (e) {
      console.error("Failed to load tree", e);
    }
  };

  // Global Key binding for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper for local toggle state (UI only)
  const toggleNodeOpen = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, isOpen: !node.isOpen };
      if (node.children) return { ...node, children: toggleNodeOpen(node.children, id) };
      return node;
    });
  };

  const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, content: content };
      if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
      return node;
    });
  };

  const handleNodeClick = async (node: FileNode) => {
    setActiveDocId(node.id);

    // Auto-expand folder/kb
    if ((node.type === 'kb' || node.type === 'folder') && !node.isOpen) {
      setNodes(prev => toggleNodeOpen(prev, node.id));
    }

    // If it's a doc, fetch content
    if (node.type === 'doc') {
      try {
        const content = await api.getFileContent(node.id);
        setActiveNode({ ...node, content });
      } catch (e) {
        console.error("Failed to load content", e);
        setActiveNode(node); // Default to what we have
      }
    } else {
      setActiveNode(node);
    }
  };

  const handleToggleNode = (id: string) => {
    setNodes(prev => toggleNodeOpen(prev, id));
  };

  const handleUpdateContent = async (id: string, content: string) => {
    // Optimistic update
    setNodes(prev => updateNodeContent(prev, id, content));

    if (activeNode && activeNode.id === id) {
      setActiveNode({ ...activeNode, content });
    }

    try {
      await api.saveFile(id, content);
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const handleCreateNode = async (parentId: string | null, type: 'kb' | 'folder' | 'doc') => {
    const titleMap = {
      'kb': lang === 'zh' ? '新知识库' : 'New Knowledge Base',
      'folder': lang === 'zh' ? '新建文件夹' : 'New Folder',
      'doc': lang === 'zh' ? '无标题文档' : 'Untitled Doc'
    };

    const title = prompt(lang === 'zh' ? "请输入名称" : "Enter name", titleMap[type]);
    if (!title) return;

    try {
      await api.createNode(parentId, type, title);
      await loadTree();
    } catch (e) {
      console.error("Failed to create node", e);
      alert("Failed to create item");
    }
  };

  const handleRenameNode = async (node: FileNode) => {
    const newTitle = prompt(lang === 'zh' ? "重命名" : "Rename", node.title);
    if (!newTitle || newTitle === node.title) return;

    try {
      await api.renameNode(node.id, newTitle);
      await loadTree();
      if (activeNode?.id === node.id) {
        setActiveNode({ ...activeNode, title: newTitle });
      }
    } catch (e) {
      console.error("Failed to rename", e);
      alert("Failed to rename");
    }
  };

  const handleDeleteNode = async (node: FileNode) => {
    if (!confirm(lang === 'zh' ? `确定删除 "${node.title}" 吗?` : `Delete "${node.title}"?`)) return;

    try {
      await api.deleteNode(node.id);
      await loadTree();
      if (activeNode?.id === node.id) {
        setActiveNode(null);
        setActiveDocId(null);
      }
    } catch (e) {
      console.error("Failed to delete", e);
      alert("Failed to delete");
    }
  };

  // Determine what to render in main area
  const renderMainContent = () => {
    if (!activeNode) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          <p>{lang === 'zh' ? '选择内容开始' : 'Select content to start'}</p>
        </div>
      );
    }

    if (activeNode.type === 'kb' || activeNode.type === 'folder') {
      return (
        <KbDashboard
          node={activeNode}
          onNavigate={handleNodeClick}
          lang={lang}
        />
      );
    }

    return (
      <Editor
        node={activeNode}
        onUpdate={handleUpdateContent}
        onOpenAI={() => setIsAIOpen(!isAIOpen)}
        lang={lang}
      />
    );
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        nodes={nodes}
        activeDocId={activeDocId}
        onNodeClick={handleNodeClick}
        onToggle={handleToggleNode}
        onCreateNode={handleCreateNode}
        onRename={handleRenameNode}
        onDelete={handleDeleteNode}
        lang={lang}
        setLang={setLang}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl z-10">
        {renderMainContent()}
      </div>

      {/* Right AI Panel (Only for docs for now, or global helper) */}
      <AIPanel
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentDocContent={activeNode?.content || ''}
        lang={lang}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        nodes={nodes} // Note: search modal generally searches all nodes, but here we might just pass empty or use API inside modal
        onNavigate={(node) => {
          handleNodeClick(node);
          setIsSearchOpen(false);
        }}
        lang={lang}
      />
    </div>
  );
};

export default App;
