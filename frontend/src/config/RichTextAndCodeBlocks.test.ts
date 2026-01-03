/**
 * Unit Tests for Rich Text Formatting and Code Block Features
 * 
 * This test suite validates the rich text formatting and code block functionality
 * in the BlockSuite editor integration.
 * 
 * Requirements Coverage:
 * - Requirement 6.1: Inline formatting (bold, italic, underline, strikethrough, code)
 * - Requirement 6.2: Formatting toolbar on text selection
 * - Requirement 7.1: Code block insertion with language selection
 * - Requirement 7.2: Syntax highlighting for programming languages
 * 
 * Feature: blocksuite-integration
 * Task: 9.3 编写富文本和代码块单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBlockSuiteConfig,
  FORMATTING_SHORTCUTS,
  SUPPORTED_CODE_LANGUAGES,
  CODE_BLOCK_CONFIG,
  RICH_TEXT_CONFIG,
  type CodeLanguage,
} from './blocksuiteConfig';

describe('Rich Text Formatting Features', () => {
  describe('Inline Formatting Support', () => {
    /**
     * Requirement 6.1: THE Editor SHALL support inline formatting
     * (bold, italic, underline, strikethrough, code)
     */
    it('should enable all inline formatting options', () => {
      const config = getBlockSuiteConfig();
      
      // Verify all inline formatting options are enabled
      expect(config.formatting.enableBold).toBe(true);
      expect(config.formatting.enableItalic).toBe(true);
      expect(config.formatting.enableUnderline).toBe(true);
      expect(config.formatting.enableStrikethrough).toBe(true);
      expect(config.formatting.enableCode).toBe(true);
    });

    it('should have configuration for each formatting type', () => {
      // Verify RICH_TEXT_CONFIG has all required properties
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableBold');
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableItalic');
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableUnderline');
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableStrikethrough');
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableCode');
      expect(RICH_TEXT_CONFIG).toHaveProperty('enableLink');
    });

    it('should enable bold formatting', () => {
      expect(RICH_TEXT_CONFIG.enableBold).toBe(true);
    });

    it('should enable italic formatting', () => {
      expect(RICH_TEXT_CONFIG.enableItalic).toBe(true);
    });

    it('should enable underline formatting', () => {
      expect(RICH_TEXT_CONFIG.enableUnderline).toBe(true);
    });

    it('should enable strikethrough formatting', () => {
      expect(RICH_TEXT_CONFIG.enableStrikethrough).toBe(true);
    });

    it('should enable inline code formatting', () => {
      expect(RICH_TEXT_CONFIG.enableCode).toBe(true);
    });

    it('should enable link creation', () => {
      expect(RICH_TEXT_CONFIG.enableLink).toBe(true);
    });
  });

  describe('Formatting Toolbar', () => {
    /**
     * Requirement 6.2: WHEN a user selects text, THE Editor SHALL show formatting toolbar
     */
    it('should enable formatting toolbar on text selection', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.formatting.showFormattingToolbar).toBe(true);
    });

    it('should have showFormattingToolbar configuration', () => {
      expect(RICH_TEXT_CONFIG).toHaveProperty('showFormattingToolbar');
      expect(RICH_TEXT_CONFIG.showFormattingToolbar).toBe(true);
    });
  });

  describe('Keyboard Shortcuts', () => {
    /**
     * Requirement 6.3: THE Editor SHALL support keyboard shortcuts for formatting
     * (Ctrl+B bold, Ctrl+I italic)
     */
    it('should enable keyboard shortcuts', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.formatting.enableKeyboardShortcuts).toBe(true);
    });

    it('should define shortcut for bold (Ctrl/Cmd+B)', () => {
      expect(FORMATTING_SHORTCUTS.bold).toBe('Mod-b');
    });

    it('should define shortcut for italic (Ctrl/Cmd+I)', () => {
      expect(FORMATTING_SHORTCUTS.italic).toBe('Mod-i');
    });

    it('should define shortcut for underline (Ctrl/Cmd+U)', () => {
      expect(FORMATTING_SHORTCUTS.underline).toBe('Mod-u');
    });

    it('should define shortcut for strikethrough (Ctrl/Cmd+Shift+S)', () => {
      expect(FORMATTING_SHORTCUTS.strikethrough).toBe('Mod-Shift-s');
    });

    it('should define shortcut for inline code (Ctrl/Cmd+E)', () => {
      expect(FORMATTING_SHORTCUTS.code).toBe('Mod-e');
    });

    it('should define shortcut for link (Ctrl/Cmd+K)', () => {
      expect(FORMATTING_SHORTCUTS.link).toBe('Mod-k');
    });

    it('should use Mod key for cross-platform compatibility', () => {
      // Mod key maps to Ctrl on Windows/Linux and Cmd on macOS
      const shortcuts = Object.values(FORMATTING_SHORTCUTS);
      
      shortcuts.forEach(shortcut => {
        expect(shortcut).toMatch(/^Mod-/);
      });
    });

    it('should have shortcuts for all enabled formatting options', () => {
      const config = getBlockSuiteConfig();
      
      if (config.formatting.enableBold) {
        expect(config.shortcuts.bold).toBeDefined();
      }
      
      if (config.formatting.enableItalic) {
        expect(config.shortcuts.italic).toBeDefined();
      }
      
      if (config.formatting.enableUnderline) {
        expect(config.shortcuts.underline).toBeDefined();
      }
      
      if (config.formatting.enableStrikethrough) {
        expect(config.shortcuts.strikethrough).toBeDefined();
      }
      
      if (config.formatting.enableCode) {
        expect(config.shortcuts.code).toBeDefined();
      }
      
      if (config.formatting.enableLink) {
        expect(config.shortcuts.link).toBeDefined();
      }
    });
  });

  describe('Link Support', () => {
    /**
     * Requirement 6.4: THE Editor SHALL support link creation and editing
     */
    it('should enable link creation', () => {
      expect(RICH_TEXT_CONFIG.enableLink).toBe(true);
    });

    it('should have link shortcut defined', () => {
      expect(FORMATTING_SHORTCUTS.link).toBe('Mod-k');
    });
  });

  describe('Feature Integration', () => {
    it('should include rich text in enabled features', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.features.richText).toBe(true);
    });

    it('should provide complete formatting configuration', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.formatting).toBeDefined();
      expect(config.shortcuts).toBeDefined();
      expect(config.features.richText).toBe(true);
    });
  });
});

describe('Code Block Features', () => {
  describe('Code Block Insertion', () => {
    /**
     * Requirement 7.1: THE Editor SHALL support code block insertion with language selection
     */
    it('should enable code blocks feature', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.features.codeBlocks).toBe(true);
    });

    it('should have code block configuration', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.codeBlocks).toBeDefined();
      expect(config.codeBlocks).toEqual(CODE_BLOCK_CONFIG);
    });

    it('should support code block insertion', () => {
      // Code blocks are inserted via slash menu (/code) or markdown syntax (```)
      // This is handled by BlockSuite's PageEditor preset
      const config = getBlockSuiteConfig();
      
      expect(config.features.codeBlocks).toBe(true);
    });
  });

  describe('Language Selection', () => {
    /**
     * Requirement 7.1: Code block insertion with language selection
     */
    it('should support multiple programming languages', () => {
      expect(SUPPORTED_CODE_LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should include common web development languages', () => {
      const webLanguages = ['javascript', 'typescript', 'html', 'css', 'json'];
      
      webLanguages.forEach(lang => {
        expect(SUPPORTED_CODE_LANGUAGES).toContain(lang as CodeLanguage);
      });
    });

    it('should include common backend languages', () => {
      const backendLanguages = ['python', 'java', 'go', 'rust', 'php'];
      
      backendLanguages.forEach(lang => {
        expect(SUPPORTED_CODE_LANGUAGES).toContain(lang as CodeLanguage);
      });
    });

    it('should include scripting and config languages', () => {
      const scriptingLanguages = ['bash', 'shell', 'yaml', 'sql'];
      
      scriptingLanguages.forEach(lang => {
        expect(SUPPORTED_CODE_LANGUAGES).toContain(lang as CodeLanguage);
      });
    });

    it('should have a default language configured', () => {
      expect(CODE_BLOCK_CONFIG.defaultLanguage).toBeDefined();
      expect(CODE_BLOCK_CONFIG.defaultLanguage).toBe('javascript');
    });

    it('should include at least 20 supported languages', () => {
      // Requirement: Support for common programming languages
      expect(SUPPORTED_CODE_LANGUAGES.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Syntax Highlighting', () => {
    /**
     * Requirement 7.2: THE Editor SHALL provide syntax highlighting for common programming languages
     */
    it('should enable syntax highlighting', () => {
      // Syntax highlighting is provided by BlockSuite using Prism.js
      // This test verifies the configuration supports it
      const config = getBlockSuiteConfig();
      
      expect(config.features.codeBlocks).toBe(true);
      expect(config.supportedLanguages).toBeDefined();
      expect(config.supportedLanguages.length).toBeGreaterThan(0);
    });

    it('should have theme configuration for syntax highlighting', () => {
      expect(CODE_BLOCK_CONFIG.theme).toBeDefined();
      expect(CODE_BLOCK_CONFIG.theme).toBe('default');
    });

    it('should support syntax highlighting for all configured languages', () => {
      const config = getBlockSuiteConfig();
      
      // All languages in supportedLanguages should be available for syntax highlighting
      expect(config.supportedLanguages).toEqual(SUPPORTED_CODE_LANGUAGES);
    });
  });

  describe('Code Block Features', () => {
    /**
     * Requirement 7.4: THE Editor SHALL support line numbers in code blocks
     */
    it('should enable line numbers', () => {
      expect(CODE_BLOCK_CONFIG.showLineNumbers).toBe(true);
    });

    /**
     * Requirement 7.5: THE Editor SHALL allow copying code block content
     */
    it('should enable code copy functionality', () => {
      expect(CODE_BLOCK_CONFIG.enableCopy).toBe(true);
    });

    it('should have all required code block features configured', () => {
      expect(CODE_BLOCK_CONFIG).toHaveProperty('showLineNumbers');
      expect(CODE_BLOCK_CONFIG).toHaveProperty('enableCopy');
      expect(CODE_BLOCK_CONFIG).toHaveProperty('defaultLanguage');
      expect(CODE_BLOCK_CONFIG).toHaveProperty('theme');
    });
  });

  describe('Code Block Configuration', () => {
    it('should provide complete code block configuration', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.codeBlocks).toBeDefined();
      expect(config.codeBlocks.showLineNumbers).toBe(true);
      expect(config.codeBlocks.enableCopy).toBe(true);
      expect(config.codeBlocks.defaultLanguage).toBe('javascript');
      expect(config.codeBlocks.theme).toBe('default');
    });

    it('should include supported languages in configuration', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.supportedLanguages).toBeDefined();
      expect(Array.isArray(config.supportedLanguages)).toBe(true);
      expect(config.supportedLanguages.length).toBeGreaterThan(0);
    });
  });
});

describe('Formatting and Code Block Integration', () => {
  describe('Complete Configuration', () => {
    it('should provide both rich text and code block configurations', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.formatting).toBeDefined();
      expect(config.codeBlocks).toBeDefined();
      expect(config.features.richText).toBe(true);
      expect(config.features.codeBlocks).toBe(true);
    });

    it('should have consistent configuration structure', () => {
      const config = getBlockSuiteConfig();
      
      // Verify all expected properties exist
      expect(config).toHaveProperty('formatting');
      expect(config).toHaveProperty('codeBlocks');
      expect(config).toHaveProperty('blockOperations');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('shortcuts');
      expect(config).toHaveProperty('supportedLanguages');
    });
  });

  describe('Feature Flags', () => {
    it('should enable rich text feature', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.features.richText).toBe(true);
    });

    it('should enable code blocks feature', () => {
      const config = getBlockSuiteConfig();
      
      expect(config.features.codeBlocks).toBe(true);
    });

    it('should enable related features', () => {
      const config = getBlockSuiteConfig();
      
      // Features that work with rich text and code blocks
      expect(config.features.links).toBe(true);
      expect(config.features.lists).toBe(true);
      expect(config.features.headings).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types', () => {
      const config = getBlockSuiteConfig();
      
      // TypeScript will catch any type errors at compile time
      expect(typeof config).toBe('object');
      expect(typeof config.formatting).toBe('object');
      expect(typeof config.codeBlocks).toBe('object');
      expect(typeof config.features).toBe('object');
      expect(typeof config.shortcuts).toBe('object');
      expect(Array.isArray(config.supportedLanguages)).toBe(true);
    });

    it('should have valid CodeLanguage type', () => {
      // Test that CodeLanguage type includes expected languages
      const testLanguages: CodeLanguage[] = [
        'javascript',
        'typescript',
        'python',
        'java',
      ];
      
      testLanguages.forEach(lang => {
        expect(SUPPORTED_CODE_LANGUAGES).toContain(lang);
      });
    });
  });
});

describe('Specific Language Support', () => {
  describe('Web Development Languages', () => {
    it('should support JavaScript', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('javascript');
    });

    it('should support TypeScript', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('typescript');
    });

    it('should support HTML', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('html');
    });

    it('should support CSS', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('css');
    });

    it('should support SCSS', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('scss');
    });

    it('should support JSON', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('json');
    });

    it('should support GraphQL', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('graphql');
    });
  });

  describe('Backend Languages', () => {
    it('should support Python', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('python');
    });

    it('should support Java', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('java');
    });

    it('should support C', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('c');
    });

    it('should support C++', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('cpp');
    });

    it('should support C#', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('csharp');
    });

    it('should support Go', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('go');
    });

    it('should support Rust', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('rust');
    });

    it('should support PHP', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('php');
    });

    it('should support Ruby', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('ruby');
    });

    it('should support Swift', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('swift');
    });

    it('should support Kotlin', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('kotlin');
    });
  });

  describe('Scripting and Configuration Languages', () => {
    it('should support Bash', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('bash');
    });

    it('should support Shell', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('shell');
    });

    it('should support PowerShell', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('powershell');
    });

    it('should support YAML', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('yaml');
    });

    it('should support SQL', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('sql');
    });

    it('should support Dockerfile', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('dockerfile');
    });

    it('should support XML', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('xml');
    });

    it('should support Markdown', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain('markdown');
    });
  });
});

describe('Configuration Validation', () => {
  describe('Rich Text Configuration Validation', () => {
    it('should have all required rich text properties', () => {
      const requiredProps = [
        'enableBold',
        'enableItalic',
        'enableUnderline',
        'enableStrikethrough',
        'enableCode',
        'enableLink',
        'showFormattingToolbar',
        'enableKeyboardShortcuts',
      ];
      
      requiredProps.forEach(prop => {
        expect(RICH_TEXT_CONFIG).toHaveProperty(prop);
      });
    });

    it('should have boolean values for all enable flags', () => {
      expect(typeof RICH_TEXT_CONFIG.enableBold).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableItalic).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableUnderline).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableStrikethrough).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableCode).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableLink).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.showFormattingToolbar).toBe('boolean');
      expect(typeof RICH_TEXT_CONFIG.enableKeyboardShortcuts).toBe('boolean');
    });
  });

  describe('Code Block Configuration Validation', () => {
    it('should have all required code block properties', () => {
      const requiredProps = [
        'showLineNumbers',
        'enableCopy',
        'defaultLanguage',
        'theme',
      ];
      
      requiredProps.forEach(prop => {
        expect(CODE_BLOCK_CONFIG).toHaveProperty(prop);
      });
    });

    it('should have boolean values for feature flags', () => {
      expect(typeof CODE_BLOCK_CONFIG.showLineNumbers).toBe('boolean');
      expect(typeof CODE_BLOCK_CONFIG.enableCopy).toBe('boolean');
    });

    it('should have string values for language and theme', () => {
      expect(typeof CODE_BLOCK_CONFIG.defaultLanguage).toBe('string');
      expect(typeof CODE_BLOCK_CONFIG.theme).toBe('string');
    });

    it('should have valid default language', () => {
      expect(SUPPORTED_CODE_LANGUAGES).toContain(CODE_BLOCK_CONFIG.defaultLanguage as CodeLanguage);
    });
  });

  describe('Shortcuts Configuration Validation', () => {
    it('should have all required shortcuts', () => {
      const requiredShortcuts = [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
        'link',
      ];
      
      requiredShortcuts.forEach(shortcut => {
        expect(FORMATTING_SHORTCUTS).toHaveProperty(shortcut);
      });
    });

    it('should have string values for all shortcuts', () => {
      Object.values(FORMATTING_SHORTCUTS).forEach(shortcut => {
        expect(typeof shortcut).toBe('string');
      });
    });

    it('should use valid shortcut format', () => {
      // Shortcuts should follow the format: Mod-key or Mod-Shift-key
      const validShortcutPattern = /^Mod(-Shift)?-[a-z]$/;
      
      Object.values(FORMATTING_SHORTCUTS).forEach(shortcut => {
        expect(shortcut).toMatch(validShortcutPattern);
      });
    });
  });

  describe('Supported Languages Validation', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(SUPPORTED_CODE_LANGUAGES)).toBe(true);
      expect(SUPPORTED_CODE_LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should contain only string values', () => {
      SUPPORTED_CODE_LANGUAGES.forEach(lang => {
        expect(typeof lang).toBe('string');
      });
    });

    it('should not have duplicate languages', () => {
      const uniqueLanguages = new Set(SUPPORTED_CODE_LANGUAGES);
      expect(uniqueLanguages.size).toBe(SUPPORTED_CODE_LANGUAGES.length);
    });

    it('should have lowercase language identifiers', () => {
      SUPPORTED_CODE_LANGUAGES.forEach(lang => {
        expect(lang).toBe(lang.toLowerCase());
      });
    });
  });
});
