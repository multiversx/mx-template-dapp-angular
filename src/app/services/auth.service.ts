import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor() {
    // Initialize login state - you might want to check actual login state here
    this.checkLoginState();
  }

  private checkLoginState() {
    // This is a simplified version - you might need to implement actual state checking
    const provider = getAccountProvider();
    // Add logic to check if user is actually logged in
    // For now, we'll assume false initially
    this.isLoggedInSubject.next(false);
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
} 