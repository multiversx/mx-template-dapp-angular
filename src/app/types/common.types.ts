/**
 * Common application types and interfaces
 * Provides strong typing for the MultiversX Angular dApp template
 */

/**
 * Generic error interface for application error handling
 */
export interface AppError {
  /** Error type classification */
  type: 'network' | 'validation' | 'blockchain' | 'authentication' | 'unknown';
  /** Human-readable error message */
  message: string;
  /** Optional error code */
  code?: string;
  /** Original error details for debugging */
  details?: unknown;
  /** Timestamp when error occurred */
  timestamp?: Date;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data?: T;
  /** Success indicator */
  success: boolean;
  /** Error information if success is false */
  error?: AppError;
  /** Response metadata */
  meta?: {
    timestamp: Date;
    requestId?: string;
  };
}

/**
 * Loading state interface for components
 */
export interface LoadingState {
  /** Whether operation is in progress */
  isLoading: boolean;
  /** Optional loading message */
  message?: string;
  /** Loading operation type */
  operation?: string;
}

/**
 * Component state type for form-like components
 */
export type ComponentState = 'pending' | 'loading' | 'success' | 'error';

/**
 * Base component properties that many components share
 */
export interface BaseComponentProps {
  /** Optional CSS class for styling */
  cssClass?: string;
  /** Test ID for automated testing */
  dataTestId?: string;
  /** Cypress test identifier */
  dataCy?: string;
  /** Whether component is disabled */
  disabled?: boolean;
}

/**
 * MultiversX network environment types
 */
export type NetworkEnvironment = 'devnet' | 'testnet' | 'mainnet';

/**
 * Transaction status from MultiversX SDK
 */
export type TransactionStatus = 
  | 'pending' 
  | 'success' 
  | 'invalid' 
  | 'fail' 
  | 'not executed';