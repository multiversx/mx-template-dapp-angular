import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    // MUST come first so Angular's builder can merge it
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util', 'crypto', 'path'],
      globals: {
        Buffer: true,
        process: true,
        global: true
      },
      protocolImports: true   // handle node:crypto etc.
    })
  ],

  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      crypto: 'crypto-browserify',
      path: 'path-browserify',
      process: 'process/browser'
    }
  },

  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'crypto-browserify',
      'util'
    ],
    esbuildOptions: {
      define: { global: 'globalThis' }
    }
  },

  build: {
    commonjsOptions: { transformMixedEsModules: true }
  }
});