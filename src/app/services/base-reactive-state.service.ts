import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { ComponentState, LoadingState } from '../types/common.types';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import {
  categorizeError,
  getSeverityForError,
  getUserMessageForError,
} from './base-reactive-state-helpers';

/**
 * Base class for reactive state management in services
 * Provides common state patterns with proper cleanup
 */
@Injectable()
export abstract class BaseReactiveStateService implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  protected readonly errorHandler = inject(GlobalErrorHandlerService);

  // Common state subjects
  private readonly loadingStateSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
  });
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly loadingState$ = this.loadingStateSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();
  public readonly isLoading$ = this.loadingStateSubject.pipe(
    map(state => state.isLoading)
  );

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create a new state BehaviorSubject with getter and setter
   * @param initialValue Initial state value
   * @returns Object with observable, setter function, and getter function
   */
  protected createState<T>(initialValue: T): {
    observable: Observable<T>;
    set: (value: T) => void;
    get: () => T;
  } {
    const subject = new BehaviorSubject<T>(initialValue);

    return {
      observable: subject.asObservable(),
      set: (value: T) => subject.next(value),
      get: () => subject.value,
    };
  }

  /**
   * Set loading state with optional message and operation type
   */
  protected setLoading(
    isLoading: boolean,
    message?: string,
    operation?: string
  ): void {
    this.loadingStateSubject.next({
      isLoading,
      message,
      operation,
    });
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.errorSubject.next(error);
    if (error) {
      this.setLoading(false); // Stop loading on error
    }
  }

  /**
   * Clear all error states
   */
  protected clearError(): void {
    this.setError(null);
  }

  /**
   * Get current loading state
   */
  protected get currentLoadingState(): LoadingState {
    return this.loadingStateSubject.value;
  }

  /**
   * Get current error
   */
  protected get currentError(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Execute an async operation with automatic loading state management
   */
  protected async executeWithLoading<T>(
    operation: () => Promise<T>,
    loadingMessage?: string,
    operationType?: string
  ): Promise<T | null> {
    try {
      this.clearError();
      this.setLoading(true, loadingMessage, operationType);

      const result = await operation();

      this.setLoading(false);
      return result;
    } catch (error) {
      this.setLoading(false);

      // Use global error handler for consistent error handling
      const enhancedError = this.errorHandler.handleAppError(error, {
        category: categorizeError(error),
        severity: getSeverityForError(error),
        userMessage: getUserMessageForError(error, operationType),
        technicalMessage:
          error instanceof Error ? error.message : String(error),
        operation: operationType,
      });

      this.setError(enhancedError.userMessage);
      return null;
    }
  }
}

/**
 * Base class for components that need reactive state management
 * Use this for components that manage complex local state
 */
@Injectable()
export abstract class BaseReactiveStateComponent implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  protected readonly errorHandler = inject(GlobalErrorHandlerService);

  // Common component state
  private readonly componentStateSubject = new BehaviorSubject<ComponentState>(
    'pending'
  );
  private readonly loadingStateSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
  });
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly componentState$ = this.componentStateSubject.asObservable();
  public readonly loadingState$ = this.loadingStateSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create a new state BehaviorSubject with getter and setter
   */
  protected createState<T>(initialValue: T): {
    observable: Observable<T>;
    set: (value: T) => void;
    get: () => T;
  } {
    const subject = new BehaviorSubject<T>(initialValue);

    return {
      observable: subject.asObservable(),
      set: (value: T) => subject.next(value),
      get: () => subject.value,
    };
  }

  /**
   * Set component state
   */
  protected setComponentState(state: ComponentState): void {
    this.componentStateSubject.next(state);
  }

  /**
   * Set loading state
   */
  protected setLoading(
    isLoading: boolean,
    message?: string,
    operation?: string
  ): void {
    this.loadingStateSubject.next({
      isLoading,
      message,
      operation,
    });
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.errorSubject.next(error);
    if (error) {
      this.setComponentState('error');
      this.setLoading(false);
    }
  }

  /**
   * Clear error and reset to pending state
   */
  protected clearError(): void {
    this.setError(null);
    this.setComponentState('pending');
  }

  /**
   * Get current component state
   */
  protected get currentComponentState(): ComponentState {
    return this.componentStateSubject.value;
  }

  /**
   * Execute async operation with state management
   */
  protected async executeWithState<T>(
    operation: () => Promise<T>,
    loadingMessage?: string,
    operationType?: string
  ): Promise<T | null> {
    try {
      this.clearError();
      this.setComponentState('loading');
      this.setLoading(true, loadingMessage, operationType);

      const result = await operation();

      this.setComponentState('success');
      this.setLoading(false);
      return result;
    } catch (error) {
      // Use global error handler for consistent error handling
      const enhancedError = this.errorHandler.handleAppError(error, {
        category: categorizeError(error),
        severity: getSeverityForError(error),
        userMessage: getUserMessageForError(error, operationType),
        technicalMessage:
          error instanceof Error ? error.message : String(error),
        operation: operationType,
      });

      this.setError(enhancedError.userMessage);
      return null;
    }
  }
}
