// Essential polyfills for MultiversX SDK - loaded before any third-party code
import { Buffer } from 'buffer';
import * as process from 'process';

// Global compatibility
(window as any).global = window;
(window as any).Buffer = Buffer;
(window as any).process = process;
