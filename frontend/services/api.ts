import { FileNode } from '../types';

const API_BASE = '/api';

export const api = {
    async getTree(): Promise<FileNode[]> {
        const res = await fetch(`${API_BASE}/kb`);
        if (!res.ok) throw new Error('Failed to fetch tree');
        return res.json();
    },

    async getFileContent(id: string): Promise<string> {
        const res = await fetch(`${API_BASE}/files/${id}`);
        if (!res.ok) throw new Error('Failed to fetch file content');
        const data = await res.json();
        return data.content;
    },

    async saveFile(id: string, content: string): Promise<void> {
        const res = await fetch(`${API_BASE}/files/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error('Failed to save file');
    },

    async createNode(parentId: string | null, type: 'kb' | 'folder' | 'doc', title: string): Promise<FileNode> {
        const res = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentId, type, title }),
        });
        if (!res.ok) throw new Error('Failed to create node');
        const data = await res.json();
        return data.node; // Backend returns { success: true, node: ... }
    },

    async deleteNode(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/delete/${id}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to delete node');
    },

    async renameNode(id: string, title: string): Promise<FileNode> {
        const res = await fetch(`${API_BASE}/rename/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error('Failed to rename node');
        const data = await res.json();
        return data.node;
    },

    async search(query: string): Promise<FileNode[]> {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to search');
        return res.json();
    }
};
