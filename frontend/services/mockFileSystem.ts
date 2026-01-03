import { FileNode } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'yueque_local_data_v2'; // Bumped version to v2 to load new Chinese data

export const loadFileSystem = (): FileNode[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local storage", e);
      return INITIAL_DATA;
    }
  }
  return INITIAL_DATA;
};

export const saveFileSystem = (data: FileNode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Helper to find a node by ID recursively
export const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to update a specific node
export const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, id, content) };
    }
    return node;
  });
};

export const toggleNodeOpen = (nodes: FileNode[], id: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.children) {
      return { ...node, children: toggleNodeOpen(node.children, id) };
    }
    return node;
  });
};
