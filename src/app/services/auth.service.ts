import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MultiversXCoreService } from './multiversx-core.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public readonly isLoggedIn$: Observable<boolean>;

  constructor(private multiversXCore: MultiversXCoreService) {
    this.isLoggedIn$ = this.multiversXCore.isLoggedIn$;
  }

  getIsLoggedIn(): boolean {
    return this.multiversXCore.getCurrentLoginState();
  }

  async logout() {
    const provider = await this.multiversXCore.getProvider();
    await provider.logout();
  }
}
