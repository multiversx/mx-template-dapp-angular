import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutComponent } from './components/layout.component';
import { AuthService } from './services/auth.service';
import { RouteNamesEnum } from './route-names.enum';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <div class="dashboard-page">
        <h2>Dashboard</h2>
        <button (click)="logout()">Logout</button>
      </div>
    </app-layout>
  `
})
export class DashboardPageComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate([RouteNamesEnum.unlock]);
  }
} 