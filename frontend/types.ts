export type NodeType = 'kb' | 'folder' | 'doc';

export interface FileNode {
  id: string;
  parentId: string | null;
  title: string;
  type: NodeType;
  content?: string; // Only for 'doc'
  children?: FileNode[]; // For 'kb' and 'folder'
  isOpen?: boolean; // UI state for expansion
  createdAt: number;
}

export interface Annotation {
  id: string;
  docId: string;
  text: string;
  comment: string;
  color: 'yellow' | 'green' | 'red' | 'blue';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
