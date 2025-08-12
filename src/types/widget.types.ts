import { Type } from '@angular/core';

/**
 * Base widget configuration interface
 * Defines the structure for widget components in the dashboard
 */
export interface WidgetConfig {
  /** Optional anchor ID for linking */
  anchor?: string;
  /** Widget description shown in the card */
  description?: string;
  /** Documentation reference URL */
  reference: string;
  /** Widget display title */
  title: string;
  /** Angular component type to render */
  widget: Type<any>;
}

/**
 * @deprecated Use WidgetConfig instead
 * Legacy type for backward compatibility
 */
export type WidgetType = WidgetConfig; 