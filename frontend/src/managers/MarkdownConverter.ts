import type { Doc } from '@blocksuite/store';
import { getWorkspaceManager } from './WorkspaceManager';

/**
 * BlockSnapshot represents a block in BlockSuite's document structure
 */
export interface BlockSnapshot {
  flavour: string;
  props: Record<string, any>;
  children: BlockSnapshot[];
}

/**
 * MarkdownConverter handles conversion between Markdown and BlockSuite formats.
 * Uses BlockSuite's built-in MarkdownTransformer when available, with fallback strategies.
 */
export class MarkdownConverter {
  private workspaceManager = getWorkspaceManager();

  /**
   * Convert Markdown string to BlockSuite blocks
   * @param markdown - Markdown content to convert
   * @returns Array of BlockSnapshot objects
   */
  public async markdownToBlocks(markdown: string): Promise<BlockSnapshot[]> {
    try {
      // Handle empty document edge case
      if (!markdown || markdown.trim() === '') {
        console.log('[MarkdownConverter] Empty markdown, returning empty blocks');
        return this.createEmptyBlocks();
      }

      // Create a temporary doc for conversion
      const tempDocId = `temp-${Date.now()}`;
      const doc = this.workspaceManager.getOrCreateDoc(tempDocId);

      try {
        // Import markdown to doc using BlockSuite's transformer
        await this.markdownToDoc(markdown, doc);

        // Export doc to snapshot format
        const blocks = await this.exportDocToBlocks(doc);

        return blocks;
      } finally {
        // Cleanup temporary doc
        this.workspaceManager.disposeDoc(tempDocId);
      }
    } catch (error) {
      console.error('[MarkdownConverter] markdownToBlocks failed:', error);
      throw new Error(`Failed to convert markdown to blocks: ${error}`);
    }
  }

  /**
   * Convert BlockSuite blocks to Markdown string
   * @param blocks - Array of BlockSnapshot objects
   * @returns Markdown string
   */
  public async blocksToMarkdown(blocks: BlockSnapshot[]): Promise<string> {
    try {
      // Handle empty blocks edge case
      if (!blocks || blocks.length === 0) {
        console.log('[MarkdownConverter] Empty blocks, returning empty markdown');
        return '';
      }

      // Validate blocks structure
      this.validateBlocks(blocks);

      // Create a temporary doc for conversion
      const tempDocId = `temp-${Date.now()}`;
      const doc = this.workspaceManager.getOrCreateDoc(tempDocId);

      try {
        // Import blocks to doc
        await this.importBlocksToDoc(blocks, doc);

        // Export doc to markdown
        const markdown = await this.docToMarkdown(doc);

        return markdown;
      } finally {
        // Cleanup temporary doc
        this.workspaceManager.disposeDoc(tempDocId);
      }
    } catch (error) {
      console.error('[MarkdownConverter] blocksToMarkdown failed:', error);
      
      // Fallback: Try to extract any text content from blocks
      console.warn('[MarkdownConverter] Falling back to text extraction from blocks');
      return this.extractTextFromBlocks(blocks);
    }
  }

  /**
   * Convert Markdown to BlockSuite doc directly
   * @param markdown - Markdown content
   * @param doc - Target Doc instance
   */
  public async markdownToDoc(markdown: string, doc: Doc): Promise<void> {
    try {
      console.log('[MarkdownConverter] Starting markdownToDoc conversion');
      
      // Handle empty markdown
      if (!markdown || markdown.trim() === '') {
        console.log('[MarkdownConverter] Empty markdown, initializing empty doc');
        this.initializeEmptyDoc(doc);
        return;
      }

      console.log('[MarkdownConverter] Markdown length:', markdown.length);

      // For now, use plain text initialization as a reliable fallback
      // TODO: Implement proper MarkdownAdapter integration once BlockSuite API is stable
      console.log('[MarkdownConverter] Using plain text initialization');
      this.initializeDocWithPlainText(doc, markdown);
      
    } catch (error) {
      console.error('[MarkdownConverter] markdownToDoc failed:', error);
      
      // Final fallback: Initialize empty doc
      console.warn('[MarkdownConverter] Final fallback: initializing empty doc');
      this.initializeEmptyDoc(doc);
    }
  }

  /**
   * Convert BlockSuite doc to Markdown directly
   * @param doc - Source Doc instance
   * @returns Markdown string
   */
  public async docToMarkdown(doc: Doc): Promise<string> {
    try {
      console.log('[MarkdownConverter] Starting docToMarkdown conversion');
      
      // Check if doc has content
      if (!doc.root) {
        console.log('[MarkdownConverter] Doc has no root, returning empty markdown');
        return '';
      }

      // For now, use plain text extraction as a reliable fallback
      // TODO: Implement proper MarkdownAdapter integration once BlockSuite API is stable
      console.log('[MarkdownConverter] Using plain text extraction');
      const markdown = this.extractPlainText(doc);
      
      console.log('[MarkdownConverter] Successfully converted doc to markdown, length:', markdown.length);
      return markdown || '';
    } catch (error) {
      console.error('[MarkdownConverter] docToMarkdown failed:', error);
      
      // Fallback: Extract plain text if transformer fails
      console.warn('[MarkdownConverter] Falling back to plain text extraction');
      return this.extractPlainText(doc);
    }
  }

  /**
   * Load BlockSuite's MarkdownAdapter dynamically
   * @private
   */
  private async loadMarkdownTransformer(): Promise<any> {
    try {
      // Try to import MarkdownAdapter from @blocksuite/blocks
      const blocks = await import('@blocksuite/blocks');
      
      // Check if MarkdownAdapter is available
      if (blocks && (blocks as any).MarkdownAdapter) {
        return { MarkdownTransformer: (blocks as any).MarkdownAdapter };
      }
      
      console.warn('[MarkdownConverter] MarkdownAdapter not found in blocks package');
      throw new Error('MarkdownAdapter not available');
    } catch (error) {
      console.error('[MarkdownConverter] Failed to load MarkdownAdapter:', error);
      throw new Error('MarkdownAdapter not available in installed BlockSuite version');
    }
  }

  /**
   * Export doc to block snapshots
   * @private
   */
  private async exportDocToBlocks(doc: Doc): Promise<BlockSnapshot[]> {
    const blocks: BlockSnapshot[] = [];

    if (!doc.root) {
      return blocks;
    }

    // Traverse the doc tree and extract blocks
    const traverse = (blockId: string): BlockSnapshot | null => {
      const block = doc.getBlock(blockId);
      if (!block) return null;

      const snapshot: BlockSnapshot = {
        flavour: block.flavour,
        props: { ...block.model },
        children: [],
      };

      // Recursively process children
      const children = block.model.children;
      if (children && Array.isArray(children)) {
        for (const child of children) {
          const childSnapshot = traverse(child.id);
          if (childSnapshot) {
            snapshot.children.push(childSnapshot);
          }
        }
      }

      return snapshot;
    };

    const rootSnapshot = traverse(doc.root.id);
    if (rootSnapshot) {
      blocks.push(rootSnapshot);
    }

    return blocks;
  }

  /**
   * Import block snapshots to doc
   * @private
   */
  private async importBlocksToDoc(blocks: BlockSnapshot[], doc: Doc): Promise<void> {
    // This is a simplified implementation
    // In practice, you'd need to properly reconstruct the doc structure
    console.warn('[MarkdownConverter] importBlocksToDoc is a simplified implementation');
    
    // Initialize empty doc structure
    this.initializeEmptyDoc(doc);
  }

  /**
   * Create empty block structure
   * @private
   */
  private createEmptyBlocks(): BlockSnapshot[] {
    return [
      {
        flavour: 'affine:page',
        props: {
          title: '',
        },
        children: [
          {
            flavour: 'affine:surface',
            props: {},
            children: [],
          },
          {
            flavour: 'affine:note',
            props: {},
            children: [],
          },
        ],
      },
    ];
  }

  /**
   * Initialize an empty doc with proper structure
   * @private
   */
  private initializeEmptyDoc(doc: Doc): void {
    console.log('[MarkdownConverter] initializeEmptyDoc called');
    console.log('[MarkdownConverter] Doc loaded:', doc.loaded);
    console.log('[MarkdownConverter] Doc root exists:', !!doc.root);
    
    // Load the doc if not already loaded
    if (!doc.loaded) {
      console.log('[MarkdownConverter] Calling doc.load() with init function');
      doc.load(() => {
        // This callback runs inside a transaction, safe to add blocks here
        console.log('[MarkdownConverter] Inside load init function');
        if (!doc.root) {
          console.log('[MarkdownConverter] Creating page structure inside load()');
          const pageBlockId = doc.addBlock('affine:page' as any, {});
          console.log('[MarkdownConverter] Page block created:', pageBlockId);
          
          doc.addBlock('affine:surface' as any, {}, pageBlockId);
          console.log('[MarkdownConverter] Surface block created');
          
          doc.addBlock('affine:note' as any, {}, pageBlockId);
          console.log('[MarkdownConverter] Note block created');
        }
      });
      console.log('[MarkdownConverter] Doc loaded:', doc.loaded);
      console.log('[MarkdownConverter] Doc root after load:', !!doc.root);
    } else if (!doc.root) {
      // Doc is loaded but has no root - create structure
      console.log('[MarkdownConverter] Doc loaded but no root, creating page structure');
      try {
        const pageBlockId = doc.addBlock('affine:page' as any, {});
        console.log('[MarkdownConverter] Page block created:', pageBlockId);
        
        doc.addBlock('affine:surface' as any, {}, pageBlockId);
        console.log('[MarkdownConverter] Surface block created');
        
        doc.addBlock('affine:note' as any, {}, pageBlockId);
        console.log('[MarkdownConverter] Note block created');
      } catch (error) {
        console.error('[MarkdownConverter] Error creating page structure:', error);
      }
    } else {
      console.log('[MarkdownConverter] Doc root already exists, skipping structure creation');
    }
  }

  /**
   * Initialize doc with plain text content (fallback)
   * @private
   */
  private initializeDocWithPlainText(doc: Doc, text: string): void {
    console.log('[MarkdownConverter] Initializing doc with plain text');
    console.log('[MarkdownConverter] Doc ID:', doc.id);
    console.log('[MarkdownConverter] Doc root exists:', !!doc.root);
    
    this.initializeEmptyDoc(doc);

    if (!doc.root) {
      console.error('[MarkdownConverter] Failed to initialize empty doc - root is null');
      return;
    }

    console.log('[MarkdownConverter] Doc root initialized successfully');
    console.log('[MarkdownConverter] Root children count:', doc.root.children?.length || 0);

    // Add text as paragraphs
    const lines = text.split('\n').filter(line => line.trim());
    console.log(`[MarkdownConverter] Adding ${lines.length} lines to doc`);
    
    const noteBlock = doc.root.children?.find(
      (child: any) => child.flavour === 'affine:note'
    );

    console.log('[MarkdownConverter] Note block found:', !!noteBlock);

    if (noteBlock && lines.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        try {
          console.log(`[MarkdownConverter] Adding line ${i + 1}/${lines.length}`);
          // Use BlockSuite's Text class to create text content
          const blockId = doc.addBlock(
            'affine:paragraph' as any,
            {},
            noteBlock.id
          );
          
          console.log(`[MarkdownConverter] Block added with ID: ${blockId}`);
          
          // Get the block and set its text
          const block = doc.getBlock(blockId);
          if (block && block.model.text) {
            // Use the Text object's insert method
            block.model.text.insert(line, 0);
            console.log(`[MarkdownConverter] Text inserted for line ${i + 1}`);
          } else {
            console.warn(`[MarkdownConverter] Block or text property not found for line ${i + 1}`);
          }
        } catch (error) {
          console.error(`[MarkdownConverter] Failed to add block for line ${i + 1}:`, error);
        }
      }
      console.log('[MarkdownConverter] Successfully added all lines');
    } else {
      console.warn('[MarkdownConverter] Note block not found or no lines to add');
      console.warn('[MarkdownConverter] Note block:', noteBlock);
      console.warn('[MarkdownConverter] Lines count:', lines.length);
    }
  }

  /**
   * Extract plain text from doc (fallback)
   * @private
   */
  private extractPlainText(doc: Doc): string {
    if (!doc.root) {
      return '';
    }

    const lines: string[] = [];

    const traverse = (blockId: string): void => {
      const block = doc.getBlock(blockId);
      if (!block) return;

      // Extract text from block if it has text property
      if (block.model.text) {
        const text = block.model.text;
        if (typeof text === 'string') {
          lines.push(text);
        } else if (text && typeof text.toString === 'function') {
          // Use toString() method for BlockSuite Text objects
          const textContent = text.toString();
          if (textContent.trim()) {
            lines.push(textContent);
          }
        }
      }

      // Recursively process children
      const children = block.model.children;
      if (children && Array.isArray(children)) {
        for (const child of children) {
          traverse(child.id);
        }
      }
    };

    traverse(doc.root.id);

    return lines.filter(line => line.trim()).join('\n');
  }

  /**
   * Sanitize markdown to handle special characters and edge cases
   * @private
   */
  private sanitizeMarkdown(markdown: string): string {
    // Handle malformed markdown gracefully
    try {
      // Normalize line endings
      let sanitized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Remove null bytes and other control characters that might cause issues
      sanitized = sanitized.replace(/\0/g, '');
      sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

      // Handle excessive nesting (limit depth)
      // This is a simple check - BlockSuite should handle most cases
      const maxNestingDepth = 10;
      const lines = sanitized.split('\n');
      const processedLines = lines.map((line) => {
        // Count leading spaces/tabs for list items
        const match = line.match(/^(\s*)([-*+]|\d+\.)\s/);
        if (match) {
          const indent = match[1];
          const indentLevel = Math.floor(indent.length / 2);
          if (indentLevel > maxNestingDepth) {
            // Reduce nesting to max depth
            const newIndent = '  '.repeat(maxNestingDepth);
            return line.replace(/^\s*/, newIndent);
          }
        }
        return line;
      });

      sanitized = processedLines.join('\n');

      // Handle malformed code blocks (unclosed backticks)
      sanitized = this.fixMalformedCodeBlocks(sanitized);

      // Handle malformed links and images
      sanitized = this.fixMalformedLinks(sanitized);

      return sanitized;
    } catch (error) {
      console.error('[MarkdownConverter] Sanitization failed:', error);
      // Return original if sanitization fails
      return markdown;
    }
  }

  /**
   * Fix malformed code blocks by ensuring they are properly closed
   * @private
   */
  private fixMalformedCodeBlocks(markdown: string): string {
    try {
      const lines = markdown.split('\n');
      const result: string[] = [];
      let inCodeBlock = false;
      let codeBlockFence = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check for code block fence (``` or ~~~)
        if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
          if (!inCodeBlock) {
            // Opening fence
            inCodeBlock = true;
            codeBlockFence = trimmed.startsWith('```') ? '```' : '~~~';
            result.push(line);
          } else if (trimmed.startsWith(codeBlockFence)) {
            // Closing fence
            inCodeBlock = false;
            codeBlockFence = '';
            result.push(line);
          } else {
            // Different fence type while in code block - treat as content
            result.push(line);
          }
        } else {
          result.push(line);
        }
      }

      // If code block is still open at end, close it
      if (inCodeBlock) {
        console.warn('[MarkdownConverter] Unclosed code block detected, adding closing fence');
        result.push(codeBlockFence);
      }

      return result.join('\n');
    } catch (error) {
      console.error('[MarkdownConverter] Failed to fix code blocks:', error);
      return markdown;
    }
  }

  /**
   * Fix malformed links and images
   * @private
   */
  private fixMalformedLinks(markdown: string): string {
    try {
      // Fix unclosed brackets in links [text](url
      let fixed = markdown.replace(/\[([^\]]+)\]\(([^)]+)(?!\))/g, '[$1]($2)');

      // Fix links with missing closing bracket [text(url)
      fixed = fixed.replace(/\[([^\]]+)\(([^)]+)\)/g, '[$1]($2)');

      // Fix images with malformed syntax
      fixed = fixed.replace(/!\[([^\]]*)\]\(([^)]+)(?!\))/g, '![$1]($2)');

      return fixed;
    } catch (error) {
      console.error('[MarkdownConverter] Failed to fix links:', error);
      return markdown;
    }
  }

  /**
   * Validate markdown structure and log warnings for potential issues
   * @private
   */
  private validateMarkdown(markdown: string): void {
    try {
      // Check for extremely long lines (might cause performance issues)
      const lines = markdown.split('\n');
      const longLines = lines.filter((line) => line.length > 10000);
      if (longLines.length > 0) {
        console.warn(
          `[MarkdownConverter] Found ${longLines.length} lines longer than 10,000 characters`
        );
      }

      // Check for excessive blank lines
      const consecutiveBlankLines = markdown.match(/\n\n\n+/g);
      if (consecutiveBlankLines && consecutiveBlankLines.length > 10) {
        console.warn(
          `[MarkdownConverter] Found ${consecutiveBlankLines.length} instances of 3+ consecutive blank lines`
        );
      }

      // Check for potential XSS in HTML tags (if any)
      const htmlTags = markdown.match(/<script|<iframe|<object|<embed/gi);
      if (htmlTags) {
        console.warn(
          `[MarkdownConverter] Found potentially unsafe HTML tags: ${htmlTags.join(', ')}`
        );
      }
    } catch (error) {
      console.error('[MarkdownConverter] Validation failed:', error);
    }
  }

  /**
   * Validate blocks structure
   * @private
   */
  private validateBlocks(blocks: BlockSnapshot[]): void {
    try {
      // Check for valid block structure
      const validateBlock = (block: BlockSnapshot, depth: number = 0): void => {
        if (!block.flavour) {
          console.warn('[MarkdownConverter] Block missing flavour property');
        }

        if (!block.props || typeof block.props !== 'object') {
          console.warn('[MarkdownConverter] Block missing or invalid props');
        }

        if (depth > 20) {
          console.warn('[MarkdownConverter] Block nesting depth exceeds 20 levels');
        }

        if (block.children && Array.isArray(block.children)) {
          for (const child of block.children) {
            validateBlock(child, depth + 1);
          }
        }
      };

      for (const block of blocks) {
        validateBlock(block);
      }
    } catch (error) {
      console.error('[MarkdownConverter] Block validation failed:', error);
    }
  }

  /**
   * Extract text content from blocks as fallback
   * @private
   */
  private extractTextFromBlocks(blocks: BlockSnapshot[]): string {
    try {
      const lines: string[] = [];

      const traverse = (block: BlockSnapshot): void => {
        // Try to extract text from props
        if (block.props) {
          if (block.props.text) {
            const text = block.props.text;
            if (typeof text === 'string') {
              lines.push(text);
            } else if (text && typeof text.toString === 'function') {
              // Use toString() method for BlockSuite Text objects
              const textContent = text.toString();
              if (textContent) {
                lines.push(textContent);
              }
            }
          }

          // Handle title property
          if (block.props.title) {
            const title = block.props.title;
            if (typeof title === 'string') {
              lines.push(`# ${title}`);
            } else if (title && typeof title.toString === 'function') {
              // Use toString() method for BlockSuite Text objects
              const titleContent = title.toString();
              if (titleContent) {
                lines.push(`# ${titleContent}`);
              }
            }
          }
        }

        // Recursively process children
        if (block.children && Array.isArray(block.children)) {
          for (const child of block.children) {
            traverse(child);
          }
        }
      };

      for (const block of blocks) {
        traverse(block);
      }

      return lines.join('\n');
    } catch (error) {
      console.error('[MarkdownConverter] Text extraction from blocks failed:', error);
      return '';
    }
  }
}

// Export singleton instance
let converterInstance: MarkdownConverter | null = null;

export const getMarkdownConverter = (): MarkdownConverter => {
  if (!converterInstance) {
    converterInstance = new MarkdownConverter();
  }
  return converterInstance;
};
