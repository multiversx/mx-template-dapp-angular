import { Injectable, ErrorHandler, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppError } from '../types/common.types';

/**
 * Global error categories for consistent error handling
 */
export enum ErrorCategoryEnum {
  NETWORK = 'network',
  VALIDATION = 'validation',
  BLOCKCHAIN = 'blockchain',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown',
  USER_CANCELLED = 'user_cancelled',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  CONTRACT_ERROR = 'contract_error',
}

/**
 * Error severity levels
 */
export enum ErrorSeverityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Enhanced error interface with additional metadata
 */
export interface EnhancedAppError extends AppError {
  category: ErrorCategoryEnum;
  severity: ErrorSeverityEnum;
  userMessage: string;
  technicalMessage?: string;
  actionable?: {
    action: string;
    label: string;
  };
  context?: Record<string, unknown>;
}

/**
 * Error notification for UI display
 */
export interface ErrorNotification {
  id: string;
  error: EnhancedAppError;
  timestamp: Date;
  dismissed?: boolean;
  autoHide?: boolean;
  duration?: number; // milliseconds
}

/**
 * Global error handling service
 * Provides consistent error handling, logging, and user notifications
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService
  extends ErrorHandler
  implements OnDestroy
{
  private readonly errorNotificationsSubject = new BehaviorSubject<
    ErrorNotification[]
  >([]);
  private readonly isShowingErrorSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly errorNotifications$ =
    this.errorNotificationsSubject.asObservable();
  public readonly isShowingError$ = this.isShowingErrorSubject.asObservable();

  // Error counter for debugging
  private errorCount = 0;

  // Map to track setTimeout IDs to prevent memory leaks
  private readonly timeoutMap = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor() {
    super();
  }

  /**
   * Clean up all timeouts on service destruction
   */
  ngOnDestroy(): void {
    this.clearAllTimeouts();
  }

  /**
   * Clear all active timeouts
   */
  private clearAllTimeouts(): void {
    this.timeoutMap.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeoutMap.clear();
  }

  /**
   * Clear a specific timeout by notification ID
   */
  private clearTimeout(notificationId: string): void {
    const timeoutId = this.timeoutMap.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutMap.delete(notificationId);
    }
  }

  /**
   * Angular ErrorHandler implementation
   * Catches unhandled errors
   */
  override handleError(error: unknown): void {
    const enhancedError = this.enhanceError(error, {
      category: ErrorCategoryEnum.UNKNOWN,
      severity: ErrorSeverityEnum.HIGH,
      userMessage: 'An unexpected error occurred',
      technicalMessage: this.extractErrorMessage(error),
    });

    this.logError(enhancedError, 'Unhandled Error');
    this.showErrorNotification(enhancedError, { autoHide: false });
  }

  /**
   * Handle application errors with context
   */
  public handleAppError(
    error: unknown,
    context: {
      category: ErrorCategoryEnum;
      severity: ErrorSeverityEnum;
      userMessage: string;
      technicalMessage?: string;
      operation?: string;
      actionable?: { action: string; label: string };
      metadata?: Record<string, unknown>;
    }
  ): EnhancedAppError {
    const enhancedError = this.enhanceError(error, context);

    this.logError(enhancedError, context.operation || 'Application Error');

    // Show notification based on severity
    if (context.severity !== ErrorSeverityEnum.LOW) {
      this.showErrorNotification(enhancedError, {
        autoHide: context.severity === ErrorSeverityEnum.MEDIUM,
        duration:
          context.severity === ErrorSeverityEnum.MEDIUM ? 5000 : undefined,
      });
    }

    return enhancedError;
  }

  /**
   * Handle network errors specifically
   */
  public handleNetworkError(
    error: unknown,
    operation?: string
  ): EnhancedAppError {
    return this.handleAppError(error, {
      category: ErrorCategoryEnum.NETWORK,
      severity: ErrorSeverityEnum.MEDIUM,
      userMessage:
        'Network connection error. Please check your internet connection.',
      technicalMessage: this.extractErrorMessage(error),
      operation: operation || 'Network Operation',
      actionable: {
        action: 'retry',
        label: 'Retry',
      },
    });
  }

  /**
   * Handle blockchain/MultiversX errors
   */
  public handleBlockchainError(
    error: unknown,
    operation?: string
  ): EnhancedAppError {
    const errorMessage = this.extractErrorMessage(error);
    let userMessage = 'Blockchain operation failed';
    let category = ErrorCategoryEnum.BLOCKCHAIN;
    let actionable: { action: string; label: string } | undefined;

    // Parse common blockchain error patterns
    if (errorMessage.includes('insufficient funds')) {
      category = ErrorCategoryEnum.INSUFFICIENT_FUNDS;
      userMessage = 'Insufficient funds for this transaction';
      actionable = { action: 'add-funds', label: 'Add Funds' };
    } else if (errorMessage.includes('user denied')) {
      category = ErrorCategoryEnum.USER_CANCELLED;
      userMessage = 'Transaction was cancelled by user';
    } else if (errorMessage.includes('smart contract')) {
      category = ErrorCategoryEnum.CONTRACT_ERROR;
      userMessage = 'Smart contract execution failed';
    }

    return this.handleAppError(error, {
      category,
      severity: ErrorSeverityEnum.MEDIUM,
      userMessage,
      technicalMessage: errorMessage,
      operation: operation || 'Blockchain Operation',
      actionable,
    });
  }

  /**
   * Handle authentication errors
   */
  public handleAuthError(error: unknown, operation?: string): EnhancedAppError {
    return this.handleAppError(error, {
      category: ErrorCategoryEnum.AUTHENTICATION,
      severity: ErrorSeverityEnum.HIGH,
      userMessage: 'Authentication failed. Please reconnect your wallet.',
      technicalMessage: this.extractErrorMessage(error),
      operation: operation || 'Authentication',
      actionable: {
        action: 'reconnect',
        label: 'Reconnect Wallet',
      },
    });
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(
    error: unknown,
    operation?: string
  ): EnhancedAppError {
    return this.handleAppError(error, {
      category: ErrorCategoryEnum.VALIDATION,
      severity: ErrorSeverityEnum.LOW,
      userMessage: 'Please check your input and try again.',
      technicalMessage: this.extractErrorMessage(error),
      operation: operation || 'Validation',
    });
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(
    error: EnhancedAppError,
    options: { autoHide?: boolean; duration?: number } = {}
  ): void {
    const notification: ErrorNotification = {
      id: this.generateId(),
      error,
      timestamp: new Date(),
      autoHide: options.autoHide ?? false,
      duration: options.duration ?? 0,
    };

    const current = this.errorNotificationsSubject.value;
    this.errorNotificationsSubject.next([...current, notification]);
    this.isShowingErrorSubject.next(true);

    // Auto-hide if specified
    if (notification.autoHide && notification.duration) {
      const timeoutId = setTimeout(() => {
        this.dismissError(notification.id);
      }, notification.duration);
      this.timeoutMap.set(notification.id, timeoutId);
    }
  }

  /**
   * Dismiss error notification
   */
  public dismissError(errorId: string): void {
    const current = this.errorNotificationsSubject.value;
    const updated = current.filter(notification => notification.id !== errorId);
    this.errorNotificationsSubject.next(updated);

    if (updated.length === 0) {
      this.isShowingErrorSubject.next(false);
    }
    this.clearTimeout(errorId);
  }

  /**
   * Clear all error notifications
   */
  public clearAllErrors(): void {
    this.errorNotificationsSubject.next([]);
    this.isShowingErrorSubject.next(false);
    this.clearAllTimeouts();
  }

  /**
   * Get current error notifications
   */
  public getCurrentErrors(): ErrorNotification[] {
    return this.errorNotificationsSubject.value;
  }

  /**
   * Enhanced error creation with context
   */
  private enhanceError(
    originalError: unknown,
    context: {
      category: ErrorCategoryEnum;
      severity: ErrorSeverityEnum;
      userMessage: string;
      technicalMessage?: string;
      actionable?: { action: string; label: string };
      metadata?: Record<string, unknown>;
    }
  ): EnhancedAppError {
    return {
      type: this.mapCategoryToType(context.category),
      message: context.userMessage,
      category: context.category,
      severity: context.severity,
      userMessage: context.userMessage,
      technicalMessage:
        context.technicalMessage || this.extractErrorMessage(originalError),
      actionable: context.actionable,
      context: context.metadata,
      details: originalError,
      timestamp: new Date(),
    };
  }

  /**
   * Extract meaningful error message from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }

    return 'Unknown error occurred';
  }

  /**
   * Comprehensive error logging
   */
  private logError(error: EnhancedAppError, operation: string): void {
    this.errorCount++;

    const logContext = {
      errorId: this.errorCount,
      operation,
      category: error.category,
      severity: error.severity,
      userMessage: error.userMessage,
      technicalMessage: error.technicalMessage,
      timestamp: error.timestamp,
      context: error.context,
      originalError: error.details,
    };

    // Log based on severity
    switch (error.severity) {
      case ErrorSeverityEnum.CRITICAL:
        console.error('🔥 CRITICAL ERROR:', logContext);
        break;
      case ErrorSeverityEnum.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logContext);
        break;
      case ErrorSeverityEnum.MEDIUM:
        console.warn('⚠️  MEDIUM SEVERITY ERROR:', logContext);
        break;
      case ErrorSeverityEnum.LOW:
        console.info('ℹ️  LOW SEVERITY ERROR:', logContext);
        break;
      default:
        console.error('❓ UNKNOWN SEVERITY ERROR:', logContext);
    }

    // TODO: Send to external logging service in production
    // this.sendToLoggingService(logContext);
  }

  /**
   * Generate unique ID for error tracking
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if specific error category is currently showing
   */
  public hasErrorCategory(category: ErrorCategoryEnum): boolean {
    return this.errorNotificationsSubject.value.some(
      notification =>
        notification.error.category === category && !notification.dismissed
    );
  }

  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: ErrorCategoryEnum): ErrorNotification[] {
    return this.errorNotificationsSubject.value.filter(
      notification => notification.error.category === category
    );
  }

  /**
   * Execute action for actionable errors
   */
  public executeAction(action: string): void {
    switch (action) {
      case 'retry':
        // For retry actions, we typically want to reload the current page or retry the last operation
        // This is a generic retry - specific retry logic should be handled by the component that triggered the error
        window.location.reload();
        break;
      case 'reconnect':
        // For reconnect actions, we want to redirect to the unlock page to reconnect the wallet
        window.location.href = '/unlock';
        break;
      case 'add-funds':
        // For add-funds actions, we want to redirect to a page where users can add funds
        // This could be an external exchange or a funding page
        window.open('https://xexchange.com', '_blank');
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  }

  /**
   * Map ErrorCategoryEnum to AppError type string
   */
  private mapCategoryToType(category: ErrorCategoryEnum): AppError['type'] {
    switch (category) {
      case ErrorCategoryEnum.NETWORK:
        return 'network';
      case ErrorCategoryEnum.VALIDATION:
        return 'validation';
      case ErrorCategoryEnum.BLOCKCHAIN:
        return 'blockchain';
      case ErrorCategoryEnum.AUTHENTICATION:
        return 'authentication';
      case ErrorCategoryEnum.INSUFFICIENT_FUNDS:
      case ErrorCategoryEnum.CONTRACT_ERROR:
        return 'blockchain';
      case ErrorCategoryEnum.USER_CANCELLED:
        return 'validation';
      case ErrorCategoryEnum.UNKNOWN:
      default:
        return 'unknown';
    }
  }
}
