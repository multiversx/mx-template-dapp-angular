import {
  ErrorCategoryEnum,
  ErrorSeverityEnum,
} from './global-error-handler.service';

/**
 * Helper functions for error categorization and handling
 * Used by BaseReactiveStateService and BaseReactiveStateComponent
 */

/**
 * Categorize error for proper handling
 */
export function categorizeError(error: unknown): ErrorCategoryEnum {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection')
  ) {
    return ErrorCategoryEnum.NETWORK;
  }
  if (message.includes('unauthorized') || message.includes('auth')) {
    return ErrorCategoryEnum.AUTHENTICATION;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategoryEnum.VALIDATION;
  }
  if (
    message.includes('blockchain') ||
    message.includes('transaction') ||
    message.includes('smart contract')
  ) {
    return ErrorCategoryEnum.BLOCKCHAIN;
  }

  return ErrorCategoryEnum.UNKNOWN;
}

/**
 * Determine error severity
 */
export function getSeverityForError(error: unknown): ErrorSeverityEnum {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (message.includes('critical') || message.includes('fatal')) {
    return ErrorSeverityEnum.CRITICAL;
  }
  if (message.includes('auth') || message.includes('unauthorized')) {
    return ErrorSeverityEnum.HIGH;
  }
  if (message.includes('network') || message.includes('timeout')) {
    return ErrorSeverityEnum.MEDIUM;
  }
  if (message.includes('validation')) {
    return ErrorSeverityEnum.LOW;
  }

  return ErrorSeverityEnum.MEDIUM; // Default to medium
}

/**
 * Generate user-friendly error message
 */
export function getUserMessageForError(
  error: unknown,
  operationType?: string
): string {
  const category = categorizeError(error);

  switch (category) {
    case ErrorCategoryEnum.NETWORK:
      return 'Network connection error. Please check your internet connection and try again.';
    case ErrorCategoryEnum.AUTHENTICATION:
      return 'Authentication failed. Please reconnect your wallet.';
    case ErrorCategoryEnum.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorCategoryEnum.BLOCKCHAIN:
      return 'Blockchain operation failed. Please try again.';
    default:
      return operationType
        ? `${operationType} failed. Please try again.`
        : 'An error occurred. Please try again.';
  }
}
