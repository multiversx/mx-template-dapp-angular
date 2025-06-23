import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UnlockPanelManager } from '@multiversx/sdk-dapp/out/managers/UnlockPanelManager';
import { LayoutComponent } from './components/layout.component';
import { AuthService } from './services/auth.service';
import { RouteNamesEnum } from './route-names.enum';

@Component({
  selector: 'app-unlock-page',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <div class="unlock-page">
        <h2>Unlock Page</h2>
        <button (click)="login()">Login with MultiversX</button>
      </div>
    </app-layout>
  `
})
export class UnlockPageComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    const unlockPanelManager = UnlockPanelManager.init({
      loginHandler: () => {
        this.authService.setLoggedIn(true);
        this.router.navigate([RouteNamesEnum.dashboard]);
      },
      onClose: () => {}
    });
    unlockPanelManager.openUnlockPanel();
  }
} 