import { describe, it, expect } from 'vitest';
import {
  getBlockSuiteConfig,
  FORMATTING_SHORTCUTS,
  SUPPORTED_CODE_LANGUAGES,
  CODE_BLOCK_CONFIG,
  RICH_TEXT_CONFIG,
  BLOCK_OPERATIONS_CONFIG,
  EDITOR_FEATURES,
} from './blocksuiteConfig';

describe('BlockSuite Configuration', () => {
  describe('getBlockSuiteConfig', () => {
    it('should return complete configuration object', () => {
      const config = getBlockSuiteConfig();
      
      expect(config).toHaveProperty('formatting');
      expect(config).toHaveProperty('codeBlocks');
      expect(config).toHaveProperty('blockOperations');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('shortcuts');
      expect(config).toHaveProperty('supportedLanguages');
    });

    it('should include all configuration sections', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.formatting).toEqual(RICH_TEXT_CONFIG);
      expect(config.codeBlocks).toEqual(CODE_BLOCK_CONFIG);
      expect(config.blockOperations).toEqual(BLOCK_OPERATIONS_CONFIG);
      expect(config.features).toEqual(EDITOR_FEATURES);
      expect(config.shortcuts).toEqual(FORMATTING_SHORTCUTS);
      expect(config.supportedLanguages).toEqual(SUPPORTED_CODE_LANGUAGES);
    });
  });

  describe('FORMATTING_SHORTCUTS', () => {
    it('should define keyboard shortcuts for all formatting options', () => {
      expect(FORMATTING_SHORTCUTS.bold).toBe('Mod-b');
      expect(FORMATTING_SHORTCUTS.italic).toBe('Mod-i');
      expect(FORMATTING_SHORTCUTS.underline).toBe('Mod-u');
      expect(FORMATTING_SHORTCUTS.strikethrough).toBe('Mod-Shift-s');
      expect(FORMATTING_SHORTCUTS.code).toBe('Mod-e');
      expect(FORMATTING_SHORTCUTS.link).toBe('Mod-k');
    });

    it('should use Mod key for cross-platform compatibility', () => {
      const shortcuts = Object.values(FORMATTING_SHORTCUTS);
      
      shortcuts.forEach(shortcut => {
        expect(shortcut).toMatch(/^Mod-/);
      });
    });
  });

  describe('SUPPORTED_CODE_LANGUAGES', () => {
    it('should include common web development languages', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('javascript');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('typescript');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('html');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('css');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('json');
    });

    it('should include common backend languages', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('python');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('java');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('go');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('rust');
    });

    it('should include scripting and configuration languages', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('bash');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('yaml');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('sql');
      expect(SUPPORTED_CODE_LANGUAGES).toContain('dockerfile');
    });

    it('should have at least 20 supported languages', () => {
      expect(SUPPORTED_CODE_LANGUAGES.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('CODE_BLOCK_CONFIG', () => {
    it('should enable line numbers by default', () => {
      expect(CODE_BLOCK_CONFIG.showLineNumbers).toBe(true);
    });

    it('should enable copy functionality', () => {
      expect(CODE_BLOCK_CONFIG.enableCopy).toBe(true);
    });

    it('should have a default language', () => {
      expect(CODE_BLOCK_CONFIG.defaultLanguage).toBe('javascript');
    });

    it('should have a theme setting', () => {
      expect(CODE_BLOCK_CONFIG.theme).toBe('default');
    });
  });

  describe('RICH_TEXT_CONFIG', () => {
    it('should enable all inline formatting options', () => {
      expect(RICH_TEXT_CONFIG.enableBold).toBe(true);
      expect(RICH_TEXT_CONFIG.enableItalic).toBe(true);
      expect(RICH_TEXT_CONFIG.enableUnderline).toBe(true);
      expect(RICH_TEXT_CONFIG.enableStrikethrough).toBe(true);
      expect(RICH_TEXT_CONFIG.enableCode).toBe(true);
      expect(RICH_TEXT_CONFIG.enableLink).toBe(true);
    });

    it('should show formatting toolbar', () => {
      expect(RICH_TEXT_CONFIG.showFormattingToolbar).toBe(true);
    });

    it('should enable keyboard shortcuts', () => {
      expect(RICH_TEXT_CONFIG.enableKeyboardShortcuts).toBe(true);
    });
  });

  describe('BLOCK_OPERATIONS_CONFIG', () => {
    it('should enable slash menu', () => {
      expect(BLOCK_OPERATIONS_CONFIG.enableSlashMenu).toBe(true);
    });

    it('should enable drag and drop', () => {
      expect(BLOCK_OPERATIONS_CONFIG.enableDragDrop).toBe(true);
    });

    it('should show block handles', () => {
      expect(BLOCK_OPERATIONS_CONFIG.showBlockHandles).toBe(true);
    });

    it('should enable block selection', () => {
      expect(BLOCK_OPERATIONS_CONFIG.enableBlockSelection).toBe(true);
    });

    it('should enable multi-block operations', () => {
      expect(BLOCK_OPERATIONS_CONFIG.enableMultiBlockOperations).toBe(true);
    });
  });

  describe('EDITOR_FEATURES', () => {
    it('should enable core features', () => {
      expect(EDITOR_FEATURES.richText).toBe(true);
      expect(EDITOR_FEATURES.codeBlocks).toBe(true);
      expect(EDITOR_FEATURES.images).toBe(true);
      expect(EDITOR_FEATURES.links).toBe(true);
      expect(EDITOR_FEATURES.lists).toBe(true);
      expect(EDITOR_FEATURES.headings).toBe(true);
      expect(EDITOR_FEATURES.quotes).toBe(true);
      expect(EDITOR_FEATURES.dividers).toBe(true);
    });

    it('should disable unimplemented features', () => {
      expect(EDITOR_FEATURES.tables).toBe(false);
      expect(EDITOR_FEATURES.embeds).toBe(false);
    });
  });

  describe('Configuration Consistency', () => {
    it('should have consistent feature flags', () => {
      const config = getBlockSuiteConfig();
      
      // If rich text is enabled in features, formatting should be enabled
      if (config.features.richText) {
        expect(config.formatting.enableBold).toBe(true);
        expect(config.formatting.enableItalic).toBe(true);
      }
      
      // If code blocks are enabled in features, code block config should be present
      if (config.features.codeBlocks) {
        expect(config.codeBlocks).toBeDefined();
        expect(config.codeBlocks.showLineNumbers).toBeDefined();
      }
    });

    it('should have shortcuts for all enabled formatting options', () => {
      const config = getBlockSuiteConfig();
      
      if (config.formatting.enableBold) {
        expect(config.shortcuts.bold).toBeDefined();
      }
      
      if (config.formatting.enableItalic) {
        expect(config.shortcuts.italic).toBeDefined();
      }
      
      if (config.formatting.enableLink) {
        expect(config.shortcuts.link).toBeDefined();
      }
    });

    it('should have default language in supported languages list', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.supportedLanguages).toContain(config.codeBlocks.defaultLanguage);
    });
  });

  describe('Type Safety', () => {
    it('should export proper TypeScript types', () => {
      const config = getBlockSuiteConfig();
      
      // This test ensures the types are correctly exported
      // TypeScript will catch any type errors at compile time
      expect(typeof config).toBe('object');
      expect(typeof config.formatting).toBe('object');
      expect(typeof config.codeBlocks).toBe('object');
      expect(typeof config.blockOperations).toBe('object');
      expect(typeof config.features).toBe('object');
      expect(typeof config.shortcuts).toBe('object');
      expect(Array.isArray(config.supportedLanguages)).toBe(true);
    });
  });
});
