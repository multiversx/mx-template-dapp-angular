// Essential polyfills for MultiversX SDK - loaded before any third-party code
import { Buffer } from 'buffer';

// Global compatibility
(window as any).global = window;
(window as any).Buffer = Buffer;
