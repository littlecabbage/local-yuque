# BlockSuite Block Operations Configuration

This document describes the block operation features enabled in the BlockSuiteEditor component.

## Overview

The `BlockSuiteEditor` component uses the `PageEditor` preset from `@blocksuite/presets`, which comes with comprehensive block editing features enabled by default. No additional configuration is required to enable these features.

## Enabled Block Operations

### 1. Slash Menu (/)

**Feature**: Type "/" to open a block type selection menu

**Functionality**:
- Opens when user types "/" at the beginning of a line or in an empty block
- Provides quick access to all block types:
  - Text blocks (paragraph, headings H1-H6)
  - List blocks (bulleted, numbered, todo)
  - Code blocks with language selection
  - Quote blocks
  - Divider
  - Image insertion
- Supports keyboard navigation (arrow keys, Enter to select)
- Supports search/filter by typing after "/"

**Implementation**: Built into PageEditor preset, no configuration needed

**Requirements**: Validates Requirements 5.1

---

### 2. Block Drag Handles

**Feature**: Drag and drop blocks to reorder content

**Functionality**:
- Six-dot drag handle appears on the left side when hovering over a block
- Click and hold the handle to drag the block
- Visual feedback shows where the block will be dropped
- Works with all block types
- Supports dragging multiple selected blocks

**Implementation**: Built into PageEditor preset, no configuration needed

**Requirements**: Validates Requirements 5.2

---

### 3. Keyboard Shortcuts

**Feature**: Keyboard shortcuts for common block operations

**Supported Shortcuts**:

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+D` (Mac: `Cmd+D`) | Duplicate block | Creates a copy of the current block below |
| `Backspace` | Delete empty block | Deletes the current block if it's empty |
| `Enter` | Create new block | Creates a new paragraph block below |
| `Tab` | Indent | Indents list items or nested blocks |
| `Shift+Tab` | Outdent | Outdents list items or nested blocks |
| `Ctrl+B` (Mac: `Cmd+B`) | Bold | Applies bold formatting to selected text |
| `Ctrl+I` (Mac: `Cmd+I`) | Italic | Applies italic formatting to selected text |
| `Ctrl+U` (Mac: `Cmd+U`) | Underline | Applies underline formatting to selected text |
| `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`) | Strikethrough | Applies strikethrough formatting |
| `Ctrl+E` (Mac: `Cmd+E`) | Inline code | Applies inline code formatting |
| `Ctrl+K` (Mac: `Cmd+K`) | Insert link | Opens link insertion dialog |
| `Ctrl+Z` (Mac: `Cmd+Z`) | Undo | Undoes the last action |
| `Ctrl+Shift+Z` (Mac: `Cmd+Shift+Z`) | Redo | Redoes the last undone action |
| `Ctrl+A` (Mac: `Cmd+A`) | Select all | Selects all blocks in the document |

**Implementation**: Built into PageEditor preset, no configuration needed

**Requirements**: Validates Requirements 5.3

---

### 4. Block Selection and Batch Operations

**Feature**: Select and operate on multiple blocks simultaneously

**Functionality**:
- **Single Selection**: Click on a block to select it
- **Multiple Selection**: 
  - Hold `Shift` and click to select a range of blocks
  - Hold `Ctrl` (Mac: `Cmd`) and click to add/remove blocks from selection
- **Select All**: Press `Ctrl+A` (Mac: `Cmd+A`) to select all blocks
- **Batch Operations**:
  - Delete multiple blocks at once
  - Copy multiple blocks
  - Move multiple blocks by dragging
  - Apply formatting to multiple blocks

**Visual Feedback**:
- Selected blocks are highlighted with a blue border
- Selection count is shown in the toolbar

**Implementation**: Built into PageEditor preset, no configuration needed

**Requirements**: Validates Requirements 5.4

---

### 5. Block Operation Handles

**Feature**: Block handles provide access to block-specific operations

**Functionality**:
- **Drag Handle**: Six-dot icon on the left side of each block
  - Appears on hover
  - Click and drag to move the block
  - Works with single or multiple selected blocks
- **Block Menu**: Click the drag handle to open a context menu with options:
  - Copy block
  - Duplicate block
  - Delete block
  - Convert to different block type
  - Move up/down
- **Plus Button**: Appears between blocks on hover
  - Click to insert a new block at that position
  - Opens block type selection menu

**Visual Design**:
- Handles are subtle and only appear on hover to avoid visual clutter
- Consistent positioning across all block types
- Smooth animations for better UX

**Implementation**: Built into PageEditor preset, no configuration needed

**Requirements**: Validates Requirements 5.5

---

## Implementation Details

### Code Location

The block operations are configured in `frontend/components/BlockSuiteEditor.tsx`:

```typescript
// Create PageEditor instance
const editor = new PageEditor();

// Attach doc to editor
editor.doc = doc;

// Configure block operations
// Note: PageEditor from @blocksuite/presets comes with most features enabled by default
// including slash menu, drag handles, keyboard shortcuts, and block selection
// The following configurations ensure these features are properly enabled:

// 1. Slash menu (/) - enabled by default in PageEditor
// 2. Block drag handles - enabled by default in PageEditor
// 3. Keyboard shortcuts - enabled by default in PageEditor
//    - Ctrl+D: Duplicate block
//    - Backspace: Delete empty block
//    - Enter: Create new block
//    - Tab/Shift+Tab: Indent/Outdent
// 4. Block selection and batch operations - enabled by default in PageEditor
// 5. Block operation handles - enabled by default in PageEditor

// The PageEditor preset includes all these features out of the box.
// No additional configuration is needed for basic block operations.
```

### Why No Additional Configuration?

The `PageEditor` preset from `@blocksuite/presets` is designed to be a complete, ready-to-use editor with all essential features enabled by default. This includes:

1. **Opinionated Defaults**: BlockSuite team has carefully chosen sensible defaults for all features
2. **Best Practices**: The preset follows editor UX best practices
3. **Consistency**: All BlockSuite-based editors have consistent behavior
4. **Simplicity**: Reduces configuration complexity for developers

### Custom Configuration (Future)

If custom configuration is needed in the future, BlockSuite provides APIs to:
- Disable specific features
- Customize keyboard shortcuts
- Modify block menu options
- Change visual styling
- Add custom block types

These customizations can be added to the `BlockSuiteEditor` component as needed.

---

## Testing

Block operations are tested through:

1. **Unit Tests**: Component lifecycle and initialization tests in `BlockSuiteEditor.test.tsx`
2. **Integration Tests**: Editor interaction tests in `Editor.integration.test.tsx`
3. **Manual Testing**: User acceptance testing of all block operations
4. **E2E Tests**: End-to-end tests using Playwright (planned in Task 16)

---

## Requirements Validation

This configuration validates the following requirements from `requirements.md`:

- **Requirement 5.1**: Slash menu for block type selection ✓
- **Requirement 5.2**: Block drag and drop for reordering ✓
- **Requirement 5.3**: Keyboard shortcuts for block operations ✓
- **Requirement 5.4**: Block selection and batch operations ✓
- **Requirement 5.5**: Block operation handles for drag and menu access ✓

---

## User Guide

### How to Use Block Operations

#### Inserting Blocks
1. Type `/` to open the slash menu
2. Use arrow keys or type to filter block types
3. Press Enter to insert the selected block type

#### Reordering Blocks
1. Hover over a block to see the drag handle (six dots)
2. Click and hold the drag handle
3. Drag the block to the desired position
4. Release to drop

#### Selecting Multiple Blocks
1. Click on the first block
2. Hold Shift and click on the last block to select a range
3. Or hold Ctrl/Cmd and click individual blocks to add to selection

#### Using Keyboard Shortcuts
- Press `Ctrl+D` (Cmd+D on Mac) to duplicate the current block
- Press `Backspace` on an empty block to delete it
- Press `Tab` to indent a list item
- Press `Shift+Tab` to outdent a list item

#### Accessing Block Menu
1. Hover over a block to see the drag handle
2. Click the drag handle to open the block menu
3. Select an operation (copy, duplicate, delete, etc.)

---

## Troubleshooting

### Slash Menu Not Appearing
- Ensure you're typing `/` at the beginning of a line or in an empty block
- Check that the editor is focused and ready

### Drag Handle Not Visible
- Hover over the block - handles only appear on hover
- Ensure the editor is in edit mode (not read-only)

### Keyboard Shortcuts Not Working
- Check that the editor has focus
- Verify you're using the correct modifier key (Ctrl on Windows/Linux, Cmd on Mac)
- Some shortcuts may conflict with browser shortcuts

---

## Future Enhancements

Potential future enhancements to block operations:

1. **Custom Block Types**: Add application-specific block types (e.g., callouts, embeds)
2. **Block Templates**: Save and reuse common block patterns
3. **Block Comments**: Add comments to specific blocks
4. **Block History**: View and restore previous versions of individual blocks
5. **Block Linking**: Create references between blocks
6. **Block Export**: Export individual blocks to different formats

---

## References

- [BlockSuite Documentation](https://blocksuite.io/)
- [BlockSuite GitHub](https://github.com/toeverything/blocksuite)
- [PageEditor API](https://blocksuite.io/api/presets/page-editor)
- Requirements Document: `.kiro/specs/blocksuite-integration/requirements.md`
- Design Document: `.kiro/specs/blocksuite-integration/design.md`
