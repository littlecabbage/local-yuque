import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AIPanel } from './components/AIPanel';
import { KbDashboard } from './components/KbDashboard';
import { SearchModal } from './components/SearchModal';
import { InputModal } from './components/InputModal';
import { api } from './services/api';
import { FileNode } from './types';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<FileNode | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    placeholder: '',
    defaultValue: '',
    onConfirm: () => {},
  });

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
    console.log('[App] handleNodeClick called with node:', node.id, node.type);
    setActiveDocId(node.id);

    // Auto-expand folder/kb
    if ((node.type === 'kb' || node.type === 'folder') && !node.isOpen) {
      setNodes(prev => toggleNodeOpen(prev, node.id));
    }

    // If it's a doc, fetch content
    if (node.type === 'doc') {
      console.log('[App] Fetching content for doc:', node.id);
      try {
        const content = await api.getFileContent(node.id);
        console.log('[App] Content fetched, setting activeNode');
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

    setInputModal({
      isOpen: true,
      title: lang === 'zh' ? "请输入名称" : "Enter name",
      placeholder: lang === 'zh' ? "请输入名称..." : "Enter name...",
      defaultValue: titleMap[type],
      onConfirm: async (title: string) => {
        try {
          await api.createNode(parentId, type, title);
          await loadTree();
        } catch (e) {
          console.error("Failed to create node", e);
          alert("Failed to create item");
        }
        setInputModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRenameNode = async (node: FileNode) => {
    setInputModal({
      isOpen: true,
      title: lang === 'zh' ? "重命名" : "Rename",
      placeholder: lang === 'zh' ? "请输入新名称..." : "Enter new name...",
      defaultValue: node.title,
      onConfirm: async (newTitle: string) => {
        if (newTitle === node.title) {
          setInputModal(prev => ({ ...prev, isOpen: false }));
          return;
        }

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
        setInputModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteNode = async (node: FileNode) => {
    if (window.confirm) {
      // 使用原生的confirm作为后备方案
      if (!confirm(lang === 'zh' ? `确定删除 "${node.title}" 吗?` : `Delete "${node.title}"?`)) return;
    } else {
      // 使用自定义确认对话框（简化版本）
      const confirmed = window.prompt ? 
        window.prompt(lang === 'zh' ? `输入"yes"确认删除 "${node.title}"` : `Type "yes" to confirm deleting "${node.title}"`) === 'yes' :
        true; // 如果都不支持，直接执行删除
      if (!confirmed) return;
    }

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
    console.log('[App] renderMainContent called, activeNode:', activeNode?.id, activeNode?.type);
    
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

    console.log('[App] Rendering Editor for node:', activeNode.id);
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

      {/* Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={inputModal.onConfirm}
        title={inputModal.title}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
        confirmText={lang === 'zh' ? '确认' : 'Confirm'}
        cancelText={lang === 'zh' ? '取消' : 'Cancel'}
      />
    </div>
  );
};

export default App;
