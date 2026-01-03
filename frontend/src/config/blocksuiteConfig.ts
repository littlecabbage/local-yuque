/**
 * BlockSuite Editor Configuration
 * 
 * This file contains configuration for BlockSuite editor features including:
 * - Rich text formatting (bold, italic, underline, strikethrough, code)
 * - Keyboard shortcuts
 * - Code blocks with syntax highlighting
 * - Block operations
 */

/**
 * Keyboard shortcuts for rich text formatting
 * These are the default shortcuts that BlockSuite supports
 */
export const FORMATTING_SHORTCUTS = {
  bold: 'Mod-b',           // Ctrl/Cmd + B
  italic: 'Mod-i',         // Ctrl/Cmd + I
  underline: 'Mod-u',      // Ctrl/Cmd + U
  strikethrough: 'Mod-Shift-s', // Ctrl/Cmd + Shift + S
  code: 'Mod-e',           // Ctrl/Cmd + E
  link: 'Mod-k',           // Ctrl/Cmd + K
} as const;

/**
 * Supported programming languages for code blocks
 * BlockSuite uses Prism.js for syntax highlighting
 */
export const SUPPORTED_CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'markdown',
  'sql',
  'bash',
  'shell',
  'powershell',
  'dockerfile',
  'xml',
  'graphql',
] as const;

/**
 * Code block configuration
 */
export const CODE_BLOCK_CONFIG = {
  showLineNumbers: true,
  enableCopy: true,
  defaultLanguage: 'javascript',
  theme: 'default', // BlockSuite will use the editor theme
} as const;

/**
 * Rich text formatting configuration
 */
export const RICH_TEXT_CONFIG = {
  // Enable all inline formatting options
  enableBold: true,
  enableItalic: true,
  enableUnderline: true,
  enableStrikethrough: true,
  enableCode: true,
  enableLink: true,
  
  // Show formatting toolbar on text selection
  showFormattingToolbar: true,
  
  // Enable keyboard shortcuts
  enableKeyboardShortcuts: true,
} as const;

/**
 * Block operations configuration
 */
export const BLOCK_OPERATIONS_CONFIG = {
  // Enable slash commands menu
  enableSlashMenu: true,
  
  // Enable block drag and drop
  enableDragDrop: true,
  
  // Show block handles
  showBlockHandles: true,
  
  // Enable block selection
  enableBlockSelection: true,
  
  // Enable multi-block operations
  enableMultiBlockOperations: true,
} as const;

/**
 * Editor feature flags
 */
export const EDITOR_FEATURES = {
  richText: true,
  codeBlocks: true,
  images: true,
  links: true,
  lists: true,
  headings: true,
  quotes: true,
  dividers: true,
  tables: false, // Not yet implemented in our integration
  embeds: false, // Not yet implemented in our integration
} as const;

/**
 * Get the complete BlockSuite editor configuration
 */
export function getBlockSuiteConfig() {
  return {
    formatting: RICH_TEXT_CONFIG,
    codeBlocks: CODE_BLOCK_CONFIG,
    blockOperations: BLOCK_OPERATIONS_CONFIG,
    features: EDITOR_FEATURES,
    shortcuts: FORMATTING_SHORTCUTS,
    supportedLanguages: SUPPORTED_CODE_LANGUAGES,
  };
}

/**
 * Type definitions for configuration
 */
export type FormattingShortcuts = typeof FORMATTING_SHORTCUTS;
export type CodeLanguage = typeof SUPPORTED_CODE_LANGUAGES[number];
export type BlockSuiteConfig = ReturnType<typeof getBlockSuiteConfig>;
