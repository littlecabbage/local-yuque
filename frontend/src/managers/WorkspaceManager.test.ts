import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkspaceManager } from './WorkspaceManager';

describe('WorkspaceManager', () => {
  let manager: WorkspaceManager;

  beforeEach(async () => {
    manager = WorkspaceManager.getInstance();
    await manager.initialize();
  });

  afterEach(() => {
    manager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = WorkspaceManager.getInstance();
      const instance2 = WorkspaceManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newManager = WorkspaceManager.getInstance();
      newManager.reset();
      
      await newManager.initialize();
      
      expect(newManager.isInitialized()).toBe(true);
    });

    it('should not reinitialize if already initialized', async () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      await manager.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('[WorkspaceManager] Already initialized');
      consoleSpy.mockRestore();
    });

    it('should throw error when accessing collection before initialization', () => {
      const newManager = WorkspaceManager.getInstance();
      newManager.reset();
      
      expect(() => newManager.getCollection()).toThrow(
        '[WorkspaceManager] Not initialized. Call initialize() first.'
      );
    });
  });

  describe('DocCollection Management', () => {
    it('should create DocCollection on initialization', async () => {
      const collection = manager.getCollection();
      
      expect(collection).toBeDefined();
      expect(collection.id).toBe('yueque-workspace');
    });

    it('should return the same collection instance', () => {
      const collection1 = manager.getCollection();
      const collection2 = manager.getCollection();
      
      expect(collection1).toBe(collection2);
    });
  });

  describe('Doc Instance Management', () => {
    it('should create a new doc', () => {
      const docId = 'test-doc-1';
      const doc = manager.getOrCreateDoc(docId);
      
      expect(doc).toBeDefined();
      expect(doc.id).toBe(docId);
    });

    it('should return existing doc if already created', () => {
      const docId = 'test-doc-2';
      const doc1 = manager.getOrCreateDoc(docId);
      const doc2 = manager.getOrCreateDoc(docId);
      
      expect(doc1).toBe(doc2);
    });

    it('should track active doc count', () => {
      expect(manager.getActiveDocCount()).toBe(0);
      
      manager.getOrCreateDoc('doc-1');
      expect(manager.getActiveDocCount()).toBe(1);
      
      manager.getOrCreateDoc('doc-2');
      expect(manager.getActiveDocCount()).toBe(2);
      
      manager.getOrCreateDoc('doc-1'); // Should not increase count
      expect(manager.getActiveDocCount()).toBe(2);
    });

    it('should throw error when creating doc before initialization', () => {
      const newManager = WorkspaceManager.getInstance();
      newManager.reset();
      
      expect(() => newManager.getOrCreateDoc('test-doc')).toThrow(
        '[WorkspaceManager] Not initialized. Call initialize() first.'
      );
    });
  });

  describe('Resource Cleanup', () => {
    it('should dispose a doc', () => {
      const docId = 'test-doc-dispose';
      manager.getOrCreateDoc(docId);
      
      expect(manager.getActiveDocCount()).toBe(1);
      
      manager.disposeDoc(docId);
      
      expect(manager.getActiveDocCount()).toBe(0);
    });

    it('should handle disposing non-existent doc gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      manager.disposeDoc('non-existent-doc');
      
      // Should not throw error
      expect(manager.getActiveDocCount()).toBe(0);
      consoleSpy.mockRestore();
    });

    it('should create new doc instance after disposal', () => {
      const docId = 'test-doc-recreate';
      const doc1 = manager.getOrCreateDoc(docId);
      
      manager.disposeDoc(docId);
      
      const doc2 = manager.getOrCreateDoc(docId);
      
      // Should be different instances
      expect(doc1).not.toBe(doc2);
      expect(doc2.id).toBe(docId);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      manager.getOrCreateDoc('doc-1');
      manager.getOrCreateDoc('doc-2');
      
      expect(manager.getActiveDocCount()).toBe(2);
      expect(manager.isInitialized()).toBe(true);
      
      manager.reset();
      
      expect(manager.getActiveDocCount()).toBe(0);
      expect(manager.isInitialized()).toBe(false);
    });

    it('should allow reinitialization after reset', async () => {
      manager.reset();
      
      await manager.initialize();
      
      expect(manager.isInitialized()).toBe(true);
      
      const doc = manager.getOrCreateDoc('test-doc');
      expect(doc).toBeDefined();
    });
  });
});
