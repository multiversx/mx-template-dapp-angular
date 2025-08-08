import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { getIsLoggedIn } from '@multiversx/sdk-dapp/out/methods/account/getIsLoggedIn';
import { BaseStoreSubscriptionService } from './base-store-subscription.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseStoreSubscriptionService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor() {
    super();
    this.initializeData();
  }

  protected initializeData(): void {
    // Initialize login state from SDK
    const isLoggedIn = getIsLoggedIn();
    this.isLoggedInSubject.next(isLoggedIn);
  }

  protected onStoreChange(): void {
    // React to store changes - keep login state in sync
    const isLoggedIn = getIsLoggedIn();
    if (this.isLoggedInSubject.value !== isLoggedIn) {
      this.isLoggedInSubject.next(isLoggedIn);
    }
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  setLoggedIn(loggedIn: boolean) {
    this.isLoggedInSubject.next(loggedIn);
  }

  async logout() {
    const provider = getAccountProvider();
    await provider.logout();
    this.setLoggedIn(false);
  }

  // Note: ngOnDestroy is handled by BaseStoreSubscriptionService
  // Services are singletons and rarely destroyed, but cleanup is properly handled
} 