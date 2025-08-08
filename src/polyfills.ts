// Global polyfill for Node.js compatibility
(window as any).global = window;

// Buffer polyfill for MultiversX SDK
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
