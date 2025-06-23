import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard-page">
      <h2>Dashboard</h2>
      <button (click)="logout()">Logout</button>
    </div>
  `
})
export class DashboardPageComponent {
  constructor(private router: Router) {}

  async logout() {
    const provider = getAccountProvider();
    await provider.logout();
    this.router.navigate(['/unlock']);
  }
} 