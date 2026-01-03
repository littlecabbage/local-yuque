# Design Document: BlockSuite Integration

## Overview

本设计文档描述了如何将 BlockSuite 编辑器框架集成到现有的 Yueque 本地知识库应用中。BlockSuite 是一个基于 Web Components 和 Yjs CRDT 的现代编辑器工具包，提供了丰富的块编辑能力、协作基础设施和扩展性。

集成的核心目标是：
1. 用 BlockSuite 的 PageEditor 替换当前简单的 Markdown textarea 编辑器
2. 保持与现有 Markdown 文件格式的兼容性
3. 提供更丰富的编辑体验（块操作、富文本、拖拽等）
4. 为未来的协作功能奠定基础
5. 保持现有 UI 布局和用户体验的连续性

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sidebar    │  │    Editor    │  │   AI Panel   │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  BlockSuite    │                        │
│                    │  Integration   │                        │
│                    │    Layer       │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼──────┐      │
│    │BlockSuite│    │  Markdown   │    │  Document  │      │
│    │Workspace │    │  Converter  │    │  Manager   │      │
│    │ Manager  │    │             │    │            │      │
│    └────┬─────┘    └──────┬──────┘    └─────┬──────┘      │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │   API Service  │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Backend API    │
                    │   (FastAPI)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  File System    │
                    │  Storage        │
                    └─────────────────┘
```

### Component Interaction Flow

1. **Document Loading**:
   - User clicks document in sidebar
   - Frontend fetches Markdown content from backend
   - Markdown Converter transforms to BlockSuite format
   - BlockSuite Workspace Manager creates/updates doc
   - PageEditor renders the document

2. **Document Editing**:
   - User edits content in PageEditor
   - BlockSuite updates internal Yjs document
   - Document Manager listens to changes
   - Debounced save triggers conversion to Markdown
   - API Service sends Markdown to backend
   - Backend persists to file system

3. **Document Switching**:
   - User selects different document
   - Current editor instance is properly disposed
   - New document loading flow begins

## Components and Interfaces

### 1. BlockSuite Workspace Manager

**Responsibility**: 管理 BlockSuite 的 DocCollection 和 Doc 实例生命周期

**Interface**:
```typescript
interface BlockSuiteWorkspaceManager {
  // Initialize the workspace with schema
  initialize(): Promise<void>;
  
  // Create or get a doc by ID
  getOrCreateDoc(docId: string): Doc;
  
  // Load document content into a doc
  loadDocContent(docId: string, blocks: BlockSnapshot[]): Promise<void>;
  
  // Export doc to snapshot format
  exportDocSnapshot(docId: string): Promise<BlockSnapshot[]>;
  
  // Dispose a doc and cleanup resources
  disposeDoc(docId: string): void;
  
  // Get the collection instance
  getCollection(): DocCollection;
}
```

**Key Responsibilities**:
- 维护单例 DocCollection 实例
- 管理多个 Doc 实例的创建和销毁
- 处理 Doc 的初始化和加载
- 提供 Doc 访问接口给其他组件

### 2. Markdown Converter

**Responsibility**: 在 Markdown 和 BlockSuite 格式之间转换

**Interface**:
```typescript
interface MarkdownConverter {
  // Convert Markdown string to BlockSuite blocks
  markdownToBlocks(markdown: string): Promise<BlockSnapshot[]>;
  
  // Convert BlockSuite blocks to Markdown string
  blocksToMarkdown(blocks: BlockSnapshot[]): Promise<string>;
  
  // Convert Markdown to BlockSuite doc directly
  markdownToDoc(markdown: string, doc: Doc): Promise<void>;
  
  // Convert BlockSuite doc to Markdown directly
  docToMarkdown(doc: Doc): Promise<string>;
}

interface BlockSnapshot {
  flavour: string;  // e.g., 'affine:paragraph', 'affine:heading'
  props: Record<string, any>;
  children: BlockSnapshot[];
}
```

**Conversion Strategy**:

使用 BlockSuite 提供的 `MarkdownTransformer` API（来自 `@blocksuite/affine-block-root`）:

```typescript
import { MarkdownTransformer } from '@blocksuite/affine-block-root';

// Import Markdown to Doc
await MarkdownTransformer.importMarkdownToDoc({
  collection,
  doc,
  markdown: markdownString
});

// Export Doc to Markdown
const markdown = await MarkdownTransformer.exportDoc(doc);
```

**Fallback Strategy**: 如果 BlockSuite 的转换器不可用或失败，实现简单的自定义转换器：

- Markdown → Blocks: 使用 `marked` 库解析 Markdown AST，然后映射到 BlockSuite block flavours
- Blocks → Markdown: 遍历 block tree，根据 flavour 生成对应的 Markdown 语法

### 3. Document Manager

**Responsibility**: 协调文档的加载、保存和状态管理

**Interface**:
```typescript
interface DocumentManager {
  // Load a document by ID
  loadDocument(docId: string): Promise<void>;
  
  // Save current document
  saveDocument(docId: string): Promise<void>;
  
  // Subscribe to document changes
  onDocumentChange(docId: string, callback: (content: string) => void): () => void;
  
  // Get current document state
  getCurrentDoc(): Doc | null;
  
  // Dispose current document
  disposeCurrentDoc(): void;
}
```

**Key Features**:
- 自动保存：使用 debounce（1秒延迟）监听 Doc 变化
- 错误处理：保存失败时重试机制（最多3次）
- 状态管理：跟踪文档的加载、保存、错误状态
- 内存管理：切换文档时正确清理旧的 Doc 实例

### 4. BlockSuite Editor Component

**Responsibility**: React 组件包装 BlockSuite PageEditor Web Component

**Interface**:
```typescript
interface BlockSuiteEditorProps {
  docId: string;
  onContentChange?: (content: string) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'error') => void;
  className?: string;
}

const BlockSuiteEditor: React.FC<BlockSuiteEditorProps>;
```

**Implementation Details**:
```typescript
import { PageEditor } from '@blocksuite/presets';
import { useEffect, useRef } from 'react';

const BlockSuiteEditor: React.FC<BlockSuiteEditorProps> = ({ 
  docId, 
  onContentChange,
  onSaveStatusChange 
}) => {
  const editorRef = useRef<PageEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create editor instance
    const editor = new PageEditor();
    
    // Get doc from workspace manager
    const doc = workspaceManager.getOrCreateDoc(docId);
    
    // Attach doc to editor
    editor.doc = doc;
    
    // Mount editor
    containerRef.current.appendChild(editor);
    editorRef.current = editor;
    
    // Setup change listener
    const unsubscribe = doc.slots.blockUpdated.on(() => {
      // Debounced save logic
      debouncedSave(docId);
    });
    
    return () => {
      unsubscribe();
      editor.remove();
      editorRef.current = null;
    };
  }, [docId]);
  
  return <div ref={containerRef} className={className} />;
};
```

### 5. Editor Component Refactoring

**Current State**: `Editor.tsx` 使用 textarea 和 ReactMarkdown 进行编辑和预览

**New State**: 集成 BlockSuiteEditor 组件

**Changes**:
```typescript
// Before
<textarea value={content} onChange={handleChange} />
<ReactMarkdown>{content}</ReactMarkdown>

// After
<BlockSuiteEditor 
  docId={node.id}
  onContentChange={handleContentChange}
  onSaveStatusChange={handleSaveStatus}
/>
```

**Preserved Features**:
- 顶部导航栏（面包屑、操作按钮）
- 工具栏（格式化按钮、模式切换）
- AI 助手集成按钮
- 保存状态显示

**Removed Features**:
- 编辑/预览/分屏模式切换（BlockSuite 提供所见即所得编辑）
- Markdown textarea
- ReactMarkdown 预览

## Data Models

### BlockSuite Document Structure

BlockSuite 文档是一个树状结构，根节点是 `affine:page`，包含多个子块：

```typescript
// Document structure
{
  flavour: 'affine:page',
  props: {
    title: { $blocksuite:internal:text$: true, delta: [...] }
  },
  children: [
    {
      flavour: 'affine:surface',  // For edgeless mode
      props: {},
      children: []
    },
    {
      flavour: 'affine:note',  // Container for page content
      props: {},
      children: [
        {
          flavour: 'affine:paragraph',
          props: {
            type: 'text',
            text: { $blocksuite:internal:text$: true, delta: [...] }
          },
          children: []
        },
        {
          flavour: 'affine:heading',
          props: {
            type: 'h1',
            text: { $blocksuite:internal:text$: true, delta: [...] }
          },
          children: []
        },
        {
          flavour: 'affine:list',
          props: {
            type: 'bulleted',
            text: { $blocksuite:internal:text$: true, delta: [...] },
            checked: false
          },
          children: []
        },
        {
          flavour: 'affine:code',
          props: {
            language: 'typescript',
            text: { $blocksuite:internal:text$: true, delta: [...] }
          },
          children: []
        }
      ]
    }
  ]
}
```

### Markdown Storage Format

文档在文件系统中仍然以 Markdown 格式存储：

```markdown
# Document Title

This is a paragraph with **bold** and *italic* text.

## Heading 2

- Bullet point 1
- Bullet point 2

```typescript
const code = 'example';
```

![Image](./attachments/image.png)
```

### Metadata Storage

文档元数据存储在数据库中（SQLite），包括：

```python
class Document(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    kb_id: str
    parent_id: Optional[str]
    type: str  # 'doc', 'folder', 'kb'
    created_at: datetime
    updated_at: datetime
    content_path: str  # Path to markdown file
```

## Correctness Properties

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: Markdown Round-Trip Consistency

*For any* valid Markdown document, converting it to BlockSuite format and then back to Markdown should produce semantically equivalent content (preserving structure, formatting, and content).

**Validates: Requirements 3.1, 3.2, 3.3**

**Rationale**: 这是一个经典的往返属性（round-trip property）。由于我们需要在 Markdown 和 BlockSuite 之间转换，确保往返一致性是验证转换器正确性的最重要方式。

**Test Strategy**: 生成各种 Markdown 文档（包含标题、列表、代码块、链接、图片等），转换为 BlockSuite 再转回 Markdown，验证内容等价性。

### Property 2: Document Save Preserves Content

*For any* document edit operation, after the save completes successfully, reloading the document should show the same content that was saved.

**Validates: Requirements 4.1, 4.2, 4.3**

**Rationale**: 这是一个持久化一致性属性。用户编辑后保存，重新加载应该看到相同的内容。

**Test Strategy**: 创建随机文档内容，保存，清除内存中的状态，重新加载，验证内容一致。

### Property 3: Block Operations Preserve Document Validity

*For any* valid BlockSuite document, performing block operations (add, delete, move, update) should result in another valid BlockSuite document.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

**Rationale**: 这是一个不变量属性（invariant property）。文档的有效性应该在所有块操作后保持。

**Test Strategy**: 生成随机有效文档，执行随机块操作序列，验证结果文档仍然有效（符合 schema，block tree 结构正确）。

### Property 4: Editor Cleanup Prevents Memory Leaks

*For any* sequence of document switches, the total number of active Doc instances should never exceed the number of currently open documents.

**Validates: Requirements 10.5**

**Rationale**: 这是一个资源管理属性。切换文档时必须正确清理旧实例，否则会导致内存泄漏。

**Test Strategy**: 模拟多次文档切换，监控 Doc 实例数量和内存使用，验证没有泄漏。

### Property 5: Conversion Handles Edge Cases

*For any* Markdown document containing edge cases (empty content, special characters, nested structures, malformed syntax), the converter should either successfully convert or fail gracefully with clear error messages.

**Validates: Requirements 3.4, 13.1, 13.2**

**Rationale**: 这是一个错误处理属性。转换器应该健壮地处理各种边缘情况。

**Test Strategy**: 生成包含边缘情况的 Markdown 文档（空文档、特殊字符、深度嵌套、格式错误等），验证转换器不会崩溃且提供有用的错误信息。

### Property 6: Concurrent Edits Are Handled Correctly

*For any* sequence of edit operations on a document, the final state should be consistent regardless of the order of operations (within the constraints of Yjs CRDT semantics).

**Validates: Requirements 9.4, 9.5**

**Rationale**: 这是一个汇合属性（confluence property）。虽然当前是单用户，但 Yjs 的 CRDT 特性应该确保操作顺序不影响最终一致性。

**Test Strategy**: 生成随机编辑操作序列，以不同顺序应用，验证最终状态一致（考虑 CRDT 的合并语义）。

### Property 7: Image Upload Preserves References

*For any* image uploaded to a document, the image reference in the document should correctly point to the stored image file.

**Validates: Requirements 8.1, 8.2, 8.3**

**Rationale**: 这是一个引用完整性属性。上传的图片必须正确存储，且文档中的引用必须有效。

**Test Strategy**: 上传随机图片，验证文件存储成功，文档中的引用路径正确，且可以加载显示图片。

### Property 8: Backward Compatibility with Existing Documents

*For any* existing Markdown document in the system, opening it with the new BlockSuite editor should successfully display the content without data loss.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

**Rationale**: 这是一个向后兼容性属性。现有文档必须能够无缝迁移到新编辑器。

**Test Strategy**: 收集现有的各种 Markdown 文档，用新编辑器打开，验证内容正确显示且没有丢失。

## Error Handling

### Error Categories

1. **Initialization Errors**
   - BlockSuite 包加载失败
   - Schema 注册失败
   - DocCollection 创建失败

2. **Conversion Errors**
   - Markdown 解析失败
   - BlockSuite 格式无效
   - 不支持的 Markdown 语法

3. **Persistence Errors**
   - 网络请求失败
   - 文件系统写入失败
   - 权限错误

4. **Runtime Errors**
   - 编辑器崩溃
   - 内存不足
   - 浏览器兼容性问题

### Error Handling Strategy

```typescript
// Error handling wrapper
class BlockSuiteErrorHandler {
  static async handleInitError(error: Error): Promise<void> {
    console.error('[BlockSuite Init]', error);
    
    // Show user-friendly message
    showNotification({
      type: 'error',
      title: 'Editor initialization failed',
      message: 'Please refresh the page. If the problem persists, contact support.',
      action: { label: 'Refresh', onClick: () => window.location.reload() }
    });
    
    // Log to monitoring service
    logError('blocksuite_init_error', error);
  }
  
  static async handleConversionError(error: Error, markdown: string): Promise<string> {
    console.error('[Markdown Conversion]', error);
    
    // Fallback to plain text editor
    showNotification({
      type: 'warning',
      title: 'Document format conversion failed',
      message: 'Falling back to plain text mode.',
    });
    
    // Return original markdown for fallback editor
    return markdown;
  }
  
  static async handleSaveError(error: Error, retryCount: number): Promise<void> {
    console.error('[Document Save]', error, { retryCount });
    
    if (retryCount < 3) {
      // Retry with exponential backoff
      await delay(Math.pow(2, retryCount) * 1000);
      return; // Caller will retry
    }
    
    // Max retries reached
    showNotification({
      type: 'error',
      title: 'Failed to save document',
      message: 'Your changes are preserved locally. Please check your connection and try again.',
      action: { label: 'Retry', onClick: () => triggerManualSave() }
    });
    
    // Store unsaved changes in localStorage as backup
    storeUnsavedChanges(getCurrentDocId(), getCurrentContent());
  }
}
```

### Fallback Mechanisms

1. **Editor Fallback**: 如果 BlockSuite 初始化失败，回退到简单的 textarea 编辑器
2. **Conversion Fallback**: 如果转换失败，显示原始 Markdown 文本
3. **Save Fallback**: 如果保存失败，将内容存储在 localStorage 中
4. **Recovery**: 应用启动时检查 localStorage 中的未保存更改，提示用户恢复

## Testing Strategy

### Unit Tests

使用 Vitest 进行单元测试，覆盖以下模块：

1. **Markdown Converter Tests**
   - 测试各种 Markdown 语法的转换
   - 测试边缘情况（空文档、特殊字符、嵌套结构）
   - 测试错误处理

2. **Workspace Manager Tests**
   - 测试 Doc 创建和销毁
   - 测试 Doc 加载和导出
   - 测试资源清理

3. **Document Manager Tests**
   - 测试文档加载流程
   - 测试自动保存逻辑
   - 测试错误重试机制

### Property-Based Tests

使用 `fast-check` 库进行基于属性的测试，每个测试运行至少 100 次迭代：

1. **Property 1: Markdown Round-Trip**
   ```typescript
   // Feature: blocksuite-integration, Property 1: Markdown Round-Trip Consistency
   test('markdown round-trip preserves content', async () => {
     await fc.assert(
       fc.asyncProperty(
         arbitraryMarkdown(),
         async (markdown) => {
           const blocks = await converter.markdownToBlocks(markdown);
           const result = await converter.blocksToMarkdown(blocks);
           expect(normalizeMarkdown(result)).toEqual(normalizeMarkdown(markdown));
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

2. **Property 2: Save-Load Consistency**
   ```typescript
   // Feature: blocksuite-integration, Property 2: Document Save Preserves Content
   test('saved document can be reloaded with same content', async () => {
     await fc.assert(
       fc.asyncProperty(
         arbitraryBlockContent(),
         async (content) => {
           const docId = await createAndSaveDoc(content);
           const reloaded = await loadDoc(docId);
           expect(reloaded).toEqual(content);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

3. **Property 3: Block Operations Validity**
   ```typescript
   // Feature: blocksuite-integration, Property 3: Block Operations Preserve Document Validity
   test('block operations maintain document validity', async () => {
     await fc.assert(
       fc.asyncProperty(
         arbitraryValidDoc(),
         arbitraryBlockOperations(),
         async (doc, operations) => {
           const result = applyOperations(doc, operations);
           expect(isValidDoc(result)).toBe(true);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

### Integration Tests

使用 Playwright 进行端到端测试：

1. **Document Lifecycle Test**
   - 创建新文档
   - 编辑内容
   - 保存
   - 关闭
   - 重新打开
   - 验证内容一致

2. **Editor Interaction Test**
   - 测试块操作（添加、删除、移动）
   - 测试富文本格式化
   - 测试图片上传
   - 测试撤销/重做

3. **Error Recovery Test**
   - 模拟网络错误
   - 验证错误提示
   - 验证重试机制
   - 验证本地备份

### Performance Tests

1. **Load Time**: 文档打开时间 < 500ms（10,000 字符以下）
2. **Save Time**: 保存操作 < 200ms
3. **Memory Usage**: 切换 10 个文档后内存增长 < 50MB
4. **Bundle Size**: BlockSuite 相关代码增加 < 500KB（gzipped）

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

## Implementation Notes

### Package Dependencies

```json
{
  "dependencies": {
    "@blocksuite/presets": "^0.20.0",
    "@blocksuite/blocks": "^0.20.0",
    "@blocksuite/store": "^0.20.0",
    "yjs": "^13.6.0"
  },
  "devDependencies": {
    "fast-check": "^3.15.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0"
  }
}
```

### Migration Strategy

1. **Phase 1: Parallel Implementation**
   - 在新分支实现 BlockSuite 集成
   - 保持现有编辑器功能不变
   - 添加功能开关，允许在两个编辑器之间切换

2. **Phase 2: Testing and Refinement**
   - 运行完整测试套件
   - 修复发现的问题
   - 性能优化

3. **Phase 3: Gradual Rollout**
   - 默认使用 BlockSuite 编辑器
   - 保留旧编辑器作为后备
   - 收集用户反馈

4. **Phase 4: Cleanup**
   - 移除旧编辑器代码
   - 清理未使用的依赖
   - 更新文档

### Performance Optimization

1. **Lazy Loading**: 使用 React.lazy 和 dynamic import 延迟加载 BlockSuite
2. **Code Splitting**: 将 BlockSuite 相关代码分离到独立 chunk
3. **Memoization**: 使用 React.memo 和 useMemo 避免不必要的重渲染
4. **Debouncing**: 对保存、搜索等操作进行防抖处理
5. **Virtual Scrolling**: 对大文档使用虚拟滚动

### Browser Compatibility

- Chrome/Edge: >= 90
- Firefox: >= 88
- Safari: >= 14
- 不支持 IE11

### Accessibility

- 确保 BlockSuite 编辑器支持键盘导航
- 提供 ARIA 标签
- 支持屏幕阅读器
- 保持足够的颜色对比度

## Security Considerations

1. **XSS Prevention**: 确保 Markdown 转换过程中正确转义 HTML
2. **File Upload**: 验证上传文件类型和大小
3. **Path Traversal**: 验证文件路径，防止目录遍历攻击
4. **Content Sanitization**: 使用 DOMPurify 清理用户输入的 HTML

## Future Enhancements

1. **Real-time Collaboration**: 集成 WebSocket 或 WebRTC 实现多人协作
2. **Version History**: 利用 Yjs 的快照功能实现版本历史
3. **Edgeless Mode**: 支持 BlockSuite 的画板模式
4. **Custom Blocks**: 开发自定义块类型（如思维导图、流程图）
5. **Offline Support**: 使用 Service Worker 实现离线编辑
6. **Export Formats**: 支持导出为 PDF、HTML、Word 等格式
