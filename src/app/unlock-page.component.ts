import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UnlockPanelManager } from '@multiversx/sdk-dapp/out/managers/UnlockPanelManager';

@Component({
  selector: 'app-unlock-page',
  standalone: true,
  template: `
    <div class="unlock-page">
      <h2>Unlock Page</h2>
      <button (click)="login()">Login with MultiversX</button>
    </div>
  `
})
export class UnlockPageComponent {
  constructor(private router: Router) {}

  login() {
    const unlockPanelManager = UnlockPanelManager.init({
      loginHandler: () => {
        this.router.navigate(['/dashboard']);
      },
      onClose: () => {}
    });
    unlockPanelManager.openUnlockPanel();
  }
} 