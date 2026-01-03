import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to fix BlockSuite icon import typo
function fixBlockSuiteIconImports(): Plugin {
  return {
    name: 'fix-blocksuite-icon-imports',
    transform(code, id) {
      // Fix the typo in BlockSuite packages
      if (id.includes('node_modules/@blocksuite/')) {
        // Replace the misspelled import with the correct one
        const fixed = code.replace(
          /CheckBoxCkeckSolidIcon/g,
          'CheckBoxCheckSolidIcon'
        );
        if (fixed !== code) {
          return {
            code: fixed,
            map: null
          };
        }
      }
      return null;
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': 'http://localhost:8000'
      }
    },
    plugins: [react(), fixBlockSuiteIconImports()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Optimize BlockSuite bundling
    optimizeDeps: {
      include: [
        '@blocksuite/presets',
        '@blocksuite/blocks',
        '@blocksuite/store',
        'yjs'
      ]
    },
    build: {
      // Code splitting for BlockSuite
      rollupOptions: {
        output: {
          manualChunks: {
            'blocksuite': [
              '@blocksuite/presets',
              '@blocksuite/blocks',
              '@blocksuite/store'
            ],
            'yjs': ['yjs']
          }
        }
      },
      // Increase chunk size warning limit for BlockSuite
      chunkSizeWarningLimit: 1000
    }
  };
});
