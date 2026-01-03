# Requirements Document

## Introduction

本文档定义了将 BlockSuite 编辑器框架集成到现有本地知识库应用（Yueque）的需求。BlockSuite 是一个用于构建编辑器和协作应用的工具包，提供了丰富的内容编辑基础设施、UI 组件和编辑器。通过引入 BlockSuite，我们将替换当前简单的 Markdown 编辑器，提供更强大的块编辑、协作能力和扩展性。

## Glossary

- **BlockSuite**: 由 toeverything 开发的编辑器工具包，用于构建块状编辑器和协作应用
- **Editor**: 编辑器组件，负责文档内容的编辑和渲染
- **Block**: 块，BlockSuite 中的基本内容单元（段落、标题、代码块等）
- **Workspace**: BlockSuite 中的工作空间概念，包含多个文档
- **Document**: 文档，包含块状内容的单个文件
- **Store**: BlockSuite 的数据层，基于 CRDT（Yjs）实现协作和版本控制
- **PageEditor**: BlockSuite 提供的页面编辑器预设组件
- **EdgelessEditor**: BlockSuite 提供的画板编辑器预设组件
- **Frontend**: React + TypeScript 前端应用
- **Backend**: FastAPI + Python 后端服务
- **Storage_Service**: 后端存储服务，负责文件系统操作

## Requirements

### Requirement 1: BlockSuite 核心集成

**User Story:** 作为开发者，我想要在项目中集成 BlockSuite 核心包，以便使用其编辑器功能。

#### Acceptance Criteria

1. THE Frontend SHALL install and configure @blocksuite/presets, @blocksuite/blocks, and @blocksuite/store packages
2. THE Frontend SHALL create a BlockSuite workspace instance for managing documents
3. THE Frontend SHALL initialize the BlockSuite store with proper configuration
4. WHEN the application starts, THE Frontend SHALL load BlockSuite dependencies without errors
5. THE Frontend SHALL expose BlockSuite workspace instance for document operations

### Requirement 2: 编辑器组件替换

**User Story:** 作为用户，我想要使用 BlockSuite 编辑器编辑文档，以便获得更丰富的编辑体验。

#### Acceptance Criteria

1. THE Frontend SHALL replace the current Markdown textarea with BlockSuite PageEditor component
2. WHEN a document is opened, THE Editor SHALL render the document content using BlockSuite
3. WHEN a user edits content, THE Editor SHALL update the BlockSuite document state
4. THE Editor SHALL support all basic block types (paragraph, heading, list, code block, image)
5. THE Editor SHALL maintain the current UI layout (toolbar, breadcrumbs, action buttons)
6. WHEN switching between documents, THE Editor SHALL properly cleanup and reinitialize BlockSuite instances

### Requirement 3: 数据格式转换

**User Story:** 作为系统，我需要在 Markdown 和 BlockSuite 格式之间转换，以便保持向后兼容性。

#### Acceptance Criteria

1. WHEN loading a Markdown document, THE System SHALL convert Markdown content to BlockSuite document format
2. WHEN saving a document, THE System SHALL convert BlockSuite document to Markdown format for storage
3. THE Converter SHALL preserve document structure (headings, lists, code blocks, links, images)
4. THE Converter SHALL handle edge cases (empty documents, special characters, nested structures)
5. WHEN conversion fails, THE System SHALL log errors and provide fallback behavior

### Requirement 4: 文档持久化

**User Story:** 作为用户，我想要编辑的内容自动保存，以便不丢失工作成果。

#### Acceptance Criteria

1. WHEN a user edits content, THE Editor SHALL debounce save operations (e.g., 1 second delay)
2. WHEN content changes, THE System SHALL serialize BlockSuite document to storage format
3. THE Backend SHALL save the serialized document to the file system
4. WHEN save succeeds, THE Frontend SHALL update UI to show "Saved" status
5. WHEN save fails, THE Frontend SHALL show error notification and retry

### Requirement 5: 块编辑功能

**User Story:** 作为用户，我想要使用块编辑功能（拖拽、快捷键、斜杠命令），以便高效组织内容。

#### Acceptance Criteria

1. WHEN a user types "/", THE Editor SHALL show block type selection menu
2. WHEN a user drags a block, THE Editor SHALL allow reordering blocks
3. THE Editor SHALL support keyboard shortcuts for block operations (Ctrl+D duplicate, Backspace delete empty block)
4. WHEN a user selects multiple blocks, THE Editor SHALL allow batch operations
5. THE Editor SHALL show block handles for drag and menu access

### Requirement 6: 富文本格式支持

**User Story:** 作为用户，我想要使用富文本格式（粗体、斜体、链接、代码），以便丰富文档表现力。

#### Acceptance Criteria

1. THE Editor SHALL support inline formatting (bold, italic, underline, strikethrough, code)
2. WHEN a user selects text, THE Editor SHALL show formatting toolbar
3. THE Editor SHALL support keyboard shortcuts for formatting (Ctrl+B bold, Ctrl+I italic)
4. THE Editor SHALL support link creation and editing
5. THE Editor SHALL support syntax highlighting for inline code

### Requirement 7: 代码块支持

**User Story:** 作为用户，我想要插入和编辑代码块，以便记录技术内容。

#### Acceptance Criteria

1. THE Editor SHALL support code block insertion with language selection
2. THE Editor SHALL provide syntax highlighting for common programming languages
3. WHEN a user types in a code block, THE Editor SHALL preserve indentation and formatting
4. THE Editor SHALL support line numbers in code blocks
5. THE Editor SHALL allow copying code block content

### Requirement 8: 图片和附件支持

**User Story:** 作为用户，我想要插入图片和附件，以便丰富文档内容。

#### Acceptance Criteria

1. WHEN a user drags an image file, THE Editor SHALL upload and insert the image
2. THE Editor SHALL support image resizing and alignment
3. THE Backend SHALL store uploaded images in the document's attachment directory
4. THE Editor SHALL display image upload progress
5. WHEN image upload fails, THE Editor SHALL show error message

### Requirement 9: 协作基础设施

**User Story:** 作为开发者，我想要保留 BlockSuite 的协作能力，以便未来支持多人编辑。

#### Acceptance Criteria

1. THE System SHALL use BlockSuite's Yjs-based store for document state management
2. THE System SHALL preserve document version history through Yjs snapshots
3. THE System SHALL expose APIs for future collaboration provider integration
4. THE Document_Store SHALL support undo/redo operations through Yjs
5. THE System SHALL handle concurrent edits gracefully (even if only local for now)

### Requirement 10: 性能优化

**User Story:** 作为用户，我想要编辑器快速响应，以便流畅的编辑体验。

#### Acceptance Criteria

1. WHEN opening a document, THE Editor SHALL render within 500ms for documents under 10,000 characters
2. THE Editor SHALL use virtual scrolling for large documents (over 1000 blocks)
3. THE System SHALL lazy-load BlockSuite components to reduce initial bundle size
4. THE Editor SHALL debounce expensive operations (save, search, format)
5. WHEN switching documents, THE System SHALL properly dispose of previous editor instances to prevent memory leaks

### Requirement 11: 向后兼容性

**User Story:** 作为用户，我想要现有的 Markdown 文档能够正常打开，以便不丢失已有内容。

#### Acceptance Criteria

1. WHEN opening an existing Markdown document, THE System SHALL successfully convert and display it
2. THE System SHALL preserve all existing document metadata (title, created_at, updated_at)
3. THE System SHALL maintain the existing file structure and naming conventions
4. WHEN a conversion issue occurs, THE System SHALL log the error and show the original Markdown as fallback
5. THE System SHALL support exporting documents back to Markdown format

### Requirement 12: UI 集成

**User Story:** 作为用户，我想要 BlockSuite 编辑器与现有 UI 风格一致，以便获得统一的用户体验。

#### Acceptance Criteria

1. THE Editor SHALL use the application's existing color scheme and typography
2. THE Editor SHALL integrate with the existing toolbar and action buttons
3. THE Editor SHALL maintain the current breadcrumb navigation
4. THE Editor SHALL support the existing light/dark theme switching
5. THE Editor SHALL fit within the current three-panel layout (sidebar, editor, AI panel)

### Requirement 13: 错误处理

**User Story:** 作为用户，我想要在出错时看到清晰的错误信息，以便了解问题并采取行动。

#### Acceptance Criteria

1. WHEN BlockSuite initialization fails, THE System SHALL show user-friendly error message
2. WHEN document loading fails, THE System SHALL offer retry option
3. WHEN save fails, THE System SHALL preserve unsaved changes and show notification
4. THE System SHALL log all errors to console for debugging
5. WHEN a critical error occurs, THE System SHALL provide fallback to simple text editor

### Requirement 14: 测试覆盖

**User Story:** 作为开发者，我想要有完善的测试覆盖，以便确保重构质量。

#### Acceptance Criteria

1. THE System SHALL have unit tests for Markdown conversion functions
2. THE System SHALL have integration tests for editor initialization and document operations
3. THE System SHALL have tests for save/load workflows
4. THE System SHALL have tests for error handling scenarios
5. THE System SHALL maintain at least 70% code coverage for new BlockSuite integration code
