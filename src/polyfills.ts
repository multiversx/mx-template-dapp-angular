(window as any).global = window;

// Node.js polyfills for MultiversX SDK
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

// Add process polyfill
(window as any).process = {
  env: {},
  version: '',
  versions: {},
  platform: 'browser',
  browser: true,
  cwd: () => '/',
  nextTick: (fn: any) => setTimeout(fn, 0),
};
