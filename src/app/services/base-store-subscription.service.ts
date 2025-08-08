import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getStore } from '@multiversx/sdk-dapp/out/store/store';

/**
 * Base service for handling MultiversX SDK store subscriptions
 * Provides consistent subscription management and cleanup
 */
@Injectable()
export abstract class BaseStoreSubscriptionService implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  private storeUnsubscribe?: () => void;

  constructor() {
    this.initializeStoreSubscription();
  }

  /**
   * Subscribe to MultiversX SDK store changes with automatic cleanup
   */
  private initializeStoreSubscription(): void {
    const store = getStore();

    // Convert Redux store subscription to Observable-like pattern
    const storeSubscription = () => {
      this.onStoreChange();
    };

    // Store the unsubscribe function as a class property
    this.storeUnsubscribe = store.subscribe(storeSubscription);
  }

  /**
   * Called whenever the MultiversX SDK store changes
   * Implement this method in derived classes to handle store updates
   */
  protected abstract onStoreChange(): void;

  /**
   * Initialize any data that depends on store state
   * Call this from constructor of derived classes
   */
  protected abstract initializeData(): void;

  ngOnDestroy(): void {
    // Clean up the store subscription
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = undefined;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Base class for components that need MultiversX SDK store subscriptions
 * Use this for components that need to react to account or network changes
 */
@Injectable()
export abstract class BaseStoreSubscriptionComponent implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  private storeUnsubscribe?: () => void;

  constructor() {
    this.initializeStoreSubscription();
  }

  /**
   * Subscribe to MultiversX SDK store changes with automatic cleanup
   */
  private initializeStoreSubscription(): void {
    const store = getStore();

    const storeSubscription = () => {
      this.onStoreChange();
    };

    // Store the unsubscribe function as a class property
    this.storeUnsubscribe = store.subscribe(storeSubscription);
  }

  /**
   * Called whenever the MultiversX SDK store changes
   * Implement this method in derived classes to handle store updates
   */
  protected abstract onStoreChange(): void;

  /**
   * Initialize any data that depends on store state
   * Call this from ngOnInit of derived classes
   */
  protected abstract initializeData(): void;

  ngOnDestroy(): void {
    // Clean up the store subscription
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = undefined;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
