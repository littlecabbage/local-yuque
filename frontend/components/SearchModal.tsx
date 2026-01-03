import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ArrowUp, ArrowDown, CornerDownLeft, X, BookOpen, Folder } from 'lucide-react';
import { FileNode } from '../types';
import clsx from 'clsx';
import { api } from '../services/api';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: FileNode[]; // Kept for interface compatibility or fallback
    onNavigate: (node: FileNode) => void;
    lang: 'zh' | 'en';
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, nodes, onNavigate, lang }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ node: FileNode; path: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Search via API
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const data = await api.search(query);
                // Backend currently returns a flattened list of nodes.
                // We map them to the structure expected by the UI.
                setResults(data.map(node => ({ node, path: '' })));
            } catch (e) {
                console.error("Search failed", e);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all relative flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={lang === 'zh' ? "搜索内容，或输入 > 唤醒更多" : "Search content..."}
                        className="flex-1 text-lg text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                    />
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">ESC</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    {query.trim() === '' ? (
                        <div className="px-4 py-8 text-gray-400 text-sm">
                            <div className="mb-2 font-medium px-2">{lang === 'zh' ? '最近访问' : 'Recent'}</div>
                            <div className="flex flex-col space-y-1">
                                <div className="text-xs text-gray-400 px-2 italic">{lang === 'zh' ? '输入关键词开始搜索...' : 'Type to start searching...'}</div>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-12 text-center text-gray-500">
                            {lang === 'zh' ? '没有找到相关结果' : 'No results found'}
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((res, idx) => (
                                <div
                                    key={`${res.node.id}-${idx}`}
                                    onClick={() => { onNavigate(res.node); onClose(); }}
                                    className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex items-center group border-l-2 border-transparent hover:border-primary-500"
                                >
                                    <div className="mr-3 text-gray-400 group-hover:text-primary-600">
                                        {res.node.type === 'doc' ? <FileText size={18} /> : res.node.type === 'folder' ? <Folder size={18} /> : <BookOpen size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800 group-hover:text-primary-700 truncate">{res.node.title}</span>
                                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{new Date(res.node.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5 truncate flex items-center">
                                            <span className="bg-gray-100 rounded px-1 py-0.5 mr-2 max-w-[150px] truncate">{res.path || (lang === 'zh' ? '结果' : 'Result')}</span>
                                            {res.node.content && (
                                                <span>{res.node.content.slice(0, 50).replace(/[#*`]/g, '')}...</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-3 opacity-0 group-hover:opacity-100 text-gray-400">
                                        <CornerDownLeft size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                        <span className="flex items-center"><ArrowUp size={12} className="mr-1" /><ArrowDown size={12} className="mr-1" /> {lang === 'zh' ? '切换选择' : 'Navigate'}</span>
                        <span className="flex items-center"><CornerDownLeft size={12} className="mr-1" /> {lang === 'zh' ? '跳转' : 'Open'}</span>
                    </div>
                    <div>Yueque Search</div>
                </div>

            </div>
        </div>
    );
};
